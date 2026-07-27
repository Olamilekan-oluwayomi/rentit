import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  differenceInCalendarDays,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { useToast } from "../../../shared/contexts/ToastContext";
import { useAvailability } from "../hooks/useAvailability";
import { supabase } from "../../../shared/lib/supabase";

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Checks whether a single date falls within any blocked range.
 * @param {Date} date - The date to check.
 * @param {Array} ranges - Blocked availability rows from Supabase.
 * @returns {boolean} True if the date is blocked.
 */
function isDateBlocked(date, ranges) {
  const ts = date.getTime();
  return ranges.some((r) => {
    const start = new Date(r.start_date).getTime();
    const end = new Date(r.end_date).getTime();
    return ts >= start && ts <= end;
  });
}

/**
 * Check whether ANY day in a proposed range overlaps any blocked entry.
 * Uses eachDayOfInterval to enumerate every calendar day between from
 * and to (inclusive), then short-circuits on the first blocked hit.
 */
function doesRangeOverlapBlocked(from, to, ranges) {
  const days = eachDayOfInterval({ start: from, end: to });
  return days.some((day) => isDateBlocked(day, ranges));
}

/**
 * Custom prev/next month buttons, replacing DayPicker's defaults
 * entirely. We render our own <button> + lucide icon so visibility
 * and styling are fully in our control, rather than depending on
 * the library's internal Chevron slot correctly receiving props.
 * All incoming props (onClick, disabled, aria-*) are forwarded so
 * click handling and accessibility still work correctly.
 */
/** Custom prev button replacing DayPicker default — forwards all props for accessibility. */
function PrevButton(props) {
  return (
    <button
      type="button"
      {...props}
      className="p-1.5 rounded-lg border border-border hover:bg-surface-secondary text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <ChevronLeft size={18} strokeWidth={2.5} />
    </button>
  );
}

/** Custom next button replacing DayPicker default — forwards all props for accessibility. */
function NextButton(props) {
  return (
    <button
      type="button"
      {...props}
      className="p-1.5 rounded-lg border border-border hover:bg-surface-secondary text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <ChevronRight size={18} strokeWidth={2.5} />
    </button>
  );
}

// ── Structural classNames (container/layout elements) ──────────
const CALENDAR_CLASS_NAMES = {
  root: "font-body",
  months: "relative flex flex-col",
  month: "w-full",
  month_grid: "border-collapse table-fixed mx-auto",
  weekday:
    "text-xs font-medium text-text-secondary pb-2 w-9 h-9 sm:w-10 sm:h-10 text-center",
  month_caption: "relative flex items-center justify-center pb-3",
  caption_label: "text-sm font-medium text-text-primary font-heading",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between px-1 z-10",
  day: "p-0 w-9 h-9 sm:w-10 sm:h-10 text-center",
  day_button:
    "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-sm transition-colors mx-auto",
};

// ── State-based classNames (applied via modifiersClassNames) ───
const MODIFIERS_CLASS_NAMES = {
  selected: "!bg-accent !text-white font-medium",
  range_start: "!bg-accent !text-white rounded-l-lg",
  range_end: "!bg-accent !text-white rounded-r-lg",
  range_middle: "!bg-accent/15 !text-accent rounded-none",
  today: "font-bold text-accent ring-1 ring-accent/30 rounded-lg",
  disabled: "text-text-secondary/25 line-through cursor-not-allowed",
  outside: "text-text-secondary/30",
};

export default function AvailabilityCalendar({
  listingId,
  dailyPrice,
  isOwner,
  onRangeConfirmed,
}) {
  const { addToast } = useToast();
  const {
    blockedRanges,
    loading: blockedLoading,
    error: blockedError,
    refetch,
  } = useAvailability(listingId);

  const [selectedRange, setSelectedRange] = useState(undefined);
  const [rangeOverlapError, setRangeOverlapError] = useState("");

  const [blockReason, setBlockReason] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState("");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  /** Returns true if a date is in the past or falls within a blocked range. */
  const isDisabled = useMemo(() => {
    return (date) => {
      if (date < today) return true;
      return isDateBlocked(date, blockedRanges);
    };
  }, [today, blockedRanges]);

  /** Number of nights in the selected range. */
  const nights = useMemo(() => {
    if (!selectedRange?.from || !selectedRange?.to) return 0;
    return differenceInCalendarDays(selectedRange.to, selectedRange.from);
  }, [selectedRange]);

  const totalPrice = nights * dailyPrice;

  /**
   * Wrapped onSelect for DayPicker: intercepts every range selection
   * and rejects it if the proposed range spans any already-blocked date.
   * This prevents the visual "paint-over" bug where clicking a start
   * date before a blocked range and an end date after it would silently
   * accept the invalid selection.
   */
  const handleRangeSelect = (range) => {
    if (range?.from && range?.to) {
      if (doesRangeOverlapBlocked(range.from, range.to, blockedRanges)) {
        setRangeOverlapError(
          "Your selection includes dates that are already unavailable. Please choose a different range."
        );
        return; // reject — do not update state
      }
    }
    setRangeOverlapError("");
    setSelectedRange(range);
  };

  /** Handles owner block: inserts a row into availability and refreshes. */
  const handleBlockDates = async () => {
    setBlockError("");

    if (!selectedRange?.from || !selectedRange?.to) {
      setBlockError("Please select a start and end date on the calendar.");
      return;
    }

    if (selectedRange.to < selectedRange.from) {
      setBlockError("End date must be on or after the start date.");
      return;
    }

    setBlockLoading(true);

    const { error: insertError } = await supabase.from("availability").insert({
      listing_id: listingId,
      start_date: format(selectedRange.from, "yyyy-MM-dd"),
      end_date: format(selectedRange.to, "yyyy-MM-dd"),
      is_blocked: true,
      reason: blockReason.trim() || null,
    });

    setBlockLoading(false);

    if (insertError) {
      addToast(insertError.message, "error");
    } else {
      addToast("Dates blocked successfully.");
      setSelectedRange(undefined);
      setBlockReason("");
      refetch();
    }
  };

  /** Removes a blocked range by id and refreshes the calendar. */
  const handleRemoveRange = async (rangeId) => {
    const { error: deleteError } = await supabase
      .from("availability")
      .delete()
      .eq("id", rangeId);

    if (deleteError) {
      addToast(deleteError.message, "error");
    } else {
      addToast("Blocked dates removed.");
      refetch();
    }
  };

  /** Calls the onRangeConfirmed callback with selected range and total price. */
  const handleRequestToBook = () => {
    if (!selectedRange?.from || !selectedRange?.to) return;
    onRangeConfirmed?.(selectedRange.from, selectedRange.to, totalPrice);
  };

  const ownerRanges = blockedRanges;

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-6">
      <h2 className="text-lg font-heading font-semibold text-text-primary">
        {isOwner ? "Manage Availability" : "Check Availability"}
      </h2>

      <div className="max-w-sm mx-auto">
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={handleRangeSelect}
          disabled={isDisabled}
          defaultMonth={today}
          startMonth={today}
          numberOfMonths={1}
          classNames={CALENDAR_CLASS_NAMES}
          modifiersClassNames={MODIFIERS_CLASS_NAMES}
          components={{
            PreviousMonthButton: PrevButton,
            NextMonthButton: NextButton,
          }}
          showOutsideDays
        />
      </div>

      {!blockedLoading && blockedRanges.length > 0 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          Strikethrough dates are unavailable.
        </div>
      )}

      {rangeOverlapError && (
        <p className="text-xs text-red-500">{rangeOverlapError}</p>
      )}

      {blockedError && <p className="text-xs text-red-500">{blockedError}</p>}

      {isOwner && (
        <div className="space-y-6 pt-4 border-t border-border">
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Select a range on the calendar, optionally add a reason, then
              click to block those dates.
            </p>

            {selectedRange?.from && selectedRange?.to && (
              <p className="text-sm text-text-primary font-medium">
                {format(selectedRange.from, "MMM d, yyyy")} —{" "}
                {format(selectedRange.to, "MMM d, yyyy")}{" "}
                <span className="text-text-secondary font-normal">
                  ({nights} {nights === 1 ? "night" : "nights"})
                </span>
              </p>
            )}

            <input
              type="text"
              autoComplete="off"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason (optional, e.g. Personal use)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            />

            {blockError && <p className="text-xs text-red-500">{blockError}</p>}

            <button
              onClick={handleBlockDates}
              disabled={blockLoading || !selectedRange?.from || !selectedRange?.to}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {blockLoading ? "Blocking..." : "Block these dates"}
            </button>
          </div>

          {ownerRanges.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-primary">
                Blocked dates
              </h3>
              <ul className="space-y-2">
                {ownerRanges.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface-secondary text-sm"
                  >
                    <div className="min-w-0">
                      <p className="text-text-primary">
                        {format(parseISO(r.start_date), "MMM d, yyyy")} —{" "}
                        {format(parseISO(r.end_date), "MMM d, yyyy")}
                      </p>
                      {r.reason && (
                        <p className="text-xs text-text-secondary truncate">
                          {r.reason}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveRange(r.id)}
                      className="shrink-0 px-3 py-1 rounded-lg text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!isOwner && (
        <div className="space-y-4 pt-4 border-t border-border">
          {selectedRange?.from && selectedRange?.to ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-text-secondary">
                  {format(selectedRange.from, "MMM d")} –{" "}
                  {format(selectedRange.to, "MMM d, yyyy")}
                </span>
                <span className="text-text-primary font-medium">
                  {nights} {nights === 1 ? "night" : "nights"}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-text-secondary">
                  ${dailyPrice} × {nights} {nights === 1 ? "night" : "nights"}
                </span>
                <span className="text-lg font-heading font-bold text-accent">
                  ${totalPrice}
                </span>
              </div>

              <motion.button
                onClick={handleRequestToBook}
                whileTap={{ scale: 0.97 }}
                className="w-full px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
              >
                Request to Book
              </motion.button>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              Select a start and end date to see pricing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
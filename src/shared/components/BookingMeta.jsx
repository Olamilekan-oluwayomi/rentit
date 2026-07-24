import { format, parseISO } from "date-fns";

export default function BookingMeta({ booking }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
      <span>
        {format(parseISO(booking.start_date), "MMM d")} – {format(parseISO(booking.end_date), "MMM d, yyyy")}
      </span>
      <span className="font-medium text-text-primary">${booking.total_price}</span>
    </div>
  );
}

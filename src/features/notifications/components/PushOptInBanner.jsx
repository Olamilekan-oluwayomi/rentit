/*
|--------------------------------------------------------------------------
| PushOptInBanner.jsx
|--------------------------------------------------------------------------
|
| Dismissible dashboard banner inviting the user to enable push
| notifications.
|
| Purpose: A lightweight opt-in CTA shown only when the browser hasn't been
|          asked yet (Notification.permission === 'default') and the user
|          hasn't dismissed it. Disappears on its own once enabled.
| Inputs: (none — uses usePushNotifications + useToast internally)
| Outputs: Renders nothing unless eligible
| Side effects: localStorage dismissal flag; calls enable() on CTA click
|
|--------------------------------------------------------------------------
*/

import { Bell, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../design";
import { useToast } from "../../../shared/contexts/ToastContext";
import { usePushNotifications } from "../hooks/usePushNotifications";

const DISMISS_KEY = "rentit_push_banner_dismissed";

function isDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export default function PushOptInBanner() {
  const { supported, permission, enabled, loading, enable } =
    usePushNotifications();
  const { addToast } = useToast();
  const [dismissed, setDismissed] = useState(isDismissed);

  const visible =
    supported && permission === "default" && !enabled && !dismissed;

  if (!visible) return null;

  const handleEnable = async () => {
    const { error } = await enable();
    if (error) {
      addToast(error.message, "error");
    } else {
      addToast("Notifications enabled.", "success");
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // localStorage unavailable — just hide for this session
    }
    setDismissed(true);
  };

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <Bell size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">Stay in the loop</p>
          <p className="text-xs text-text-secondary truncate sm:whitespace-normal">
            Get notified when someone books your gear or sends you a message.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" onClick={handleEnable} loading={loading}>
          Enable
        </Button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss notification prompt"
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

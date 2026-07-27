/*
|--------------------------------------------------------------------------
| DashboardNotifications.jsx
|--------------------------------------------------------------------------
|
| Notifications page for the dashboard. Currently shows a static
| placeholder state — no notifications yet. Notifications will appear
| when someone interacts with the user's listings.
|
| Route: /dashboard/notifications (mounted inside DashboardShell)
| Responsibilities: Display user notifications (placeholder state)
| Dependencies: lucide-react, FadeInSection
| Notes: Notifications system not yet implemented — static empty state only.
|
|--------------------------------------------------------------------------
*/

import { Bell } from "lucide-react";
import FadeInSection from "../../shared/components/FadeInSection";

export default function DashboardNotifications() {
  return (
    <div className="space-y-6">
      <FadeInSection>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              Notifications
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Stay updated on your rentals.
            </p>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-surface border border-border rounded-lg">
          <div className="w-14 h-14 rounded-lg bg-surface-secondary flex items-center justify-center mb-4">
            <Bell size={24} className="text-text-muted" />
          </div>
          <h3 className="text-base font-heading font-semibold text-text-primary mb-1">
            No notifications yet
          </h3>
          <p className="text-sm text-text-secondary text-center max-w-sm">
            Notifications will appear here when someone interacts with your listings — bookings, messages, and other activity.
          </p>
        </div>
      </FadeInSection>
    </div>
  );
}

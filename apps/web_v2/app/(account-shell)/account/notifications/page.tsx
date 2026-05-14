import { PageHeader } from "@/components/shared";
import { NotificationsClient } from "@/components/notifications/notifications-client";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Review recent Tresta notifications from your live account."
      />
      <NotificationsClient />
    </>
  );
}

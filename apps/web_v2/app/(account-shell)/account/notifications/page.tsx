import { PageHeader, PageBody } from "@/components/shared";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { BellIcon } from "@phosphor-icons/react/dist/ssr";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Control how and when Tresta notifies you."
      />
      <PageBody padding="default">
        <Empty className="min-h-[320px] border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BellIcon />
            </EmptyMedia>
            <EmptyTitle>Notification preferences coming soon</EmptyTitle>
            <EmptyDescription>
              Fine-grained notification controls will be available here in an
              upcoming release.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageBody>
    </>
  );
}

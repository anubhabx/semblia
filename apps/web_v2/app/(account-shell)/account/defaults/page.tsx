import { PageHeader, PageBody } from "@/components/shared";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SlidersHorizontalIcon } from "@phosphor-icons/react/dist/ssr";

export default function DefaultsPage() {
  return (
    <>
      <PageHeader
        title="Defaults"
        description="Set default preferences applied to new projects."
      />
      <PageBody padding="default">
        <Empty className="min-h-[320px] border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SlidersHorizontalIcon />
            </EmptyMedia>
            <EmptyTitle>Project defaults coming soon</EmptyTitle>
            <EmptyDescription>
              Global defaults for new projects will be configurable here in an
              upcoming release.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageBody>
    </>
  );
}

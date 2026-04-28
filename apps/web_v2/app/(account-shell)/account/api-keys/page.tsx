import { PageHeader, PageBody } from "@/components/shared";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { KeyIcon } from "@phosphor-icons/react/dist/ssr";

export default function AccountApiKeysPage() {
  return (
    <>
      <PageHeader
        title="API Keys"
        description="Manage API keys for programmatic access to Tresta."
      />
      <PageBody padding="default">
        <Empty className="min-h-[320px] border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <KeyIcon />
            </EmptyMedia>
            <EmptyTitle>API Keys are on their way</EmptyTitle>
            <EmptyDescription>
              User-scoped API keys are being finalized. Full key management will
              appear here once the feature ships.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageBody>
    </>
  );
}

"use client";

/**
 * SdkComingSoon — invisible-by-default stub for /projects/[slug]/developers/sdk.
 *
 * The route exists so that future deep-links and external references resolve,
 * but no nav link points to it. Users who type the URL directly land here.
 *
 * TODO: replace with the real SDK landing page once the generator ships.
 */

import { TerminalWindowIcon } from "@phosphor-icons/react";
import { PageBody } from "@/components/shared";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { DeveloperShell } from "../developer-shell";

export function SdkComingSoon({ slug }: { slug: string }) {
  return (
    <DeveloperShell slug={slug} active="docs">
      <PageBody padding="default" className="overflow-y-auto">
        <div className="px-2 py-6 sm:px-0 sm:py-10">
          <Empty className="border border-dashed py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TerminalWindowIcon weight="bold" />
              </EmptyMedia>
              <EmptyTitle>SDK is in early planning</EmptyTitle>
              <EmptyDescription>
                Official typed SDKs for TypeScript, Python, and Go are on the
                roadmap. In the meantime, the REST API and OpenAPI spec are
                stable and safe to integrate against directly.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </PageBody>
    </DeveloperShell>
  );
}

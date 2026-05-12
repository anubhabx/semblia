import type { ReactNode } from "react";
import Link from "next/link";
import {
  MagnifyingGlass as SearchIcon,
  ArrowRight,
  Folder,
  Link as LinkIcon,
  Plus as PlusIcon,
  ShieldCheck,
  X as XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

// ── Empty state: no search results ─────────────────────────────────────────────

export function EmptySearch({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 px-6 text-center animate-fade-up">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted">
        <SearchIcon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No projects match</p>
      <p className="mt-1 text-xs text-muted-foreground">
        No results for{" "}
        <span className="font-medium text-foreground">
          &ldquo;{query}&rdquo;
        </span>
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 gap-1.5 text-xs"
        onClick={onClear}
      >
        <XIcon className="size-3" />
        Clear search
      </Button>
    </div>
  );
}

// ── Empty state: no projects yet ───────────────────────────────────────────────

export function EmptyProjects() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-16 text-center animate-fade-up sm:py-20">
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-brand/10">
        <Folder className="size-5 text-brand" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        First workspace
      </p>
      <h3 className="mt-2 text-base font-semibold tracking-tight">
        Create a project to start collecting proof
      </h3>
      <p className="mt-2 max-w-[33rem] text-sm leading-relaxed text-muted-foreground">
        A project keeps one product, service, or brand together: collection
        links, moderation, widgets, and the public surfaces your customers will
        see.
      </p>

      <div className="mt-7 grid w-full gap-2 text-left sm:grid-cols-3">
        <EmptyProjectStep
          icon={<PlusIcon className="size-4" />}
          title="Create"
          text="Name the project customers recognize."
        />
        <EmptyProjectStep
          icon={<LinkIcon className="size-4" />}
          title="Collect"
          text="Share the hosted testimonial link."
        />
        <EmptyProjectStep
          icon={<ShieldCheck className="size-4" />}
          title="Review"
          text="Publish only the proof you trust."
        />
      </div>

      <Button size="sm" className="mt-7 gap-1.5" asChild>
        <Link href="/projects/new">
          <PlusIcon className="size-3.5" />
          Create first project
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyProjectStep({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

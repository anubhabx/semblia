"use client";

import * as React from "react";
import { toast } from "sonner";
import type {
  V2ProjectDTO,
  V2ProjectMemberDTO,
  V2ProjectMemberRole,
} from "@workspace/types";
import { PlusIcon, TrashIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBody, SettingsSection } from "@/components/shared";
import {
  useProjectMembers,
  useAddProjectMember,
  useUpdateProjectMember,
  useRemoveProjectMember,
} from "@/hooks/api";

const ROLE_OPTIONS: { value: V2ProjectMemberRole; label: string }[] = [
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "EDITOR", label: "Editor" },
  { value: "VIEWER", label: "Viewer" },
];

const ROLE_LABEL: Record<V2ProjectMemberRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

const ROLE_DESCRIPTION: Record<V2ProjectMemberRole, string> = {
  OWNER: "Full control, including billing and project deletion.",
  ADMIN: "Manages credentials, integrations, and members.",
  EDITOR: "Moderates testimonials and edits forms/widgets.",
  VIEWER: "Read-only access to project content.",
};

function MemberAvatar({ member }: { member: V2ProjectMemberDTO }) {
  const initials =
    (member.user.firstName?.[0] ?? "") + (member.user.lastName?.[0] ?? "");
  const display =
    initials.toUpperCase() || member.user.email[0]?.toUpperCase() || "?";
  if (member.user.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.user.avatar}
        alt=""
        className="size-9 shrink-0 rounded-full border border-border object-cover"
      />
    );
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
      {display}
    </span>
  );
}

function MemberRow({
  member,
  canManage,
  onRoleChange,
  onRemove,
  disabled,
}: {
  member: V2ProjectMemberDTO;
  canManage: boolean;
  onRoleChange: (role: V2ProjectMemberRole) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const displayName =
    [member.user.firstName, member.user.lastName].filter(Boolean).join(" ") ||
    member.user.email;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <MemberAvatar member={member} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {displayName}
        </p>
        <p className="truncate text-[12px] text-muted-foreground">
          {member.user.email}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canManage ? (
          <Select
            value={member.role}
            onValueChange={(v) => onRoleChange(v as V2ProjectMemberRole)}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {ROLE_LABEL[member.role]}
          </span>
        )}
        {canManage && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            aria-label={`Remove ${displayName}`}
          >
            <TrashIcon className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function AddMemberForm({
  slug,
  disabled,
}: {
  slug: string;
  disabled?: boolean;
}) {
  const addMut = useAddProjectMember(slug);
  const [userId, setUserId] = React.useState("");
  const [role, setRole] = React.useState<V2ProjectMemberRole>("EDITOR");

  async function handleAdd() {
    const trimmed = userId.trim();
    if (!trimmed) return;
    try {
      await addMut.mutateAsync({ userId: trimmed, role });
      toast.success("Member added");
      setUserId("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add member";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4">
      <Label htmlFor="m-user-id">Add by user ID</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          id="m-user-id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="user_abc123…"
          className="font-mono text-[12.5px]"
          disabled={disabled || addMut.isPending}
        />
        <Select
          value={role}
          onValueChange={(v) => setRole(v as V2ProjectMemberRole)}
          disabled={disabled || addMut.isPending}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          disabled={disabled || addMut.isPending || !userId.trim()}
          className="gap-1.5 sm:shrink-0"
        >
          <PlusIcon className="size-3.5" />
          {addMut.isPending ? "Adding…" : "Add"}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Paste the Tresta user ID of someone who already has an account. Use the{" "}
        <em>Invite by email</em> flow below once it ships.
      </p>
    </div>
  );
}

function RoleLegend() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Roles
      </p>
      <dl className="mt-2 space-y-1.5">
        {ROLE_OPTIONS.map((opt) => (
          <div key={opt.value} className="flex items-start gap-2 text-[12px]">
            <dt className="w-16 shrink-0 font-medium text-foreground">
              {opt.label}
            </dt>
            <dd className="text-muted-foreground">
              {ROLE_DESCRIPTION[opt.value]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function MembersClient({ project }: { project: V2ProjectDTO }) {
  const slug = project.slug;
  const members = useProjectMembers(slug);
  const updateMut = useUpdateProjectMember(slug);
  const removeMut = useRemoveProjectMember(slug);

  const canManage = project.access.capabilities.includes("MANAGE_MEMBERS");
  const ownerCount = (members.data ?? []).filter(
    (m) => m.role === "OWNER",
  ).length;

  async function handleRoleChange(
    member: V2ProjectMemberDTO,
    role: V2ProjectMemberRole,
  ) {
    if (member.role === role) return;
    if (member.role === "OWNER" && role !== "OWNER" && ownerCount <= 1) {
      toast.error("Project must have at least one owner");
      return;
    }
    try {
      await updateMut.mutateAsync({ userId: member.userId, role });
      toast.success("Role updated");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update role";
      toast.error(message);
    }
  }

  async function handleRemove(member: V2ProjectMemberDTO) {
    if (member.role === "OWNER" && ownerCount <= 1) {
      toast.error("Can't remove the last owner");
      return;
    }
    try {
      await removeMut.mutateAsync(member.userId);
      toast.success("Member removed");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove member";
      toast.error(message);
    }
  }

  return (
    <PageBody padding="default">
      <div className="space-y-8 pb-8">
        <SettingsSection
          id="members"
          title="Project members"
          description={
            canManage
              ? "Invite teammates and tune their access. Project membership is independent from the Clerk organization."
              : "View who has access to this project. Ask an admin to invite or remove members."
          }
        >
          {members.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : members.data && members.data.length > 0 ? (
            <div className="space-y-2">
              {members.data.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  canManage={canManage}
                  onRoleChange={(role) => handleRoleChange(member, role)}
                  onRemove={() => handleRemove(member)}
                  disabled={updateMut.isPending || removeMut.isPending}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
              No members yet.
            </p>
          )}
        </SettingsSection>

        {canManage && (
          <SettingsSection
            id="add-member"
            title="Add a member"
            description="Add someone who already has a Tresta account by their user ID."
          >
            <AddMemberForm slug={slug} disabled={!canManage} />

            <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background">
                <EnvelopeSimpleIcon
                  className="size-3.5 text-muted-foreground"
                  aria-hidden
                />
              </span>
              <div className="text-[12.5px] leading-relaxed">
                <p className="font-medium text-foreground">
                  Invite by email — coming soon
                </p>
                <p className="text-muted-foreground">
                  We&apos;re wiring up an email-based invite flow so you can add
                  members who don&apos;t have a Tresta account yet.
                </p>
              </div>
            </div>
          </SettingsSection>
        )}

        <RoleLegend />
      </div>
    </PageBody>
  );
}

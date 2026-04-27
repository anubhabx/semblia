"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
type EmailAddressResource = NonNullable<
  ReturnType<typeof useUser>["user"]
>["emailAddresses"][number];
import { toast } from "sonner";
import {
  PageHeader,
  PageBody,
  SettingsSection,
  SettingsFooter,
} from "@/components/shared";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DotsThreeIcon, PlusIcon } from "@phosphor-icons/react";

// ── Email verification dialog ──────────────────────────────────────────────────

interface VerifyEmailDialogProps {
  emailAddress: EmailAddressResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

function VerifyEmailDialog({
  emailAddress,
  open,
  onOpenChange,
  onVerified,
}: VerifyEmailDialogProps) {
  const [code, setCode] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (open && emailAddress) {
      setSent(false);
      setCode("");
      emailAddress
        .prepareVerification({ strategy: "email_code" })
        .then(() => setSent(true))
        .catch(() => toast.error("Failed to send verification code."));
    }
  }, [open, emailAddress?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function verify() {
    if (!emailAddress || code.length < 6) return;
    setVerifying(true);
    try {
      await emailAddress.attemptVerification({ code });
      toast.success("Email verified.");
      onVerified();
      onOpenChange(false);
    } catch {
      toast.error("Invalid code. Try again.");
    } finally {
      setVerifying(false);
      setCode("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Verify email address</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-foreground">
              {emailAddress?.emailAddress}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {!sent ? (
            <Skeleton className="h-10 w-48 rounded-md" />
          ) : (
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              onComplete={verify}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={code.length < 6 || verifying || !sent}
            onClick={verify}
          >
            {verifying ? "Verifying…" : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add email dialog ───────────────────────────────────────────────────────────

interface AddEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (email: EmailAddressResource) => void;
}

function AddEmailDialog({ open, onOpenChange, onAdded }: AddEmailDialogProps) {
  const { user } = useUser();
  const [email, setEmail] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  React.useEffect(() => {
    if (open) setEmail("");
  }, [open]);

  async function add() {
    if (!user || !email.trim()) return;
    setAdding(true);
    try {
      const addr = await user.createEmailAddress({ email: email.trim() });
      onAdded(addr);
      onOpenChange(false);
    } catch {
      toast.error("Failed to add email address.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add email address</DialogTitle>
          <DialogDescription>
            We&apos;ll send a verification code to confirm ownership.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 py-2">
          <Label htmlFor="new-email">Email</Label>
          <Input
            id="new-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!email.trim() || adding}
            onClick={add}
          >
            {adding ? "Adding…" : "Add email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Email row ──────────────────────────────────────────────────────────────────

interface EmailRowProps {
  addr: EmailAddressResource;
  isPrimary: boolean;
  onVerify: () => void;
  onMakePrimary: () => void;
  onRemove: () => void;
}

function EmailRow({
  addr,
  isPrimary,
  onVerify,
  onMakePrimary,
  onRemove,
}: EmailRowProps) {
  const verified = addr.verification?.status === "verified";

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-foreground truncate">
          {addr.emailAddress}
        </span>
        {isPrimary && (
          <Badge variant="outline" className="shrink-0 text-[10px]">
            Primary
          </Badge>
        )}
        {verified ? (
          <Badge variant="secondary" className="shrink-0 text-[10px] bg-success/10 text-success border-success/20">
            Verified
          </Badge>
        ) : (
          <Badge variant="destructive" className="shrink-0 text-[10px]">
            Unverified
          </Badge>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7 shrink-0">
            <DotsThreeIcon className="size-4" />
            <span className="sr-only">Email options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {!verified && (
            <DropdownMenuItem onClick={onVerify}>
              Verify
            </DropdownMenuItem>
          )}
          {verified && !isPrimary && (
            <DropdownMenuItem onClick={onMakePrimary}>
              Make primary
            </DropdownMenuItem>
          )}
          {!isPrimary && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onRemove}
              >
                Remove
              </DropdownMenuItem>
            </>
          )}
          {isPrimary && verified && (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground text-xs">Primary email</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Profile page ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  // Name form
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty =
    isLoaded &&
    (firstName !== (user?.firstName ?? "") ||
      lastName !== (user?.lastName ?? ""));

  function discard() {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      toast.success("Profile updated.");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  // Email management
  const [addEmailOpen, setAddEmailOpen] = React.useState(false);
  const [verifyTarget, setVerifyTarget] =
    React.useState<EmailAddressResource | null>(null);
  const [removeTarget, setRemoveTarget] =
    React.useState<EmailAddressResource | null>(null);

  async function makePrimary(addr: EmailAddressResource) {
    try {
      await user?.update({ primaryEmailAddressId: addr.id });
      toast.success("Primary email updated.");
    } catch {
      toast.error("Failed to update primary email.");
    }
  }

  async function removeEmail() {
    if (!removeTarget) return;
    try {
      await removeTarget.destroy();
      toast.success("Email removed.");
    } catch {
      toast.error("Failed to remove email.");
    } finally {
      setRemoveTarget(null);
    }
  }

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
    "?";

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal information." />

      <PageBody padding="default" className="space-y-8 pb-24">
        {/* Avatar */}
        <SettingsSection id="avatar" title="Photo" staggerIndex={0}>
          <Card>
            <CardContent className="flex items-center gap-5 pt-0">
              {!isLoaded ? (
                <Skeleton className="size-16 rounded-full" />
              ) : (
                <AvatarUpload imageUrl={user?.imageUrl} initials={initials} />
              )}
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {isLoaded ? (
                    user?.fullName || "—"
                  ) : (
                    <Skeleton className="h-4 w-32" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isLoaded ? (
                    user?.primaryEmailAddress?.emailAddress ?? ""
                  ) : (
                    <Skeleton className="h-3 w-48" />
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </SettingsSection>

        {/* Name */}
        <SettingsSection
          id="name"
          title="Personal info"
          description="Your name is shown on your profile and in notifications sent to collaborators."
          staggerIndex={1}
        >
          <Card>
            <CardContent className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="first-name">First name</Label>
                {!isLoaded ? (
                  <Skeleton className="h-9 w-full rounded-md" />
                ) : (
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last-name">Last name</Label>
                {!isLoaded ? (
                  <Skeleton className="h-9 w-full rounded-md" />
                ) : (
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </SettingsSection>

        {/* Emails */}
        <SettingsSection
          id="emails"
          title="Email addresses"
          description="Sign in with any verified email. Primary address receives account notifications."
          staggerIndex={2}
        >
          <Card>
            <CardHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Email addresses</CardTitle>
                  <CardDescription className="text-xs">
                    {isLoaded
                      ? `${user?.emailAddresses.length ?? 0} address${(user?.emailAddresses.length ?? 0) === 1 ? "" : "es"}`
                      : ""}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddEmailOpen(true)}
                  disabled={!isLoaded}
                >
                  <PlusIcon className="size-3.5 mr-1" />
                  Add email
                </Button>
              </div>
            </CardHeader>

            <div className="divide-y divide-border">
              {!isLoaded
                ? Array.from({ length: 1 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))
                : user?.emailAddresses.map((addr) => (
                    <EmailRow
                      key={addr.id}
                      addr={addr}
                      isPrimary={
                        addr.id === user.primaryEmailAddress?.id
                      }
                      onVerify={() => setVerifyTarget(addr)}
                      onMakePrimary={() => makePrimary(addr)}
                      onRemove={() => setRemoveTarget(addr)}
                    />
                  ))}
            </div>
          </Card>
        </SettingsSection>
      </PageBody>

      <SettingsFooter
        dirty={dirty}
        saving={saving}
        onSave={save}
        onDiscard={discard}
      />

      <AddEmailDialog
        open={addEmailOpen}
        onOpenChange={setAddEmailOpen}
        onAdded={(addr) => setVerifyTarget(addr)}
      />

      <VerifyEmailDialog
        emailAddress={verifyTarget}
        open={!!verifyTarget}
        onOpenChange={(o) => !o && setVerifyTarget(null)}
        onVerified={() => setVerifyTarget(null)}
      />

      <ConfirmationDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        intent="danger"
        title="Remove email address"
        description={
          <>
            Remove{" "}
            <span className="font-medium text-foreground">
              {removeTarget?.emailAddress}
            </span>{" "}
            from your account? This cannot be undone.
          </>
        }
        confirmLabel="Remove"
        onConfirm={removeEmail}
      />
    </>
  );
}

CREATE TYPE "ProjectMemberInviteStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'REVOKED',
  'EXPIRED'
);

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_INVITE_RECEIVED';

CREATE TABLE "ProjectMemberInvite" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "role" "MemberRole" NOT NULL,
  "status" "ProjectMemberInviteStatus" NOT NULL DEFAULT 'PENDING',
  "invitedByUserId" TEXT,
  "acceptedByUserId" TEXT,
  "acceptedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '14 days'),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProjectMemberInvite_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProjectMemberInvite"
  ADD CONSTRAINT "ProjectMemberInvite_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectMemberInvite"
  ADD CONSTRAINT "ProjectMemberInvite_invitedByUserId_fkey"
  FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProjectMemberInvite"
  ADD CONSTRAINT "ProjectMemberInvite_acceptedByUserId_fkey"
  FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ProjectMemberInvite_pending_project_email_key"
  ON "ProjectMemberInvite"("projectId", "email")
  WHERE "status" = 'PENDING';

CREATE INDEX "ProjectMemberInvite_email_status_idx"
  ON "ProjectMemberInvite"("email", "status");

CREATE INDEX "ProjectMemberInvite_projectId_idx"
  ON "ProjectMemberInvite"("projectId");

CREATE INDEX "ProjectMemberInvite_invitedByUserId_idx"
  ON "ProjectMemberInvite"("invitedByUserId");

CREATE INDEX "ProjectMemberInvite_acceptedByUserId_idx"
  ON "ProjectMemberInvite"("acceptedByUserId");

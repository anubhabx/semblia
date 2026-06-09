CREATE TYPE "ProjectOwnershipTransferStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'CANCELLED',
  'EXPIRED'
);

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_TRANSFER_REQUESTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_TRANSFER_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_TRANSFER_DECLINED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_TRANSFER_CANCELLED';

CREATE TABLE "ProjectOwnershipTransfer" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "fromUserId" TEXT NOT NULL,
  "toUserId" TEXT NOT NULL,
  "status" "ProjectOwnershipTransferStatus" NOT NULL DEFAULT 'PENDING',
  "initiatedByUserId" TEXT,
  "respondedByUserId" TEXT,
  "respondedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '72 hours'),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProjectOwnershipTransfer_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProjectOwnershipTransfer"
  ADD CONSTRAINT "ProjectOwnershipTransfer_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectOwnershipTransfer"
  ADD CONSTRAINT "ProjectOwnershipTransfer_fromUserId_fkey"
  FOREIGN KEY ("fromUserId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectOwnershipTransfer"
  ADD CONSTRAINT "ProjectOwnershipTransfer_toUserId_fkey"
  FOREIGN KEY ("toUserId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectOwnershipTransfer"
  ADD CONSTRAINT "ProjectOwnershipTransfer_initiatedByUserId_fkey"
  FOREIGN KEY ("initiatedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProjectOwnershipTransfer"
  ADD CONSTRAINT "ProjectOwnershipTransfer_respondedByUserId_fkey"
  FOREIGN KEY ("respondedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ProjectOwnershipTransfer_pending_project_key"
  ON "ProjectOwnershipTransfer"("projectId")
  WHERE "status" = 'PENDING';

CREATE INDEX "ProjectOwnershipTransfer_projectId_idx"
  ON "ProjectOwnershipTransfer"("projectId");

CREATE INDEX "ProjectOwnershipTransfer_toUserId_status_idx"
  ON "ProjectOwnershipTransfer"("toUserId", "status");

CREATE INDEX "ProjectOwnershipTransfer_fromUserId_idx"
  ON "ProjectOwnershipTransfer"("fromUserId");

CREATE INDEX "ProjectOwnershipTransfer_initiatedByUserId_idx"
  ON "ProjectOwnershipTransfer"("initiatedByUserId");

CREATE INDEX "ProjectOwnershipTransfer_respondedByUserId_idx"
  ON "ProjectOwnershipTransfer"("respondedByUserId");

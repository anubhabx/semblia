-- AlterEnum
ALTER TYPE "MediaAssetPurpose" ADD VALUE 'SUBMISSION_ATTACHMENT';

-- CreateEnum
CREATE TYPE "SubmissionModerationRunStatus" AS ENUM ('PENDING', 'ENQUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'SUPPRESSED');

-- CreateEnum
CREATE TYPE "SubmissionModerationArtifactType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'VIDEO_FRAME', 'TRANSCRIPT');

-- CreateEnum
CREATE TYPE "SubmissionModerationDecision" AS ENUM ('APPROVE', 'REVIEW', 'REJECT');

-- CreateTable
CREATE TABLE "SubmissionModerationRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "testimonialId" TEXT,
    "mediaAssetId" TEXT,
    "artifactType" "SubmissionModerationArtifactType" NOT NULL,
    "artifactHash" VARCHAR(64) NOT NULL,
    "provider" VARCHAR(64) NOT NULL,
    "providerOperation" VARCHAR(128) NOT NULL,
    "providerJobId" VARCHAR(255),
    "status" "SubmissionModerationRunStatus" NOT NULL DEFAULT 'PENDING',
    "decision" "SubmissionModerationDecision",
    "score" DOUBLE PRECISION,
    "flags" JSONB,
    "categories" JSONB,
    "rawResult" JSONB,
    "estimatedCostMicros" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorCode" VARCHAR(128),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionModerationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionModerationRun_submissionId_artifactType_artifactHash_provider_providerOperation_key" ON "SubmissionModerationRun"("submissionId", "artifactType", "artifactHash", "provider", "providerOperation");

-- CreateIndex
CREATE INDEX "SubmissionModerationRun_projectId_status_createdAt_idx" ON "SubmissionModerationRun"("projectId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SubmissionModerationRun_submissionId_createdAt_idx" ON "SubmissionModerationRun"("submissionId", "createdAt");

-- CreateIndex
CREATE INDEX "SubmissionModerationRun_mediaAssetId_idx" ON "SubmissionModerationRun"("mediaAssetId");

-- CreateIndex
CREATE INDEX "SubmissionModerationRun_provider_providerJobId_idx" ON "SubmissionModerationRun"("provider", "providerJobId");

-- CreateIndex
CREATE INDEX "SubmissionModerationRun_nextAttemptAt_status_idx" ON "SubmissionModerationRun"("nextAttemptAt", "status");

-- AddForeignKey
ALTER TABLE "SubmissionModerationRun" ADD CONSTRAINT "SubmissionModerationRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionModerationRun" ADD CONSTRAINT "SubmissionModerationRun_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CollectionFormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionModerationRun" ADD CONSTRAINT "SubmissionModerationRun_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "Testimonial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionModerationRun" ADD CONSTRAINT "SubmissionModerationRun_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

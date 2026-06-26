-- CreateEnum
CREATE TYPE "FormIntent" AS ENUM ('TESTIMONIAL', 'REVIEW', 'PRODUCT_FEEDBACK', 'CUSTOMER_STORY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormVersionStatus" AS ENUM ('PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormResponseTrustMode" AS ENUM ('ORIGIN', 'HMAC');

-- CreateEnum
CREATE TYPE "FormResponseReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SPAM', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormResponsePublishStatus" AS ENUM ('PRIVATE', 'PUBLISHABLE', 'PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "FormModerationRunStatus" AS ENUM ('PENDING', 'ENQUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'SUPPRESSED');

-- CreateEnum
CREATE TYPE "FormModerationArtifactType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'VIDEO_FRAME', 'TRANSCRIPT');

-- CreateEnum
CREATE TYPE "FormModerationDecision" AS ENUM ('APPROVE', 'REVIEW', 'REJECT');

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "formId" TEXT,
ADD COLUMN     "responseId" TEXT;

-- AlterTable
ALTER TABLE "ProjectMemberInvite" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '14 days');

-- AlterTable
ALTER TABLE "ProjectOwnershipTransfer" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '72 hours');

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "intent" "FormIntent" NOT NULL DEFAULT 'CUSTOM',
    "name" VARCHAR(255) NOT NULL DEFAULT 'Untitled form',
    "slug" VARCHAR(255),
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "open" BOOLEAN NOT NULL DEFAULT true,
    "draft" JSONB NOT NULL,
    "draftVersion" INTEGER NOT NULL DEFAULT 1,
    "currentVersion" INTEGER,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormVersion" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "slug" VARCHAR(255),
    "version" INTEGER NOT NULL,
    "schemaVersion" VARCHAR(32) NOT NULL,
    "rendererVersion" VARCHAR(32) NOT NULL,
    "coreVersion" VARCHAR(32) NOT NULL,
    "status" "FormVersionStatus" NOT NULL DEFAULT 'PUBLISHED',
    "snapshot" JSONB NOT NULL,
    "checksum" VARCHAR(128) NOT NULL,
    "previewImageUrl" VARCHAR(1000),
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponse" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "trustMode" "FormResponseTrustMode" NOT NULL,
    "trustedOriginId" TEXT,
    "signingSecretId" TEXT,
    "idempotencyKey" VARCHAR(255),
    "payloadHash" VARCHAR(64),
    "answers" JSONB NOT NULL,
    "ratingValue" SMALLINT,
    "ratingScale" SMALLINT,
    "authorName" VARCHAR(255),
    "authorRole" VARCHAR(255),
    "authorCompany" VARCHAR(255),
    "authorAvatarAssetId" TEXT,
    "consent" JSONB,
    "reviewStatus" "FormResponseReviewStatus" NOT NULL DEFAULT 'PENDING',
    "publishStatus" "FormResponsePublishStatus" NOT NULL DEFAULT 'PRIVATE',
    "moderationReason" TEXT,
    "moderatedByActorType" VARCHAR(32),
    "moderatedByActorId" VARCHAR(255),
    "moderatedAt" TIMESTAMP(3),
    "sourceMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponsePrivateMetadata" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "authorEmailEncrypted" TEXT,
    "authorEmailHash" VARCHAR(128),
    "ipAddressEncrypted" TEXT,
    "ipAddressHash" VARCHAR(128),
    "userAgentEncrypted" TEXT,
    "userAgentHash" VARCHAR(128),
    "retentionUntil" TIMESTAMP(3),
    "consentSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormResponsePrivateMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponseAnnotation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "actorType" VARCHAR(32) NOT NULL,
    "actorId" VARCHAR(255),
    "note" TEXT,
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sentiment" VARCHAR(64),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormResponseAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormModerationRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "artifactType" "FormModerationArtifactType" NOT NULL,
    "artifactHash" VARCHAR(64) NOT NULL,
    "provider" VARCHAR(64) NOT NULL,
    "providerOperation" VARCHAR(128) NOT NULL,
    "providerJobId" VARCHAR(255),
    "status" "FormModerationRunStatus" NOT NULL DEFAULT 'PENDING',
    "decision" "FormModerationDecision",
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

    CONSTRAINT "FormModerationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormView" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "formId" TEXT,
    "versionId" TEXT,
    "surface" VARCHAR(32),
    "ipAddress" VARCHAR(255),
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmitIdempotency" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "formId" TEXT,
    "idempotencyKey" VARCHAR(255) NOT NULL,
    "payloadHash" VARCHAR(64) NOT NULL,
    "responseId" TEXT,
    "responseStatusCode" INTEGER NOT NULL,
    "responseBody" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmitIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Form_projectId_idx" ON "Form"("projectId");

-- CreateIndex
CREATE INDEX "Form_projectId_status_idx" ON "Form"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Form_projectId_slug_key" ON "Form"("projectId", "slug");

-- CreateIndex
CREATE INDEX "FormVersion_projectId_idx" ON "FormVersion"("projectId");

-- CreateIndex
CREATE INDEX "FormVersion_formId_status_idx" ON "FormVersion"("formId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FormVersion_formId_version_key" ON "FormVersion"("formId", "version");

-- CreateIndex
CREATE INDEX "FormResponse_projectId_createdAt_idx" ON "FormResponse"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "FormResponse_formId_createdAt_idx" ON "FormResponse"("formId", "createdAt");

-- CreateIndex
CREATE INDEX "FormResponse_projectId_formId_createdAt_idx" ON "FormResponse"("projectId", "formId", "createdAt");

-- CreateIndex
CREATE INDEX "FormResponse_projectId_reviewStatus_createdAt_idx" ON "FormResponse"("projectId", "reviewStatus", "createdAt");

-- CreateIndex
CREATE INDEX "FormResponse_projectId_publishStatus_createdAt_idx" ON "FormResponse"("projectId", "publishStatus", "createdAt");

-- CreateIndex
CREATE INDEX "FormResponse_versionId_idx" ON "FormResponse"("versionId");

-- CreateIndex
CREATE INDEX "FormResponse_trustedOriginId_idx" ON "FormResponse"("trustedOriginId");

-- CreateIndex
CREATE INDEX "FormResponse_signingSecretId_idx" ON "FormResponse"("signingSecretId");

-- CreateIndex
CREATE UNIQUE INDEX "FormResponsePrivateMetadata_responseId_key" ON "FormResponsePrivateMetadata"("responseId");

-- CreateIndex
CREATE INDEX "FormResponsePrivateMetadata_authorEmailHash_idx" ON "FormResponsePrivateMetadata"("authorEmailHash");

-- CreateIndex
CREATE INDEX "FormResponsePrivateMetadata_ipAddressHash_idx" ON "FormResponsePrivateMetadata"("ipAddressHash");

-- CreateIndex
CREATE INDEX "FormResponsePrivateMetadata_retentionUntil_idx" ON "FormResponsePrivateMetadata"("retentionUntil");

-- CreateIndex
CREATE INDEX "FormResponseAnnotation_projectId_createdAt_idx" ON "FormResponseAnnotation"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "FormResponseAnnotation_responseId_createdAt_idx" ON "FormResponseAnnotation"("responseId", "createdAt");

-- CreateIndex
CREATE INDEX "FormResponseAnnotation_actorType_actorId_idx" ON "FormResponseAnnotation"("actorType", "actorId");

-- CreateIndex
CREATE INDEX "FormModerationRun_projectId_status_createdAt_idx" ON "FormModerationRun"("projectId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "FormModerationRun_responseId_createdAt_idx" ON "FormModerationRun"("responseId", "createdAt");

-- CreateIndex
CREATE INDEX "FormModerationRun_mediaAssetId_idx" ON "FormModerationRun"("mediaAssetId");

-- CreateIndex
CREATE INDEX "FormModerationRun_provider_providerJobId_idx" ON "FormModerationRun"("provider", "providerJobId");

-- CreateIndex
CREATE INDEX "FormModerationRun_nextAttemptAt_status_idx" ON "FormModerationRun"("nextAttemptAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FormModerationRun_responseId_artifactType_artifactHash_prov_key" ON "FormModerationRun"("responseId", "artifactType", "artifactHash", "provider", "providerOperation");

-- CreateIndex
CREATE INDEX "FormView_projectId_timestamp_idx" ON "FormView"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "FormView_formId_timestamp_idx" ON "FormView"("formId", "timestamp");

-- CreateIndex
CREATE INDEX "FormSubmitIdempotency_responseId_idx" ON "FormSubmitIdempotency"("responseId");

-- CreateIndex
CREATE INDEX "FormSubmitIdempotency_expiresAt_idx" ON "FormSubmitIdempotency"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmitIdempotency_projectId_formId_idempotencyKey_key" ON "FormSubmitIdempotency"("projectId", "formId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "MediaAsset_formId_idx" ON "MediaAsset"("formId");

-- CreateIndex
CREATE INDEX "MediaAsset_responseId_idx" ON "MediaAsset"("responseId");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormVersion" ADD CONSTRAINT "FormVersion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormVersion" ADD CONSTRAINT "FormVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "FormVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_trustedOriginId_fkey" FOREIGN KEY ("trustedOriginId") REFERENCES "ProjectTrustedOrigin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_signingSecretId_fkey" FOREIGN KEY ("signingSecretId") REFERENCES "ProjectSigningSecret"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponsePrivateMetadata" ADD CONSTRAINT "FormResponsePrivateMetadata_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponseAnnotation" ADD CONSTRAINT "FormResponseAnnotation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponseAnnotation" ADD CONSTRAINT "FormResponseAnnotation_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormModerationRun" ADD CONSTRAINT "FormModerationRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormModerationRun" ADD CONSTRAINT "FormModerationRun_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormModerationRun" ADD CONSTRAINT "FormModerationRun_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormView" ADD CONSTRAINT "FormView_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormView" ADD CONSTRAINT "FormView_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmitIdempotency" ADD CONSTRAINT "FormSubmitIdempotency_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmitIdempotency" ADD CONSTRAINT "FormSubmitIdempotency_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

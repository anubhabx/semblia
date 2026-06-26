-- DropForeignKey
ALTER TABLE "CollectionForm" DROP CONSTRAINT "CollectionForm_projectId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionFormSubmission" DROP CONSTRAINT "CollectionFormSubmission_formId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionFormSubmission" DROP CONSTRAINT "CollectionFormSubmission_projectId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionFormSubmission" DROP CONSTRAINT "CollectionFormSubmission_signingSecretId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionFormSubmission" DROP CONSTRAINT "CollectionFormSubmission_trustedOriginId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionFormSubmissionAnnotation" DROP CONSTRAINT "CollectionFormSubmissionAnnotation_projectId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionFormSubmissionAnnotation" DROP CONSTRAINT "CollectionFormSubmissionAnnotation_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "FormImpression" DROP CONSTRAINT "FormImpression_formId_fkey";

-- DropForeignKey
ALTER TABLE "FormImpression" DROP CONSTRAINT "FormImpression_projectId_fkey";

-- DropForeignKey
ALTER TABLE "MediaAsset" DROP CONSTRAINT "MediaAsset_formId_fkey";

-- DropForeignKey
ALTER TABLE "MediaAsset" DROP CONSTRAINT "MediaAsset_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "PublicSubmitIdempotency" DROP CONSTRAINT "PublicSubmitIdempotency_projectId_fkey";

-- DropForeignKey
ALTER TABLE "PublicSubmitIdempotency" DROP CONSTRAINT "PublicSubmitIdempotency_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionModerationRun" DROP CONSTRAINT "SubmissionModerationRun_mediaAssetId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionModerationRun" DROP CONSTRAINT "SubmissionModerationRun_projectId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionModerationRun" DROP CONSTRAINT "SubmissionModerationRun_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionPrivateMetadata" DROP CONSTRAINT "SubmissionPrivateMetadata_submissionId_fkey";

-- DropIndex
DROP INDEX "MediaAsset_formId_idx";

-- DropIndex
DROP INDEX "MediaAsset_submissionId_idx";

-- AlterTable
ALTER TABLE "MediaAsset" DROP COLUMN "formId",
DROP COLUMN "submissionId";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "collectionFormUrl",
DROP COLUMN "formConfig";

-- AlterTable
ALTER TABLE "ProjectMemberInvite" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '14 days');

-- AlterTable
ALTER TABLE "ProjectOwnershipTransfer" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '72 hours');

-- DropTable
DROP TABLE "CollectionForm";

-- DropTable
DROP TABLE "CollectionFormSubmission";

-- DropTable
DROP TABLE "CollectionFormSubmissionAnnotation";

-- DropTable
DROP TABLE "FormImpression";

-- DropTable
DROP TABLE "PublicSubmitIdempotency";

-- DropTable
DROP TABLE "SubmissionModerationRun";

-- DropTable
DROP TABLE "SubmissionPrivateMetadata";

-- DropEnum
DROP TYPE "ModerationStatus";

-- DropEnum
DROP TYPE "PublicSubmitSurface";

-- DropEnum
DROP TYPE "PublicSubmitTrustMode";

-- DropEnum
DROP TYPE "SubmissionModerationArtifactType";

-- DropEnum
DROP TYPE "SubmissionModerationDecision";

-- DropEnum
DROP TYPE "SubmissionModerationRunStatus";

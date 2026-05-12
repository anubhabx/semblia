CREATE TYPE "UserOnboardingStep" AS ENUM (
  'PROFILE',
  'REFERRAL',
  'INTENT',
  'PROJECT',
  'COLLECTION',
  'COMPLETED'
);

ALTER TABLE "User"
  ADD COLUMN "onboardingStep" "UserOnboardingStep" NOT NULL DEFAULT 'PROFILE',
  ADD COLUMN "onboardingData" JSONB;

UPDATE "User"
SET "onboardingStep" = 'COMPLETED'
WHERE "onboardingCompletedAt" IS NOT NULL;

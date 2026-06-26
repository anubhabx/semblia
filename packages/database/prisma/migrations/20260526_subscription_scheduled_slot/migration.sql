ALTER TABLE "Subscription" ADD COLUMN "scheduledRazorpaySubscriptionId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "scheduledPlanId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "scheduledStartAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Subscription_scheduledRazorpaySubscriptionId_key" ON "Subscription"("scheduledRazorpaySubscriptionId");
CREATE INDEX "Subscription_scheduledPlanId_idx" ON "Subscription"("scheduledPlanId");

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_scheduledPlanId_fkey" FOREIGN KEY ("scheduledPlanId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

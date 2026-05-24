CREATE TEMP TABLE "_plan_type_keep" AS
SELECT
  "id",
  "type",
  FIRST_VALUE("id") OVER (
    PARTITION BY "type"
    ORDER BY
      CASE WHEN "isActive" THEN 0 ELSE 1 END,
      CASE WHEN "interval" = 'month' THEN 0 ELSE 1 END,
      "createdAt" DESC,
      "id"
  ) AS "keep_id",
  ROW_NUMBER() OVER (
    PARTITION BY "type"
    ORDER BY
      CASE WHEN "isActive" THEN 0 ELSE 1 END,
      CASE WHEN "interval" = 'month' THEN 0 ELSE 1 END,
      "createdAt" DESC,
      "id"
  ) AS "rank"
FROM "Plan";

UPDATE "Subscription" AS "subscription"
SET "planId" = "plan_keep"."keep_id"
FROM "_plan_type_keep" AS "plan_keep"
WHERE "subscription"."planId" = "plan_keep"."id"
  AND "plan_keep"."rank" > 1;

UPDATE "SubscriptionPayment" AS "payment"
SET "planId" = "plan_keep"."keep_id"
FROM "_plan_type_keep" AS "plan_keep"
WHERE "payment"."planId" = "plan_keep"."id"
  AND "plan_keep"."rank" > 1;

DELETE FROM "Plan" AS "plan"
USING "_plan_type_keep" AS "plan_keep"
WHERE "plan"."id" = "plan_keep"."id"
  AND "plan_keep"."rank" > 1;

DROP TABLE "_plan_type_keep";

CREATE UNIQUE INDEX "Plan_type_key" ON "Plan"("type");

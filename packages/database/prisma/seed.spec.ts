import { describe, expect, it, vi } from "vitest";
import { UserPlan } from "../dist/prisma.js";
import { buildBillingPlans, seedBillingPlans } from "./seed.js";

describe("billing plan seed", () => {
  it("builds the three launch plans with Razorpay IDs from env", () => {
    const plans = buildBillingPlans({
      RAZORPAY_PLAN_ID_PRO_MONTHLY: "plan_pro_monthly",
      RAZORPAY_PLAN_ID_BUSINESS_MONTHLY: "plan_business_monthly",
    });

    expect(plans).toEqual([
      expect.objectContaining({
        type: UserPlan.FREE,
        price: 0,
        currency: "INR",
        interval: "month",
        limits: { testimonials: 25, widgets: 1, projects: 1 },
        razorpayPlanId: null,
      }),
      expect.objectContaining({
        type: UserPlan.PRO,
        price: 79900,
        currency: "INR",
        interval: "month",
        limits: { testimonials: 1000, widgets: 10, projects: 5 },
        razorpayPlanId: "plan_pro_monthly",
      }),
      expect.objectContaining({
        type: UserPlan.BUSINESS,
        price: 249900,
        currency: "INR",
        interval: "month",
        limits: { testimonials: 10000, widgets: 100, projects: 25 },
        razorpayPlanId: "plan_business_monthly",
      }),
    ]);
  });

  it("upserts plans by type", async () => {
    const upsert = vi.fn(async ({ create }) => create);
    const prisma = {
      plan: { upsert },
    };

    const rows = await seedBillingPlans(prisma, {
      RAZORPAY_PLAN_ID_PRO_MONTHLY: "plan_pro_monthly",
      RAZORPAY_PLAN_ID_BUSINESS_MONTHLY: "plan_business_monthly",
    });

    expect(rows).toHaveLength(3);
    expect(upsert).toHaveBeenCalledTimes(3);
    expect(upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { type: UserPlan.PRO },
        create: expect.objectContaining({
          type: UserPlan.PRO,
          razorpayPlanId: "plan_pro_monthly",
        }),
        update: expect.objectContaining({
          price: 79900,
          razorpayPlanId: "plan_pro_monthly",
        }),
      }),
    );
    expect(upsert).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        where: { type: UserPlan.BUSINESS },
        create: expect.objectContaining({
          type: UserPlan.BUSINESS,
          razorpayPlanId: "plan_business_monthly",
        }),
      }),
    );
  });
});

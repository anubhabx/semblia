import { pathToFileURL } from "node:url";
import { PrismaClient, UserPlan } from "../dist/prisma.js";

type BillingPlanSeedEnv = {
  RAZORPAY_PLAN_ID_PRO_MONTHLY?: string;
  RAZORPAY_PLAN_ID_BUSINESS_MONTHLY?: string;
};

type BillingPlanSeedRow = {
  name: string;
  description: string;
  price: number;
  currency: "INR";
  interval: "month";
  type: UserPlan;
  isActive: true;
  limits: {
    testimonials: number;
    widgets: number;
    projects: number;
  };
  razorpayPlanId: string | null;
};

type BillingPlanSeedPrisma = {
  plan: {
    upsert(input: {
      where: { type: UserPlan };
      create: BillingPlanSeedRow;
      update: BillingPlanSeedRow;
    }): Promise<unknown>;
  };
};

export function buildBillingPlans(
  env: BillingPlanSeedEnv = process.env,
): BillingPlanSeedRow[] {
  return [
    {
      name: "Free",
      description: "Baseline plan for getting started",
      price: 0,
      currency: "INR",
      interval: "month",
      type: UserPlan.FREE,
      isActive: true,
      limits: {
        testimonials: 25,
        widgets: 1,
        projects: 1,
      },
      razorpayPlanId: null,
    },
    {
      name: "Pro",
      description: "For growing teams collecting more testimonials",
      price: 79900,
      currency: "INR",
      interval: "month",
      type: UserPlan.PRO,
      isActive: true,
      limits: {
        testimonials: 1000,
        widgets: 10,
        projects: 5,
      },
      razorpayPlanId: env.RAZORPAY_PLAN_ID_PRO_MONTHLY?.trim() || null,
    },
    {
      name: "Business",
      description: "For high-volume teams and agencies",
      price: 249900,
      currency: "INR",
      interval: "month",
      type: UserPlan.BUSINESS,
      isActive: true,
      limits: {
        testimonials: 10000,
        widgets: 100,
        projects: 25,
      },
      razorpayPlanId:
        env.RAZORPAY_PLAN_ID_BUSINESS_MONTHLY?.trim() || null,
    },
  ];
}

export async function seedBillingPlans(
  prisma: BillingPlanSeedPrisma,
  env: BillingPlanSeedEnv = process.env,
) {
  const plans = buildBillingPlans(env);
  const rows = [];

  for (const plan of plans) {
    const row = await prisma.plan.upsert({
      where: { type: plan.type },
      create: plan,
      update: plan,
    });
    rows.push(row);
  }

  return rows;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("Start seeding ...");
    const plans = await seedBillingPlans(prisma);
    console.log(`Seeded ${plans.length} billing plans.`);
    console.log("Seeding finished.");
  } finally {
    await prisma.$disconnect();
  }
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}

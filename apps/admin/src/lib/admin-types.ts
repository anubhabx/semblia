// Local copies of the admin API contract.
// TODO: replace with imports from @workspace/types once A3 publishes shared schemas.

export interface AdminMe {
  id: string;
  email: string;
  isActive: boolean;
  grantedAt: string;
  lastLoginAt: string | null;
}

export type PlanType = "FREE" | "PRO" | "BUSINESS";
export type PlanInterval = "monthly" | "yearly";

export interface AdminPlan {
  id: string;
  type: PlanType;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: PlanInterval | string;
  isActive: boolean;
  razorpayPlanId: string | null;
  limits: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanBody {
  type: PlanType;
  name: string;
  description?: string;
  price: number;
  currency: "INR";
  interval: PlanInterval;
  limits: Record<string, number>;
}

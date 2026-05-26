import Link from "next/link";
import { adminGet } from "@/lib/api";
import type { AdminPlan } from "@/lib/admin-types";

function formatPrice(plan: AdminPlan): string {
  if (plan.price === 0) return "Free";
  const major = plan.price / 100;
  return `${plan.currency} ${major.toLocaleString()} / ${plan.interval}`;
}

export default async function PlansPage() {
  const plans = await adminGet<AdminPlan[]>("/admin/plans");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Plans</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Subscription plans. Creating a paid plan syncs it to Razorpay and
            stores the returned plan ID. Plans are immutable on Razorpay — edit
            by deactivating + creating a new one.
          </p>
        </div>
        <Link
          href="/plans/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New plan
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Razorpay ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {plans.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  No plans yet. Create one to get started.
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {plan.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                    {plan.type}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatPrice(plan)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                    {plan.razorpayPlanId ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        plan.isActive
                          ? "rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600"
                      }
                    >
                      {plan.isActive ? "active" : "inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

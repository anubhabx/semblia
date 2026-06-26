import Link from "next/link";
import { adminGet } from "@/lib/api";
import type { AdminPlan } from "@/lib/admin-types";
import { deactivatePlanAction } from "./actions";

type StatusFilter = "all" | "active" | "inactive";

function parseStatusFilter(value: string | string[] | undefined): StatusFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "active" || raw === "inactive" || raw === "all") return raw;
  return "active";
}

function formatPrice(plan: AdminPlan): string {
  if (plan.price === 0) return "Free";
  const major = plan.price / 100;
  return `${plan.currency} ${major.toLocaleString()} / ${plan.interval}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function summarizeLimits(limits: Record<string, unknown>): Array<[string, string]> {
  return Object.entries(limits).map(([key, value]) => [key, String(value)]);
}

export default async function PlansPage(props: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status } = await props.searchParams;
  const filter = parseStatusFilter(status);

  const all = await adminGet<AdminPlan[]>("/admin/plans");
  const plans = all.filter((plan) => {
    if (filter === "active") return plan.isActive;
    if (filter === "inactive") return !plan.isActive;
    return true;
  });

  const counts = {
    all: all.length,
    active: all.filter((p) => p.isActive).length,
    inactive: all.filter((p) => !p.isActive).length,
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Billing
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Plans
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600">
            Subscription plans. Creating a paid plan syncs it to Razorpay and
            stores the returned plan ID. Razorpay plans are immutable — to
            change pricing, deactivate the old plan and create a new one.
          </p>
        </div>
        <Link
          href="/plans/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
        >
          <span className="text-base leading-none">+</span>
          New plan
        </Link>
      </header>

      <FilterTabs current={filter} counts={counts} />

      {plans.length === 0 ? (
        <EmptyState filter={filter} totalAll={counts.all} />
      ) : (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-[11px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Plan</th>
                <th className="px-4 py-2.5 font-medium">Price</th>
                <th className="px-4 py-2.5 font-medium">Limits</th>
                <th className="px-4 py-2.5 font-medium">Razorpay ID</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
                <th className="px-4 py-2.5 font-medium text-right">Status</th>
                <th className="w-px px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {plans.map((plan) => (
                <PlanRow key={plan.id} plan={plan} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterTabs({
  current,
  counts,
}: {
  current: StatusFilter;
  counts: { all: number; active: number; inactive: number };
}) {
  const tabs: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: "active", label: "Active", count: counts.active },
    { value: "inactive", label: "Inactive", count: counts.inactive },
    { value: "all", label: "All", count: counts.all },
  ];

  return (
    <nav className="flex items-center gap-1 border-b border-zinc-200 text-sm">
      {tabs.map((tab) => {
        const isActive = tab.value === current;
        return (
          <Link
            key={tab.value}
            href={`/plans?status=${tab.value}`}
            className={
              isActive
                ? "-mb-px border-b-2 border-zinc-900 px-3 py-2 font-medium text-zinc-900"
                : "-mb-px border-b-2 border-transparent px-3 py-2 text-zinc-500 hover:text-zinc-900"
            }
          >
            {tab.label}
            <span
              className={
                isActive
                  ? "ml-2 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white"
                  : "ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600"
              }
            >
              {tab.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function PlanRow({ plan }: { plan: AdminPlan }) {
  const limits = summarizeLimits(
    (plan.limits ?? {}) as Record<string, unknown>,
  );

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <div className="font-medium text-zinc-900">{plan.name}</div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-700">
            {plan.type}
          </span>
          {plan.description ? (
            <span className="line-clamp-1 text-xs text-zinc-500">
              {plan.description}
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 text-zinc-700">{formatPrice(plan)}</td>
      <td className="px-4 py-3">
        {limits.length === 0 ? (
          <span className="text-xs text-zinc-400">—</span>
        ) : (
          <ul className="space-y-0.5 text-xs text-zinc-600">
            {limits.map(([key, value]) => (
              <li key={key} className="font-mono">
                <span className="text-zinc-400">{key}:</span>{" "}
                <span className="tabular-nums text-zinc-700">{value}</span>
              </li>
            ))}
          </ul>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-zinc-600">
        {plan.razorpayPlanId ?? <span className="text-zinc-400">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-zinc-600">
        {formatDate(plan.createdAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <StatusPill active={plan.isActive} />
      </td>
      <td className="px-4 py-3 text-right">
        {plan.isActive ? <DeactivateButton planId={plan.id} /> : null}
      </td>
    </tr>
  );
}

function StatusPill({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
      <span className="size-1.5 rounded-full bg-zinc-400" />
      Inactive
    </span>
  );
}

function DeactivateButton({ planId }: { planId: string }) {
  return (
    <form action={deactivatePlanAction}>
      <input type="hidden" name="id" value={planId} />
      <button
        type="submit"
        className="rounded border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
      >
        Deactivate
      </button>
    </form>
  );
}

function EmptyState({
  filter,
  totalAll,
}: {
  filter: StatusFilter;
  totalAll: number;
}) {
  const hasAny = totalAll > 0;
  return (
    <div className="rounded-md border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
        Nothing here
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        {filter === "active" && !hasAny
          ? "No plans yet. Create one to get started."
          : filter === "active"
            ? "No active plans. All plans have been deactivated."
            : filter === "inactive"
              ? "No inactive plans."
              : "No plans in the system."}
      </p>
      {filter === "active" && !hasAny ? (
        <Link
          href="/plans/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <span className="text-base leading-none">+</span>
          Create first plan
        </Link>
      ) : null}
    </div>
  );
}

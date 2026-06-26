import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminPost, AdminApiError } from "@/lib/api";
import type { CreatePlanBody, AdminPlan, PlanType, PlanInterval } from "@/lib/admin-types";

async function createPlan(formData: FormData) {
  "use server";

  const type = String(formData.get("type") ?? "") as PlanType;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRupees = Number(formData.get("priceRupees") ?? 0);
  const interval = String(formData.get("interval") ?? "monthly") as PlanInterval;
  const projects = Number(formData.get("limitProjects") ?? 0);
  const teamMembers = Number(formData.get("limitTeamMembers") ?? 0);

  if (!type || !name || Number.isNaN(priceRupees) || priceRupees < 0) {
    throw new Error("Missing or invalid plan fields");
  }

  const body: CreatePlanBody = {
    type,
    name,
    description: description || undefined,
    price: Math.round(priceRupees * 100), // rupees → paise
    currency: "INR",
    interval,
    limits: {
      projects,
      teamMembers,
    },
  };

  try {
    await adminPost<AdminPlan>("/admin/plans", body);
  } catch (err) {
    if (err instanceof AdminApiError) {
      throw new Error(`API ${err.status}: ${String(err.body)}`);
    }
    throw err;
  }

  revalidatePath("/plans");
  redirect("/plans");
}

export default function NewPlanPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <Link
          href="/plans"
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
        >
          <span aria-hidden>←</span>
          Plans
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          New plan
        </h1>
        <p className="text-sm text-zinc-600">
          Paid plans (price &gt; 0) are mirrored to Razorpay on save and the
          returned plan ID is stored. Free plans skip Razorpay entirely.
        </p>
      </header>

      <form
        action={createPlan}
        className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm"
      >
        <Section
          title="Identity"
          description="How this plan is referenced internally and shown to billing teams."
        >
          <div className="grid grid-cols-3 gap-4">
            <Field label="Plan type" htmlFor="type" className="col-span-1">
              <select
                id="type"
                name="type"
                required
                defaultValue="PRO"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="FREE">FREE</option>
                <option value="PRO">PRO</option>
                <option value="BUSINESS">BUSINESS</option>
              </select>
            </Field>

            <Field label="Display name" htmlFor="name" className="col-span-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={255}
                placeholder="e.g. Pro Plan — Monthly"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="description" hint="Optional">
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="What this plan includes, who it's for, etc."
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </Field>
        </Section>

        <Divider />

        <Section
          title="Pricing"
          description="Use 0 to skip Razorpay. Otherwise the plan is created on Razorpay and the ID is stored."
        >
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Price"
              htmlFor="priceRupees"
              hint="in rupees (₹)"
            >
              <div className="flex items-stretch overflow-hidden rounded-md border border-zinc-300 bg-white focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900">
                <span className="flex items-center bg-zinc-50 px-3 font-mono text-xs text-zinc-500">
                  ₹
                </span>
                <input
                  id="priceRupees"
                  name="priceRupees"
                  type="number"
                  min={0}
                  step="1"
                  required
                  defaultValue={0}
                  className="w-full bg-transparent px-3 py-2 text-sm tabular-nums focus:outline-none"
                />
              </div>
            </Field>

            <Field label="Interval" htmlFor="interval">
              <select
                id="interval"
                name="interval"
                defaultValue="monthly"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </Field>
          </div>
        </Section>

        <Divider />

        <Section
          title="Limits"
          description="Hard caps enforced by the platform for users on this plan."
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Projects" htmlFor="limitProjects">
              <input
                id="limitProjects"
                name="limitProjects"
                type="number"
                min={0}
                required
                defaultValue={5}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </Field>
            <Field label="Team members" htmlFor="limitTeamMembers">
              <input
                id="limitTeamMembers"
                name="limitTeamMembers"
                type="number"
                min={0}
                required
                defaultValue={2}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </Field>
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <Link
            href="/plans"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
          >
            Create plan
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 px-6 py-5 sm:grid-cols-[200px_1fr]">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Divider() {
  return <div className="border-t border-zinc-100" />;
}

function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium uppercase tracking-wider text-zinc-700"
      >
        {label}
        {hint ? (
          <span className="ml-2 text-[11px] font-normal normal-case tracking-normal text-zinc-400">
            {hint}
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}

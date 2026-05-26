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
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <Link
          href="/plans"
          className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
        >
          ← Plans
        </Link>
        <h1 className="text-xl font-semibold text-zinc-900">New plan</h1>
        <p className="text-sm text-zinc-600">
          Paid plans (price &gt; 0) are mirrored to Razorpay on save. Free plans
          skip Razorpay and store no plan ID.
        </p>
      </div>

      <form
        action={createPlan}
        className="space-y-5 rounded-md border border-zinc-200 bg-white p-6"
      >
        <Field label="Plan type" htmlFor="type">
          <select
            id="type"
            name="type"
            required
            defaultValue="PRO"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="FREE">FREE</option>
            <option value="PRO">PRO</option>
            <option value="BUSINESS">BUSINESS</option>
          </select>
        </Field>

        <Field label="Display name" htmlFor="name">
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={255}
            placeholder="Pro Plan"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Description" htmlFor="description" hint="Optional">
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (INR)" htmlFor="priceRupees" hint="In rupees">
            <input
              id="priceRupees"
              name="priceRupees"
              type="number"
              min={0}
              step="1"
              required
              defaultValue={0}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Interval" htmlFor="interval">
            <select
              id="interval"
              name="interval"
              defaultValue="monthly"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </Field>
        </div>

        <fieldset className="space-y-3 rounded-md border border-zinc-200 bg-zinc-50/50 p-4">
          <legend className="px-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
            Limits
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Projects" htmlFor="limitProjects">
              <input
                id="limitProjects"
                name="limitProjects"
                type="number"
                min={0}
                required
                defaultValue={5}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
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
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </fieldset>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/plans"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create plan
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-zinc-800"
      >
        {label}
        {hint ? (
          <span className="ml-2 text-xs font-normal text-zinc-500">
            {hint}
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}

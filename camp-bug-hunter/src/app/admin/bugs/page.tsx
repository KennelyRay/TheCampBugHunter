import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ButtonLink from "@/components/ButtonLink";
import { adminSessionCookieName, getAdminSession } from "@/lib/adminSession";
import FilterBar from "../../bugs/_components/FilterBar";
import BugsTable from "../../bugs/_components/BugsTable";

export const dynamic = "force-dynamic";

export default async function AdminBugsPage() {
  const cookieStore = await cookies();
  const session = getAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  if (!session) {
    redirect("/");
  }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Admin Bug List</h2>
            <p className="mt-1 text-sm text-white/70">Browse all reports and jump into details.</p>
          </div>
          <ButtonLink href="/admin" variant="secondary">
            Back to Dashboard
          </ButtonLink>
        </div>
        <div className="mt-4">
          <FilterBar />
        </div>
      </div>
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-4 shadow-lg shadow-black/30">
        <BugsTable includeHidden forceAdminLinks />
      </div>
    </div>
  );
}

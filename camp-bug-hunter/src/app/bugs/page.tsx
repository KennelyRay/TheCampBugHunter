import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FilterBar from "./_components/FilterBar";
import BugsTable from "./_components/BugsTable";
import { adminSessionCookieName, getAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export default async function BugsPage() {
  const cookieStore = await cookies();
  const adminSession = getAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  if (adminSession) {
    redirect("/admin");
  }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
        <h2 className="text-2xl font-semibold text-white">All Reported Bugs</h2>
        <p className="mt-1 text-sm text-white/70">
          Filter by status, severity, or Discord ID. Admins can click a row to view details.
        </p>
        <div className="mt-4">
          <FilterBar />
        </div>
      </div>
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-4 shadow-lg shadow-black/30">
        <BugsTable />
      </div>
    </div>
  );
}

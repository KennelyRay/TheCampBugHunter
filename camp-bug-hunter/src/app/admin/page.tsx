import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";
import { adminSessionCookieName, getAdminSession } from "@/lib/adminSession";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = getAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  if (!session) {
    redirect("/");
  }
  return <AdminClient />;
}

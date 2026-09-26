import DashboardShell from "@/components/DashboardShell";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  const role = session?.role === "admin" ? "admin" : "user";

  return <DashboardShell role={role}>{children}</DashboardShell>;
}

import { requireUser } from "@/modules/auth/session";
import { AdminDashboard } from "@/modules/panel/dashboards/admin-dashboard";
import { SupervisorDashboard } from "@/modules/panel/dashboards/supervisor-dashboard";
import { UserDashboard } from "@/modules/panel/dashboards/user-dashboard";

export const metadata = { title: "Inicio" };

export default async function PanelHome() {
  const user = await requireUser();
  if (user.role === "ADMIN") return <AdminDashboard user={user} />;
  if (user.role === "SUPERVISOR") return <SupervisorDashboard user={user} />;
  return <UserDashboard user={user} />;
}

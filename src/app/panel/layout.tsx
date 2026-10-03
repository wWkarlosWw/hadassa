import type { Metadata } from "next";
import { requireUser } from "@/modules/auth/session";
import { PanelShell } from "@/modules/panel/sidebar";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel Hadassa" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <PanelShell user={{ fullName: user.fullName, email: user.email, role: user.role, points: user.points }}>{children}</PanelShell>
  );
}

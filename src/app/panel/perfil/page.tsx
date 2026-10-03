import { notFound } from "next/navigation";
import { requireUser } from "@/modules/auth/session";
import { getProfile } from "@/modules/users/service";
import { ProfileForm } from "@/modules/users/components/profile-form";
import { PasswordForm } from "@/modules/users/components/password-form";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { RoleBadge } from "@/shared/ui/status-badges";
import { formatDate } from "@/shared/lib/utils";

export const metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile) notFound();

  return (
    <>
      <PageHeader title="Mi perfil" description="Mantén tus datos al día para que podamos contactarte." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardBody className="sm:p-8">
            <ProfileForm profile={profile} />
          </CardBody>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-tinta-suave">Rol</span><RoleBadge status={profile.role} /></div>
              <div className="flex items-center justify-between"><span className="text-tinta-suave">Miembro desde</span><span>{formatDate(profile.createdAt)}</span></div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Seguridad" />
            <CardBody>
              <PasswordForm />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

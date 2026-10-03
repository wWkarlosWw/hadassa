import { Search } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listUsers, userStats } from "@/modules/users/service";
import { AdjustPointsDialog, CreateUserDialog, UserAccessDialog } from "@/modules/users/components/user-dialogs";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input, Select } from "@/shared/ui/form";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, Td, Th } from "@/shared/ui/table";
import { RoleBadge } from "@/shared/ui/status-badges";
import { formatDate, formatNumber } from "@/shared/lib/utils";
import type { Role } from "@/generated/prisma/enums";

export const metadata = { title: "Usuarios" };

const ROLES: Role[] = ["USER", "SUPERVISOR", "ADMIN"];

export default async function UsuariosPage({ searchParams }: PageProps<"/panel/admin/usuarios">) {
  const admin = await requireRole("ADMIN");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const rol = typeof sp.rol === "string" && ROLES.includes(sp.rol as Role) ? (sp.rol as Role) : undefined;
  const [users, stats] = await Promise.all([listUsers({ q, role: rol }), userStats()]);

  return (
    <>
      <PageHeader
        title="Usuarios"
        description={`${formatNumber(stats.total)} cuentas · ${formatNumber(stats.byRole.SUPERVISOR ?? 0)} supervisores · ${formatNumber(stats.byRole.ADMIN ?? 0)} administradores`}
        actions={<CreateUserDialog />}
      />

      <form role="search" className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-tinta-suave" aria-hidden />
          <Input name="q" defaultValue={q} placeholder="Buscar por nombre, correo o CI" aria-label="Buscar usuarios" className="pl-10" />
        </div>
        <Select name="rol" defaultValue={rol ?? ""} aria-label="Filtrar por rol" className="w-auto min-w-40">
          <option value="">Todos los roles</option>
          <option value="USER">Donantes</option>
          <option value="SUPERVISOR">Supervisores</option>
          <option value="ADMIN">Administradores</option>
        </Select>
        <Button type="submit" variant="outline">Filtrar</Button>
      </form>

      <Card>
        {users.length === 0 ? (
          <EmptyState title="Sin resultados" description="Prueba con otro término de búsqueda." />
        ) : (
          <Table className="min-w-[760px]">
            <thead>
              <tr>
                <Th>Usuario</Th>
                <Th>Contacto</Th>
                <Th>Rol</Th>
                <Th>Puntos</Th>
                <Th>Alta</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.isActive ? undefined : "opacity-60"}>
                  <Td>
                    <p className="font-semibold">{u.fullName}</p>
                    <p className="text-xs text-tinta-suave">{u.email}</p>
                  </Td>
                  <Td className="text-xs text-tinta-suave">
                    {u.phone ?? "—"}
                    {u.ci ? <span className="block">CI {u.ci}</span> : null}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <RoleBadge status={u.role} />
                      {!u.isActive && <Badge tone="error">Inactivo</Badge>}
                    </div>
                  </Td>
                  <Td className="font-semibold tabular-nums">{formatNumber(u.points)}</Td>
                  <Td className="whitespace-nowrap text-tinta-suave">{formatDate(u.createdAt)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <AdjustPointsDialog user={{ id: u.id, fullName: u.fullName, points: u.points }} />
                      <UserAccessDialog user={{ id: u.id, fullName: u.fullName, role: u.role, isActive: u.isActive }} isSelf={u.id === admin.id} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}

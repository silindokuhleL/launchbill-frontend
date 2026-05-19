"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  LockKeyhole,
  SlidersHorizontal,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import {
  activeRoleNames,
  canManageRoles,
  formatPermissionLabel,
  permissionGroups,
  roleCoveragePercentage,
  roleDefinitions,
} from "@/lib/roles";
import { demoUsers } from "@/lib/demo-users";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export function RoleManagementClient() {
  const auth = useAuth();
  const activeAccount = useMemo(
    () => auth.user?.accounts.find((account) => account.id === auth.activeAccountId),
    [auth.activeAccountId, auth.user?.accounts],
  );
  const roles = activeRoleNames({ account: activeAccount, user: auth.user });
  const canManage = canManageRoles({ account: activeAccount, user: auth.user });
  const totalPermissions = permissionGroups.reduce(
    (total, group) => total + group.permissions.length,
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Team access"
        title="Roles & Team Access"
        description="Review tenant roles, permission coverage, and seeded access differences before we connect the member management API."
      />

      <section className="mb-5 rounded-lg border border-[#b7d8c3] bg-[#f4fbf6] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--brand-dark)]">
              {activeAccount?.name ?? "Platform access"}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Signed in as {auth.user?.email ?? "unknown user"} with{" "}
              {roles.length ? roles.join(", ") : "no assigned role"}.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button disabled variant="secondary">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Invite member
            </Button>
            <Button disabled={!canManage}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Manage roles
            </Button>
          </div>
        </div>
      </section>

      {!canManage ? (
        <div className="mb-5">
          <EmptyState
            description="Role changes require owner, roles.manage, or super admin access. You can still review the matrix to understand what each role can do."
            icon={LockKeyhole}
            title="Role editing is restricted"
          />
        </div>
      ) : (
        <div className="mb-5">
          <Alert
            message="The UI is ready for role decisions. Create, update, and assign actions will be enabled when the backend team and roles endpoints are connected."
            title="Role management API pending"
            tone="info"
          />
        </div>
      )}

      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roleDefinitions.map((role) => {
            const Icon = role.icon;
            const isCurrent = roles.includes(role.name);

            return (
              <article
                className={`rounded-lg border bg-white p-5 shadow-sm ${
                  isCurrent ? "border-[#9ed4af]" : "border-[var(--border)]"
                }`}
                key={role.name}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e5f4eb] text-[var(--brand)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {isCurrent ? (
                    <span className="rounded-full bg-[#e5f4eb] px-3 py-1 text-xs font-bold text-[var(--brand-dark)]">
                      Current
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 text-lg font-bold text-[#102019]">{role.label}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {role.description}
                </p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                    <span>Coverage</span>
                    <span>{roleCoveragePercentage(role, totalPermissions)}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#edf5f0]">
                    <div
                      className="h-2 rounded-full bg-[var(--brand)]"
                      style={{
                        width: `${roleCoveragePercentage(role, totalPermissions)}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                Permission matrix
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#102019]">
                What each role can access
              </h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-md bg-[#e5f4eb] px-3 py-2 text-sm font-bold text-[var(--brand-dark)]">
              <Users className="h-4 w-4" aria-hidden="true" />
              {roleDefinitions.length} roles
            </div>
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-md border border-[#d8e7dd] lg:block">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="bg-[#f4fbf6] text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  <th className="w-[220px] px-4 py-3">Permission</th>
                  {roleDefinitions.map((role) => (
                    <th className="px-4 py-3" key={role.name}>
                      {role.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8e7dd]">
                {permissionGroups.flatMap((group) =>
                  group.permissions.map((permission, permissionIndex) => (
                    <tr className="bg-white align-top" key={permission}>
                      <td className="px-4 py-4">
                        <p className="font-bold text-[#102019]">
                          {formatPermissionLabel(permission)}
                        </p>
                        {permissionIndex === 0 ? (
                          <p className="mt-1 text-xs font-semibold text-[var(--brand)]">
                            {group.name}
                          </p>
                        ) : null}
                      </td>
                      {roleDefinitions.map((role) => {
                        const hasPermission = role.permissions.includes(permission);

                        return (
                          <td className="px-4 py-4" key={`${role.name}-${permission}`}>
                            <PermissionState enabled={hasPermission} />
                          </td>
                        );
                      })}
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-4 lg:hidden">
            {roleDefinitions.map((role) => (
              <article
                className="rounded-md border border-[#d8e7dd] bg-[#fbfefd] p-4"
                key={role.name}
              >
                <h3 className="font-bold text-[#102019]">{role.label}</h3>
                <div className="mt-3 grid gap-3">
                  {permissionGroups.map((group) => (
                    <div key={group.name}>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                        {group.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.permissions.map((permission) => {
                          const enabled = role.permissions.includes(permission);

                          return (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                enabled
                                  ? "bg-[#e5f4eb] text-[var(--brand-dark)]"
                                  : "bg-[#edf1f5] text-[#667085]"
                              }`}
                              key={`${role.name}-${permission}`}
                            >
                              {formatPermissionLabel(permission)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Seeded access checks
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#102019]">
              Demo users for permission testing
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use these users on the login screen to confirm owners, billing managers,
              viewers, and platform admins do not share the same permissions.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {demoUsers.map((user) => (
              <div
                className="rounded-md border border-[#d8e7dd] bg-[#fbfefd] p-4"
                key={user.email}
              >
                <p className="font-bold text-[#102019]">{user.label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-[var(--brand)]">
                  {user.email}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">{user.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function PermissionState({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-[#e5f4eb] px-3 py-1 text-xs font-bold text-[var(--brand-dark)]">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Allowed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#edf1f5] px-3 py-1 text-xs font-bold text-[#667085]">
      <XCircle className="h-4 w-4" aria-hidden="true" />
      Blocked
    </span>
  );
}

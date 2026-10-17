import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { UserSuspendButton } from "@/components/admin/user-suspend-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users | Admin" };

interface PageProps { searchParams: Promise<{ q?: string; role?: string }> }

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const where: any = {};
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
      { username: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.role) where.role = params.role;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      image: true,
      isSuspended: true,
      createdAt: true,
      _count: { select: { opportunityApps: true } },
    },
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
        <p className="text-neutral-500 text-sm mt-1">{users.length} result{users.length !== 1 ? "s" : ""}</p>
      </div>

      <form method="get" className="flex gap-3 mb-6">
        <input name="q" defaultValue={params.q}
          placeholder="Search by name, email, or username..."
          className="flex-1 border border-neutral-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Search users" />
        <select name="role" defaultValue={params.role || ""}
          className="border border-neutral-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Filter by role">
          <option value="">All roles</option>
          <option value="STUDENT">Student</option>
          <option value="FOUNDER">Founder</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors">
          Search
        </button>
      </form>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">User</th>
              <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3 hidden sm:table-cell">Email</th>
              <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">Role</th>
              <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3 hidden md:table-cell">Status</th>
              <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3 hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={u.image} name={u.name} size="xs" />
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{u.name}</p>
                      <p className="text-xs text-neutral-400">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "ADMIN" ? "blue" : u.role === "FOUNDER" ? "green" : "neutral"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {u.isSuspended ? (
                    <Badge variant="red">Suspended</Badge>
                  ) : (
                    <Badge variant="green">Active</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-400 hidden lg:table-cell">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <UserSuspendButton userId={u.id} isSuspended={u.isSuspended} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-neutral-500">No users found</p>
          </div>
        )}
      </Card>
    </div>
  );
}

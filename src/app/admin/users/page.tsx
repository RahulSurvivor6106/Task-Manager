import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { getAdminUsers, listTeams } from "@/lib/admin";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from "@/components/ui";
import AdminChart from "@/components/admin-chart";

export default async function UsersPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const user = await getCurrentUserFromCookies();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const page = Number(Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page) || 1;
  const perPage = Number(Array.isArray(searchParams?.perPage) ? searchParams?.perPage[0] : searchParams?.perPage) || 12;
  const sort = Array.isArray(searchParams?.sort) ? searchParams?.sort[0] : (searchParams?.sort as string | undefined);
  const search = Array.isArray(searchParams?.search) ? searchParams?.search[0] : (searchParams?.search as string | undefined);
  const team = Array.isArray(searchParams?.team) ? searchParams?.team[0] : (searchParams?.team as string | undefined);

  const [res, teams] = await Promise.all([
    getAdminUsers({ page, perPage, sort: sort as any, teamId: team ?? undefined, search: search ?? undefined }),
    listTeams(),
  ]);

  const totalPages = Math.max(1, Math.ceil(res.total / res.perPage));

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Admin — Users</h2>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/users?format=csv">Download CSV</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Users ({res.total})</CardTitle>
            </CardHeader>
            <CardContent>
              <form method="get" className="mb-4 flex gap-2">
                <Input name="search" defaultValue={search ?? ""} placeholder="Search name or email" />
                <select name="sort" defaultValue={sort ?? "tasks"} className="rounded-2xl bg-white/5 px-3">
                  <option value="tasks">Sort by tasks</option>
                  <option value="name">Sort by name</option>
                </select>
                <select name="team" defaultValue={team ?? ""} className="rounded-2xl bg-white/5 px-3">
                  <option value="">All teams</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <input type="hidden" name="perPage" value={String(perPage)} />
                <Button type="submit">Filter</Button>
              </form>

              <div className="grid gap-2">
                {res.users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div>
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="text-xs text-white/55">{u.email} · {u.totalTasks} tasks — {u.completedTasks} done</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <form method="post" action={`/api/admin/users/${u.id}`} onSubmit={async () => {}}>
                        <input type="hidden" name="_method" value="delete" />
                        <Button formAction="delete" variant="ghost">Remove</Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-white/60">Page {res.page} of {totalPages}</div>
                <div className="flex gap-2">
                  {res.page > 1 ? (
                    <Link href={`?page=${res.page - 1}&perPage=${res.perPage}`}>Prev</Link>
                  ) : null}
                  {res.page < totalPages ? (
                    <Link href={`?page=${res.page + 1}&perPage=${res.perPage}`}>Next</Link>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Top users</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminChart stats={{ totalUsers: res.total, users: res.users }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invite user</CardTitle>
            </CardHeader>
            <CardContent>
              <form method="post" action="/api/admin/users" className="grid gap-2">
                <Label>Name</Label>
                <Input name="name" />
                <Label>Email</Label>
                <Input name="email" />
                <select name="role" className="rounded-2xl bg-white/5 px-3">
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <Button type="submit">Invite</Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

import { NextResponse } from "next/server";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { getAdminStats, getAdminUsers, inviteUser } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUserFromCookies();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const url = new URL(request.url);
    const format = url.searchParams.get("format");
    const page = Number(url.searchParams.get("page") || "1");
    const perPage = Number(url.searchParams.get("perPage") || "20");
    const sort = url.searchParams.get("sort") as "tasks" | "name" | null;
    const search = url.searchParams.get("search");
    const teamId = url.searchParams.get("team");

    if (format === "csv") {
      const stats = await getAdminStats();
      const header = ["id", "name", "totalTasks", "completedTasks", "openTasks"].join(",") + "\n";
      const rows = stats.users.map((u) => [u.id, `"${u.name.replace(/"/g, '""') }"`, u.totalTasks, u.completedTasks, u.openTasks].join(",")).join("\n");
      const csv = header + rows;
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=admin-users.csv",
        },
      });
    }

    const res = await getAdminUsers({ page, perPage, sort: sort ?? undefined, teamId: teamId ?? undefined, search: search ?? undefined });
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookies();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { name, email, role } = body;
    if (!email || !name) return NextResponse.json({ error: "Missing name or email" }, { status: 400 });

    const invited = await inviteUser(name, email, role === "ADMIN" ? "ADMIN" : "MEMBER");
    return NextResponse.json({ user: invited.user, password: invited.password });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}

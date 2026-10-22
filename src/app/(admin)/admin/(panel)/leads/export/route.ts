import { rolesFor } from "@/components/admin/nav";
import { getCurrentUser } from "@/lib/server/auth";
import { exportLeads } from "@/lib/server/leads-admin";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !rolesFor("/admin/leads/").includes(user.role)) return new Response("Sign in required", { status: 401 });
  const params = new URL(request.url).searchParams;
  const csv = await exportLeads({ status: params.get("status") ?? undefined, q: params.get("q") ?? undefined });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="qsm-enquiries-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}

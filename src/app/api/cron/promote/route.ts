import { connection } from "next/server";

import { revalidatePosts } from "@/lib/cache/revalidate";
import { promoteDuePosts } from "@/lib/queries/schedule";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  await connection();

  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const promoted = await promoteDuePosts();
  if (promoted > 0) {
    revalidatePosts();
  }

  return Response.json({ ok: true, promoted });
}

export async function POST(request: Request) {
  return GET(request);
}

import { NextResponse } from "next/server";
import { getCurrentAuthSession } from "@/lib/auth/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentAuthSession();
  if (!session) {
    return NextResponse.json(
      { error: { message: "Not authenticated." } },
      { status: 401 }
    );
  }

  return NextResponse.json({ data: { user: session } });
}

import { redirect } from "next/navigation";
import { getCurrentAuthSession } from "@/lib/auth/server";

export default async function Home() {
  const session = await getCurrentAuthSession();
  redirect(session ? "/admin" : "/login");
}

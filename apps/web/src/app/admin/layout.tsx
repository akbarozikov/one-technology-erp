import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentAuthSession } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Admin - One Technology ERP",
  description: "Internal ERP workspace",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentAuthSession();
  if (!session) {
    redirect("/login");
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}

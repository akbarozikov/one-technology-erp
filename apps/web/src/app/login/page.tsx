import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAuthConfigurationError, getCurrentAuthSession } from "@/lib/auth/server";

export default async function LoginPage() {
  const session = await getCurrentAuthSession();
  if (session) {
    redirect("/admin");
  }

  const configurationError = getAuthConfigurationError();

  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center px-5 py-10 lg:px-8">
      <div className="grid w-full max-w-6xl gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
        <section className="space-y-5">
          <div className="space-y-4">
            <div className="relative h-14 w-[17rem] sm:h-16 sm:w-[19rem]">
              <Image
                src="/brand/one-technology-logo.png"
                alt="One Technology"
                fill
                sizes="304px"
                className="object-contain object-left"
                priority
              />
            </div>
            <div className="space-y-2">
              <p className="app-kicker">Protected access</p>
              <h2 className="app-page-title max-w-3xl text-[2.4rem]">
                Protected staging access for the full operating workspace.
              </h2>
              <p className="app-page-subtitle max-w-2xl">
                This environment is gated for real product testing. Sign in to enter the seller workspace, boss control layer, or the full advanced ERP.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="app-panel px-4 py-4">
              <p className="app-kicker">Seller</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Fast sales entry, follow-through, and customer-facing documents.</p>
            </div>
            <div className="app-panel px-4 py-4">
              <p className="app-kicker">Boss</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Approvals, payments and debt visibility, and operational control surfaces.</p>
            </div>
            <div className="app-panel px-4 py-4">
              <p className="app-kicker">Advanced</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Full commercial, warehouse, constructor, document, and administration depth.</p>
            </div>
          </div>

          {configurationError && (
            <div className="rounded-[1.2rem] border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
              {configurationError}
            </div>
          )}
        </section>

        <div className="flex justify-center xl:justify-end">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

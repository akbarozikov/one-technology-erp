export default function AdminOverviewPage() {
  return (
    <div className="max-w-2xl space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
      <p>
        Phase 1 admin shell: list and create records for access control and company
        structure. Authentication is not enabled yet.
      </p>
      <p className="text-zinc-500">
        Use the sidebar to open each entity. Ensure the API is running and{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          NEXT_PUBLIC_API_BASE_URL
        </code>{" "}
        is set in{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env.local</code>.
      </p>
    </div>
  );
}

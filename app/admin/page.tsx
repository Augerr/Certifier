import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-50">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
          Not enabled
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Admin tools are out of scope for this MVP.
        </h1>
        <p className="mt-4 text-neutral-400">
          This first version keeps all questions local and hardcoded.
        </p>
        <Button asChild className="mt-8 bg-emerald-300 text-neutral-950 hover:bg-emerald-200">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}

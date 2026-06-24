import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>

        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
            Local mock certification exam
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Saviynt IGA Exam Trainer
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
            Practice high-signal identity governance scenarios in a focused
            dashboard-style mock exam. The first MVP runs entirely in your
            browser with local hardcoded questions.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-11 bg-emerald-300 px-5 text-neutral-950 hover:bg-emerald-200"
          >
            <Link href="/quiz">
              Start Mock Exam
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-3 border-t border-white/10 pt-6 text-sm text-neutral-400 sm:grid-cols-3">
          <div>10 questions</div>
          <div>Multiple choice</div>
          <div>70% passing score</div>
        </div>
      </section>
    </main>
  );
}

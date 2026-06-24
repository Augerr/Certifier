"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { examCategories, type ExamCategory } from "@/lib/exam-data";

export default function Home() {
  const [selectedDomains, setSelectedDomains] = useState<ExamCategory[]>([
    ...examCategories,
  ]);
  const allDomainsSelected = selectedDomains.length === examCategories.length;
  const startHref = useMemo(() => {
    if (allDomainsSelected) {
      return "/quiz";
    }

    const params = new URLSearchParams();
    selectedDomains.forEach((domain) => {
      params.append("domains", domain);
    });

    return `/quiz?${params.toString()}`;
  }, [allDomainsSelected, selectedDomains]);

  function toggleDomain(domain: ExamCategory) {
    setSelectedDomains((currentDomains) =>
      currentDomains.includes(domain)
        ? currentDomains.filter((currentDomain) => currentDomain !== domain)
        : [...currentDomains, domain],
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
        <div className="flex">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <p className="mt-4 ml-2 text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
            Mock certification exam
          </p>
        </div>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Saviynt IGA 100 Exam Trainer
          </h1>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-medium text-white">
                Exam domains to be included
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                {selectedDomains.length} of {examCategories.length} selected
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-neutral-950 text-neutral-100 hover:bg-neutral-900"
                onClick={() => setSelectedDomains([...examCategories])}
              >
                All
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-neutral-950 text-neutral-100 hover:bg-neutral-900"
                onClick={() => setSelectedDomains([])}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {examCategories.map((domain) => {
              const isSelected = selectedDomains.includes(domain);

              return (
                <label
                  key={domain}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                    isSelected
                      ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100"
                      : "border-white/10 bg-neutral-900/60 text-neutral-300 hover:border-white/25 hover:bg-neutral-900"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleDomain(domain)}
                    className="size-4 accent-emerald-300"
                  />
                  <span>{domain}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {selectedDomains.length === 0 ? (
            <Button
              type="button"
              size="lg"
              className="h-11 bg-emerald-300 px-5 text-neutral-950 hover:bg-emerald-200"
              disabled
            >
              Start Mock Exam
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="h-11 bg-emerald-300 px-5 text-neutral-950 hover:bg-emerald-200"
            >
              <Link href={startHref}>
                Start Mock Exam
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-16 grid gap-3 border-t border-white/10 pt-6 text-sm text-neutral-400 sm:grid-cols-3">
          <div>25 questions</div>
          <div>Multiple choice</div>
          <div>70% passing score</div>
        </div>
      </section>
    </main>
  );
}

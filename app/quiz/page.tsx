import { QuizClient } from "@/components/QuizClient";

type QuizPageProps = {
  searchParams?: Promise<{
    domains?: string | string[];
  }>;
};

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const params = await searchParams;
  const domains = params?.domains;
  const requestedDomains = Array.isArray(domains)
    ? domains
    : domains
      ? [domains]
      : [];

  return (
    <QuizClient
      key={requestedDomains.join("|") || "all-domains"}
      requestedDomains={requestedDomains}
    />
  );
}

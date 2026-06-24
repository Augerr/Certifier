import { QuizClient } from "@/components/QuizClient";

type QuizPageProps = {
  searchParams?: Promise<{
    categories?: string | string[];
    count?: string | string[];
  }>;
};

const defaultQuestionCount = 25;
const minQuestionCount = 10;

function parseQuestionCount(count?: string | string[]) {
  const countValue = Array.isArray(count) ? count[0] : count;
  const parsedCount = Number(countValue);

  if (!Number.isFinite(parsedCount)) {
    return defaultQuestionCount;
  }

  return Math.max(minQuestionCount, Math.floor(parsedCount));
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const params = await searchParams;
  const categories = params?.categories;
  const requestedCategories = Array.isArray(categories)
    ? categories
    : categories
      ? [categories]
      : [];
  const questionCount = parseQuestionCount(params?.count);

  return (
    <QuizClient
      key={`${requestedCategories.join("|") || "all-categories"}-${questionCount}`}
      questionCount={questionCount}
      requestedCategories={requestedCategories}
    />
  );
}

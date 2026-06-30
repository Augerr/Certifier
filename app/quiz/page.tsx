import { QuizClient } from "@/components/QuizClient";

type QuizPageProps = {
  searchParams?: Promise<{
    categories?: string | string[];
    count?: string | string[];
    fresh?: string | string[];
    timer?: string | string[];
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

function parseTimerEnabled(timer?: string | string[]) {
  const timerValue = Array.isArray(timer) ? timer[0] : timer;

  return timerValue !== "0" && timerValue !== "false";
}

function parseFreshStart(fresh?: string | string[]) {
  const freshValue = Array.isArray(fresh) ? fresh[0] : fresh;

  return freshValue === "1" || freshValue === "true";
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
  const timerEnabled = parseTimerEnabled(params?.timer);
  const freshStart = parseFreshStart(params?.fresh);

  return (
    <QuizClient
      key={`${requestedCategories.join("|") || "all-categories"}-${questionCount}-${timerEnabled ? "timer" : "no-timer"}-${freshStart ? "fresh" : "resume"}`}
      questionCount={questionCount}
      freshStart={freshStart}
      requestedCategories={requestedCategories}
      timerEnabled={timerEnabled}
    />
  );
}

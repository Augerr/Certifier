import { QuizClient } from "@/components/QuizClient";
import type { Difficulty, QuestionType } from "@/types/question";

type QuizPageProps = {
  searchParams?: Promise<{
    categories?: string | string[];
    count?: string | string[];
    difficulties?: string | string[];
    fresh?: string | string[];
    timer?: string | string[];
    types?: string | string[];
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

const supportedQuestionTypes = new Set<QuestionType>([
  "Single",
  "Multiple",
  "Order",
  "Match",
  "Scenario",
  "Timeline",
  "Workflow",
  "Consultant",
]);
const supportedDifficulties = new Set<Difficulty>(["easy", "medium", "hard"]);

function parseQuestionTypes(types?: string | string[]) {
  const typeValues = Array.isArray(types) ? types : types ? [types] : [];

  return typeValues.filter((type): type is QuestionType =>
    supportedQuestionTypes.has(type as QuestionType),
  );
}

function parseDifficulties(difficulties?: string | string[]) {
  const difficultyValues = Array.isArray(difficulties)
    ? difficulties
    : difficulties
      ? [difficulties]
      : [];

  return difficultyValues.filter((difficulty): difficulty is Difficulty =>
    supportedDifficulties.has(difficulty as Difficulty),
  );
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
  const requestedTypes = parseQuestionTypes(params?.types);
  const requestedDifficulties = parseDifficulties(params?.difficulties);

  return (
    <QuizClient
      key={`${requestedCategories.join("|") || "all-categories"}-${requestedDifficulties.join("|") || "all-difficulties"}-${requestedTypes.join("|") || "all-types"}-${questionCount}-${timerEnabled ? "timer" : "no-timer"}-${freshStart ? "fresh" : "resume"}`}
      questionCount={questionCount}
      freshStart={freshStart}
      requestedCategories={requestedCategories}
      requestedDifficulties={requestedDifficulties}
      requestedTypes={requestedTypes}
      timerEnabled={timerEnabled}
    />
  );
}

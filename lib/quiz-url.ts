export type QuizUrlOptions = {
  categories?: string[];
  count: number;
  fresh?: boolean;
  timer?: boolean;
};

export type QuizSearchParams = {
  categories?: string | string[];
  count?: string | string[];
  fresh?: string | string[];
  timer?: string | string[];
};

const defaultQuestionCount = 25;
const minQuestionCount = 10;

export function buildQuizSearchParams({
  categories = [],
  count,
  fresh,
  timer,
}: QuizUrlOptions) {
  const params = new URLSearchParams();

  params.set("count", String(count));

  if (fresh !== undefined) {
    params.set("fresh", fresh ? "1" : "0");
  }

  if (timer !== undefined) {
    params.set("timer", timer ? "1" : "0");
  }

  categories.forEach((category) => {
    params.append("categories", category);
  });

  return params;
}

export function buildQuizHref(options: QuizUrlOptions) {
  return `/quiz?${buildQuizSearchParams(options).toString()}`;
}

export function buildQuizApiHref(options: Omit<QuizUrlOptions, "fresh" | "timer">) {
  return `/api/quiz?${buildQuizSearchParams(options).toString()}`;
}

export function parseSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseSearchParamArray(value?: string | string[]) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

export function parseQuestionCount(count?: string | string[]) {
  const countValue = parseSearchParamValue(count);
  const parsedCount = Number(countValue);

  if (!Number.isFinite(parsedCount)) {
    return defaultQuestionCount;
  }

  return Math.max(minQuestionCount, Math.floor(parsedCount));
}

export function parseTimerEnabled(timer?: string | string[]) {
  const timerValue = parseSearchParamValue(timer);

  return timerValue !== "0" && timerValue !== "false";
}

export function parseFreshStart(fresh?: string | string[]) {
  const freshValue = parseSearchParamValue(fresh);

  return freshValue === "1" || freshValue === "true";
}

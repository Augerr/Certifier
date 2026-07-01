import type { SelectedAnswers } from "@/lib/answer-utils";
import type { Difficulty, ExamQuestion, QuestionType } from "@/types/question";

export type ExamDraft = {
  version: 1;
  sessionId: string | null;
  questions: ExamQuestion[];
  answers: SelectedAnswers;
  currentIndex: number;
  startedAt: number | null;
  updatedAt?: number;
};

export type ContinueAttempt = {
  href: string;
  updatedAt: number;
};

export type ExamDraftKeyOptions = {
  questionCount: number;
  timerEnabled: boolean;
  categories: string[];
  difficulties?: Difficulty[];
  types?: QuestionType[];
};

export const examDraftStoragePrefix = "saviynt-exam-draft:v1:";

export function createExamDraftStorageKey({
  questionCount,
  timerEnabled,
  categories,
  difficulties = [],
  types = [],
}: ExamDraftKeyOptions) {
  const categoriesKey =
    categories.length > 0 ? [...categories].sort().join("|") : "all";
  const difficultiesKey =
    difficulties.length > 0 ? [...difficulties].sort().join("|") : "all";
  const typesKey = types.length > 0 ? [...types].sort().join("|") : "all";

  return `${examDraftStoragePrefix}${questionCount}:${timerEnabled ? "timed" : "untimed"}:${categoriesKey}:${difficultiesKey}:${typesKey}`;
}

export function isExamDraft(value: unknown): value is ExamDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<ExamDraft>;

  return (
    draft.version === 1 &&
    Array.isArray(draft.questions) &&
    typeof draft.currentIndex === "number" &&
    (typeof draft.sessionId === "string" || draft.sessionId === null) &&
    (typeof draft.startedAt === "number" || draft.startedAt === null) &&
    Boolean(draft.answers && typeof draft.answers === "object")
  );
}

export function readExamDraft(storageKey: string) {
  const savedDraft = window.localStorage.getItem(storageKey);

  if (!savedDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(savedDraft) as unknown;

    if (isExamDraft(parsedDraft) && parsedDraft.questions.length > 0) {
      return parsedDraft;
    }
  } catch {
    // Malformed drafts are cleared by the caller.
  }

  return null;
}

export function writeExamDraft(storageKey: string, draft: Omit<ExamDraft, "updatedAt">) {
  const nextDraft: ExamDraft = {
    ...draft,
    updatedAt: Date.now(),
  };

  window.localStorage.setItem(storageKey, JSON.stringify(nextDraft));
}

export function removeExamDraft(storageKey: string) {
  window.localStorage.removeItem(storageKey);
}

export function getLatestContinueAttempt(minQuestionCount: number): ContinueAttempt | null {
  if (typeof window === "undefined") {
    return null;
  }

  let latestAttempt: ContinueAttempt | null = null;

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key?.startsWith(examDraftStoragePrefix)) {
      continue;
    }

    const draft = readExamDraft(key);

    if (!draft) {
      continue;
    }

    const [, , count, timer, categoriesKey = "all", nextKey = "all", finalKey] =
      key.split(":");
    const hasDifficultyKey = finalKey !== undefined;
    const difficultiesKey = hasDifficultyKey ? nextKey : "all";
    const typesKey = hasDifficultyKey ? finalKey : nextKey;
    const questionCount = Number(count);

    if (!Number.isFinite(questionCount) || questionCount < minQuestionCount) {
      continue;
    }

    const params = new URLSearchParams();
    params.set("count", String(questionCount));
    params.set("timer", timer === "timed" ? "1" : "0");

    if (categoriesKey !== "all") {
      categoriesKey.split("|").forEach((category) => {
        if (category) {
          params.append("categories", category);
        }
      });
    }

    if (difficultiesKey !== "all") {
      difficultiesKey.split("|").forEach((difficulty) => {
        if (difficulty) {
          params.append("difficulties", difficulty);
        }
      });
    }

    if (typesKey !== "all") {
      typesKey.split("|").forEach((type) => {
        if (type) {
          params.append("types", type);
        }
      });
    }

    const updatedAt = draft.updatedAt ?? draft.startedAt ?? 0;

    if (!latestAttempt || updatedAt > latestAttempt.updatedAt) {
      latestAttempt = {
        href: `/quiz?${params.toString()}`,
        updatedAt,
      };
    }
  }

  return latestAttempt;
}

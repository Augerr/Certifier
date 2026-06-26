import { NextResponse } from "next/server";

import { examQuestions } from "@/lib/load-question";
import { generateExam } from "@/lib/exam-generator";
import {
  completeQuizAttempt,
  createQuizAttempt,
  getQuizAnalytics,
} from "@/lib/quiz-attempt-store";

export const runtime = "nodejs";

export function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  // metadata endpoint
  if (params.get("meta") === "1" || params.get("meta") === "true") {
    const categoryCounts: Record<string, number> = {};
    for (const q of examQuestions) {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    }

    return NextResponse.json({
      totalQuestions: examQuestions.length,
      categoryCounts,
    });
  }

  // generate an exam based on query params
  const countParam = Number(params.get("count") || "0") || 70;
  const categories = params.getAll("categories");

  const pool =
    categories.length > 0
      ? examQuestions.filter((q) => categories.includes(q.category))
      : examQuestions;

  const exam = generateExam(pool, countParam).map((question) => ({
    ...question,
    choices: question.choices.sort(() => Math.random() - 0.5),
  }));

  // create a persisted attempt and store answers server-side
  const sessionId = crypto.randomUUID();
  createQuizAttempt({
    attemptId: sessionId,
    requestedCount: countParam,
    requestedCategories: categories,
    questions: exam,
  });

  // redact answers for the client
  const publicQuestions = exam.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    choices: q.choices,
    difficulty: q.difficulty,
    category: q.category,
  }));

  return NextResponse.json({ sessionId, questions: publicQuestions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, answers } = body as {
      sessionId?: string;
      answers?: Record<number, string>;
    };

    if (!sessionId || !answers) {
      return NextResponse.json({ error: "missing sessionId or answers" }, { status: 400 });
    }

    const result = completeQuizAttempt(sessionId, answers);
    if (!result) {
      return NextResponse.json({ error: "invalid or expired sessionId" }, { status: 404 });
    }

    return NextResponse.json({
      ...result,
      analytics: getQuizAnalytics(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

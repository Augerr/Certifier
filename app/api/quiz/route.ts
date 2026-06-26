import { NextResponse } from "next/server";

import { examQuestions } from "@/lib/load-question";
import { generateExam } from "@/lib/exam-generator";
import { difficultyPointValue, passingPercentage } from "@/lib/exam-data";
import type { ExamQuestion } from "@/types/question";

type StoredQuestion = {
  id: number;
  correctAnswer: string;
  explanation?: string;
  difficulty: ExamQuestion["difficulty"];
  category: string;
  prompt: string;
  choices: string[];
};

// In-memory session store: sessionId -> map(questionId -> StoredQuestion)
const sessionStore = new Map<string, Record<number, StoredQuestion>>();

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

  // create a session and store answers server-side
  const sessionId = crypto.randomUUID();
  const store: Record<number, StoredQuestion> = {};
  for (const q of exam) {
    store[q.id] = {
      id: q.id,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      category: q.category,
      prompt: q.prompt,
      choices: q.choices,
    };
  }

  sessionStore.set(sessionId, store);

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

    const store = sessionStore.get(sessionId);
    if (!store) {
      return NextResponse.json({ error: "invalid or expired sessionId" }, { status: 404 });
    }

    // grade
    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedQuestions: Array<Record<string, unknown>> = [];
    const categoryAgg: Record<string, { earned: number; total: number; correct: number; count: number }> = {};

    for (const idStr of Object.keys(store)) {
      const id = Number(idStr);
      const q = store[id];
      const correct = answers[id] === q.correctAnswer;
      const pts = difficultyPointValue[q.difficulty] || 1;
      totalPoints += pts;
      if (correct) earnedPoints += pts;

      const cat = q.category;
      categoryAgg[cat] = categoryAgg[cat] || { earned: 0, total: 0, correct: 0, count: 0 };
      categoryAgg[cat].total += pts;
      categoryAgg[cat].count += 1;
      if (correct) {
        categoryAgg[cat].earned += pts;
        categoryAgg[cat].correct += 1;
      }

      gradedQuestions.push({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices,
        difficulty: q.difficulty,
        category: q.category,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      });
    }

    const percentage = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= passingPercentage;

    const categoryPerformance = Object.entries(categoryAgg).map(([category, data]) => ({
      category,
      earnedPoints: data.earned,
      totalPoints: data.total,
      correct: data.correct,
      total: data.count,
      percentage: data.total === 0 ? 0 : Math.round((data.earned / data.total) * 100),
    }));

    // once graded, remove session to reduce memory
    sessionStore.delete(sessionId);

    return NextResponse.json({
      gradedQuestions,
      totalPoints,
      earnedPoints,
      percentage,
      passed,
      categoryPerformance,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

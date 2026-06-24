import { NextResponse } from "next/server";

import { examQuestions } from "@/lib/load-question";

export function GET() {
  return NextResponse.json({
    questions: examQuestions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      choices: question.choices,
      category: question.category,
      difficulty: question.difficulty,
    })),
  });
}

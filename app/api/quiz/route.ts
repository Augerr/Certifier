import { NextResponse } from "next/server";

import { examQuestions } from "@/lib/exam-data";

export function GET() {
  return NextResponse.json({
    questions: examQuestions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      choices: question.choices,
      category: question.category,
    })),
  });
}

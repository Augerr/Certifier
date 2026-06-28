import { NextResponse } from "next/server";

import { getQuizAnalytics, resetQuizAnalytics } from "@/lib/quiz-attempt-store";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(getQuizAnalytics());
}

export function DELETE() {
  return NextResponse.json(resetQuizAnalytics());
}

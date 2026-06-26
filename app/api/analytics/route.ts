import { NextResponse } from "next/server";

import { getQuizAnalytics } from "@/lib/quiz-attempt-store";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(getQuizAnalytics());
}

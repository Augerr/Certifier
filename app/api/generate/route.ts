import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { message: "AI question generation is not enabled in this MVP." },
    { status: 501 }
  );
}

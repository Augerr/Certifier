# Saviynt IGA Exam Trainer

A local Next.js mock exam trainer for Saviynt IGA concepts.

## Overview

- `app/page.tsx` is the landing page for selecting exam categories and question count.
- `app/quiz/page.tsx` loads the quiz interface via `components/QuizClient.tsx`.
- `lib/exam-data.ts` contains the local question bank and exports `examQuestions`.
- `lib/exam-generator.ts` builds quiz question sets with difficulty balancing.
- `lib/question-validator.ts` performs question bank validation.
- `app/api/quiz/route.ts` exposes a quiz API endpoint, but the UI currently loads content directly.
- `app/api/generate/route.ts` is intentionally stubbed and returns `501`.

## Project structure

- `app/` — App Router pages and API routes
- `components/` — UI components for the quiz flow
- `components/ui/` — shadcn UI primitives
- `lib/` — question generation, loading, and validation logic
- `types/` — shared TypeScript exam types

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- This MVP uses a fully local question bank.
- AI generation is not enabled in this repo.

## Recommended next improvements

1. Add unit tests for `lib/generateExam` and `lib/question-validator`.
2. Extract the raw question bank into a data-only module or JSON file for easier maintenance.
3. Add a validation script to catch duplicate prompts, invalid answers, and missing explanations.
4. Remove unused dependencies or wire `Prisma` / `OpenAI` into an actual implementation.

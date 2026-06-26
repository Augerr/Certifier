import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import { difficultyPointValue, passingPercentage } from "./exam-constants";
import type {
  PerformanceBucket,
  QuizAnalytics,
} from "../types/analytics";
import type { Difficulty, ExamQuestion } from "../types/question";

type StoredQuestion = {
  id: number;
  correctAnswer: string;
  explanation?: string;
  difficulty: Difficulty;
  category: string;
  prompt: string;
  choices: string[];
};

type StoredQuestionRow = {
  question_id: number;
  prompt: string;
  choices_json: string;
  correct_answer: string;
  explanation: string | null;
  category: string;
  difficulty: Difficulty;
  point_value: number;
};

type BucketRow = {
  label: string;
  total_questions: number;
  correct: number;
  earned_points: number;
  total_points: number;
};

type RecentAttemptRow = {
  id: string;
  completed_at: string;
  total_questions: number;
  earned_points: number;
  total_points: number;
  percentage: number;
  passed: 0 | 1;
};

type SummaryRow = {
  total_attempts: number;
  total_questions_answered: number;
  average_score: number | null;
  passed_attempts: number;
};

declare global {
  var quizAttemptDatabase: Database.Database | undefined;
}

const databasePath =
  process.env.QUIZ_DATABASE_PATH ??
  path.join(process.cwd(), "data", "quiz-attempts.sqlite");

function getDatabase() {
  if (globalThis.quizAttemptDatabase) {
    return globalThis.quizAttemptDatabase;
  }

  const databaseDirectory = path.dirname(databasePath);
  if (!existsSync(databaseDirectory)) {
    mkdirSync(databaseDirectory, { recursive: true });
  }

  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);

  globalThis.quizAttemptDatabase = db;
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      requested_count INTEGER NOT NULL,
      requested_categories TEXT NOT NULL,
      total_questions INTEGER NOT NULL DEFAULT 0,
      total_points INTEGER NOT NULL DEFAULT 0,
      earned_points INTEGER NOT NULL DEFAULT 0,
      percentage INTEGER NOT NULL DEFAULT 0,
      passed INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quiz_attempt_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      prompt TEXT NOT NULL,
      choices_json TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      selected_answer TEXT,
      explanation TEXT,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      point_value INTEGER NOT NULL,
      correct INTEGER,
      FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quiz_attempt_questions_attempt_id
      ON quiz_attempt_questions(attempt_id);

    CREATE INDEX IF NOT EXISTS idx_quiz_attempt_questions_category
      ON quiz_attempt_questions(category);

    CREATE INDEX IF NOT EXISTS idx_quiz_attempt_questions_difficulty
      ON quiz_attempt_questions(difficulty);

    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at
      ON quiz_attempts(completed_at);
  `);
}

function toStoredQuestion(row: StoredQuestionRow): StoredQuestion {
  return {
    id: row.question_id,
    prompt: row.prompt,
    choices: JSON.parse(row.choices_json) as string[],
    correctAnswer: row.correct_answer,
    explanation: row.explanation ?? undefined,
    category: row.category,
    difficulty: row.difficulty,
  };
}

function toBucket(row: BucketRow): PerformanceBucket {
  const totalPoints = row.total_points || 0;

  return {
    label: row.label,
    totalQuestions: row.total_questions,
    correct: row.correct,
    earnedPoints: row.earned_points,
    totalPoints,
    percentage: totalPoints === 0 ? 0 : Math.round((row.earned_points / totalPoints) * 100),
  };
}

export function createQuizAttempt({
  attemptId,
  requestedCount,
  requestedCategories,
  questions,
}: {
  attemptId: string;
  requestedCount: number;
  requestedCategories: string[];
  questions: ExamQuestion[];
}) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const createAttempt = db.prepare(`
    INSERT INTO quiz_attempts (
      id,
      started_at,
      requested_count,
      requested_categories,
      total_questions
    )
    VALUES (@id, @startedAt, @requestedCount, @requestedCategories, @totalQuestions)
  `);
  const createAttemptQuestion = db.prepare(`
    INSERT INTO quiz_attempt_questions (
      attempt_id,
      question_id,
      prompt,
      choices_json,
      correct_answer,
      explanation,
      category,
      difficulty,
      point_value
    )
    VALUES (
      @attemptId,
      @questionId,
      @prompt,
      @choicesJson,
      @correctAnswer,
      @explanation,
      @category,
      @difficulty,
      @pointValue
    )
  `);
  const transaction = db.transaction(() => {
    createAttempt.run({
      id: attemptId,
      startedAt: now,
      requestedCount,
      requestedCategories: JSON.stringify(requestedCategories),
      totalQuestions: questions.length,
    });

    for (const question of questions) {
      createAttemptQuestion.run({
        attemptId,
        questionId: question.id,
        prompt: question.prompt,
        choicesJson: JSON.stringify(question.choices),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        category: question.category,
        difficulty: question.difficulty,
        pointValue: difficultyPointValue[question.difficulty],
      });
    }
  });

  transaction();
}

export function getQuizAttemptQuestions(attemptId: string): StoredQuestion[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
      SELECT
        question_id,
        prompt,
        choices_json,
        correct_answer,
        explanation,
        category,
        difficulty,
        point_value
      FROM quiz_attempt_questions
      WHERE attempt_id = ?
      ORDER BY id
    `,
    )
    .all(attemptId) as StoredQuestionRow[];

  return rows.map(toStoredQuestion);
}

export function completeQuizAttempt(
  attemptId: string,
  answers: Record<number, string>,
) {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
      SELECT
        question_id,
        prompt,
        choices_json,
        correct_answer,
        explanation,
        category,
        difficulty,
        point_value
      FROM quiz_attempt_questions
      WHERE attempt_id = ?
      ORDER BY id
    `,
    )
    .all(attemptId) as StoredQuestionRow[];

  if (rows.length === 0) {
    return null;
  }

  let totalPoints = 0;
  let earnedPoints = 0;
  const categoryAgg: Record<
    string,
    { earned: number; total: number; correct: number; count: number }
  > = {};
  const gradedQuestions: Array<StoredQuestion & { correctAnswer: string }> = [];

  const updateQuestion = db.prepare(`
    UPDATE quiz_attempt_questions
    SET selected_answer = @selectedAnswer,
      correct = @correct
    WHERE attempt_id = @attemptId
      AND question_id = @questionId
  `);
  const updateAttempt = db.prepare(`
    UPDATE quiz_attempts
    SET completed_at = @completedAt,
      total_questions = @totalQuestions,
      total_points = @totalPoints,
      earned_points = @earnedPoints,
      percentage = @percentage,
      passed = @passed
    WHERE id = @attemptId
  `);

  const transaction = db.transaction(() => {
    for (const row of rows) {
      const selectedAnswer = answers[row.question_id];
      const isCorrect = selectedAnswer === row.correct_answer;
      totalPoints += row.point_value;
      if (isCorrect) {
        earnedPoints += row.point_value;
      }

      categoryAgg[row.category] = categoryAgg[row.category] || {
        earned: 0,
        total: 0,
        correct: 0,
        count: 0,
      };
      categoryAgg[row.category].total += row.point_value;
      categoryAgg[row.category].count += 1;
      if (isCorrect) {
        categoryAgg[row.category].earned += row.point_value;
        categoryAgg[row.category].correct += 1;
      }

      updateQuestion.run({
        attemptId,
        questionId: row.question_id,
        selectedAnswer: selectedAnswer ?? null,
        correct: isCorrect ? 1 : 0,
      });

      gradedQuestions.push({
        ...toStoredQuestion(row),
        correctAnswer: row.correct_answer,
      });
    }

    const percentage =
      totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
    updateAttempt.run({
      attemptId,
      completedAt: new Date().toISOString(),
      totalQuestions: rows.length,
      totalPoints,
      earnedPoints,
      percentage,
      passed: percentage >= passingPercentage ? 1 : 0,
    });
  });

  transaction();

  const percentage =
    totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
  const categoryPerformance = Object.entries(categoryAgg).map(([category, data]) => ({
    category,
    earnedPoints: data.earned,
    totalPoints: data.total,
    correct: data.correct,
    total: data.count,
    percentage: data.total === 0 ? 0 : Math.round((data.earned / data.total) * 100),
  }));

  return {
    gradedQuestions,
    totalPoints,
    earnedPoints,
    percentage,
    passed: percentage >= passingPercentage,
    categoryPerformance,
  };
}

function getPerformanceBuckets(groupColumn: "category" | "difficulty") {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
      SELECT
        q.${groupColumn} AS label,
        COUNT(*) AS total_questions,
        SUM(CASE WHEN q.correct = 1 THEN 1 ELSE 0 END) AS correct,
        SUM(CASE WHEN q.correct = 1 THEN q.point_value ELSE 0 END) AS earned_points,
        SUM(q.point_value) AS total_points
      FROM quiz_attempt_questions q
      INNER JOIN quiz_attempts a ON a.id = q.attempt_id
      WHERE a.completed_at IS NOT NULL
      GROUP BY q.${groupColumn}
      ORDER BY total_questions DESC, label ASC
    `,
    )
    .all() as BucketRow[];

  return rows.map(toBucket);
}

export function getQuizAnalytics(): QuizAnalytics {
  const db = getDatabase();
  const summary = db
    .prepare(
      `
      SELECT
        COUNT(*) AS total_attempts,
        COALESCE(SUM(total_questions), 0) AS total_questions_answered,
        AVG(percentage) AS average_score,
        SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) AS passed_attempts
      FROM quiz_attempts
      WHERE completed_at IS NOT NULL
    `,
    )
    .get() as SummaryRow;
  const recentAttempts = db
    .prepare(
      `
      SELECT
        id,
        completed_at,
        total_questions,
        earned_points,
        total_points,
        percentage,
        passed
      FROM quiz_attempts
      WHERE completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT 8
    `,
    )
    .all() as RecentAttemptRow[];
  const byCategory = getPerformanceBuckets("category");
  const byDifficulty = getPerformanceBuckets("difficulty");
  const totalAttempts = summary.total_attempts || 0;

  return {
    totalAttempts,
    totalQuestionsAnswered: summary.total_questions_answered || 0,
    averageScore: Math.round(summary.average_score ?? 0),
    passRate:
      totalAttempts === 0
        ? 0
        : Math.round(((summary.passed_attempts || 0) / totalAttempts) * 100),
    recentAttempts: recentAttempts.map((attempt) => ({
      id: attempt.id,
      completedAt: attempt.completed_at,
      totalQuestions: attempt.total_questions,
      earnedPoints: attempt.earned_points,
      totalPoints: attempt.total_points,
      percentage: attempt.percentage,
      passed: attempt.passed === 1,
    })),
    byCategory,
    byDifficulty,
    weakCategories: [...byCategory]
      .filter((bucket) => bucket.totalQuestions > 0)
      .sort((a, b) => a.percentage - b.percentage || b.totalQuestions - a.totalQuestions)
      .slice(0, 5),
    weakDifficulties: [...byDifficulty]
      .filter((bucket) => bucket.totalQuestions > 0)
      .sort((a, b) => a.percentage - b.percentage || b.totalQuestions - a.totalQuestions)
      .slice(0, 3),
  };
}

"use client";

import { GripVertical, X } from "lucide-react";

import type { ExamQuestion } from "@/types/question";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuestionCardProps = {
  question: ExamQuestion;
  selectedAnswers?: string[];
  onAnswerChange: (answers: string[]) => void;
};

export function QuestionCard({
  question,
  selectedAnswers = [],
  onAnswerChange,
}: QuestionCardProps) {
  const allowsMultipleAnswers =
    question.type === "Multiple" || question.type === "Scenario";
  const isOrderQuestion = question.type === "Order";
  const isMatchQuestion = question.type === "Match";
  const orderedAnswers =
    isOrderQuestion && selectedAnswers.length === 0
      ? question.choices
      : selectedAnswers;
  const matchStatements = question.statements ?? [];
  const matchedAnswers = Array.from(
    { length: matchStatements.length },
    (_, index) => selectedAnswers[index] ?? "",
  );
  const availableMatchAnswers = question.choices.filter(
    (choice) => !matchedAnswers.includes(choice),
  );

  function toggleAnswer(choice: string) {
    if (!allowsMultipleAnswers) {
      onAnswerChange([choice]);
      return;
    }

    onAnswerChange(
      selectedAnswers.includes(choice)
        ? selectedAnswers.filter((answer) => answer !== choice)
        : [...selectedAnswers, choice],
    );
  }

  function moveOrderedAnswer(fromIndex: number, toIndex: number) {
    const nextAnswers = [...orderedAnswers];
    const [movedAnswer] = nextAnswers.splice(fromIndex, 1);
    nextAnswers.splice(toIndex, 0, movedAnswer);
    onAnswerChange(nextAnswers);
  }

  function assignMatchAnswer(statementIndex: number, answer: string) {
    const nextAnswers = matchedAnswers.map((currentAnswer) =>
      currentAnswer === answer ? "" : currentAnswer,
    );
    nextAnswers[statementIndex] = answer;
    onAnswerChange(nextAnswers);
  }

  function clearMatchAnswer(statementIndex: number) {
    const nextAnswers = [...matchedAnswers];
    nextAnswers[statementIndex] = "";
    onAnswerChange(nextAnswers);
  }

  return (
    <Card className="border border-white/10 bg-neutral-900/90 text-neutral-50 shadow-2xl shadow-black/30 ring-0">
      <CardHeader className="gap-3 px-6 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
          >
            {question.category}
          </Badge>
          {(allowsMultipleAnswers || isOrderQuestion || isMatchQuestion) && (
            <Badge
              variant="outline"
              className="border-blue-500/40 bg-blue-500/10 text-blue-200"
            >
              {isOrderQuestion
                ? "Drag to order"
                : isMatchQuestion
                  ? "Drag to match"
                  : "Multiple answers"}
            </Badge>
          )}
        </div>
        {question.type === "Scenario" && question.statements && (
          <div className="grid gap-2 rounded-lg border border-white/10 bg-neutral-950/50 p-3 text-sm text-neutral-300">
            {question.statements.map((statement) => (
              <p key={statement}>{statement}</p>
            ))}
          </div>
        )}
        <CardTitle className="text-xl leading-8 text-white">
          {question.prompt}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isOrderQuestion ? (
          <div className="grid gap-3">
            {orderedAnswers.map((choice, index) => (
              <div
                key={choice}
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData("text/plain", String(index))
                }
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const fromIndex = Number(event.dataTransfer.getData("text/plain"));
                  if (!Number.isNaN(fromIndex)) {
                    moveOrderedAnswer(fromIndex, index);
                  }
                }}
                className="flex min-h-14 cursor-grab items-center gap-3 rounded-lg border border-white/10 bg-neutral-950/60 p-4 text-sm text-neutral-200 active:cursor-grabbing"
              >
                <GripVertical className="size-4 shrink-0 text-neutral-500" aria-hidden="true" />
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-neutral-900 text-xs text-neutral-400">
                  {index + 1}
                </span>
                <span className="flex-1">{choice}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveOrderedAnswer(index, index - 1)}
                    className="rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-300 disabled:opacity-30"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    disabled={index === orderedAnswers.length - 1}
                    onClick={() => moveOrderedAnswer(index, index + 1)}
                    className="rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-300 disabled:opacity-30"
                  >
                    Down
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : isMatchQuestion ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              {availableMatchAnswers.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/plain", choice)
                  }
                  onClick={() => {
                    const firstEmptyIndex = matchedAnswers.findIndex(
                      (answer) => answer === "",
                    );
                    if (firstEmptyIndex >= 0) {
                      assignMatchAnswer(firstEmptyIndex, choice);
                    }
                  }}
                  className="cursor-grab rounded-md border border-white/10 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-200 active:cursor-grabbing"
                >
                  {choice}
                </button>
              ))}
            </div>
            <div className="grid gap-3">
              {matchStatements.map((statement, index) => (
                <div
                  key={statement}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const answer = event.dataTransfer.getData("text/plain");
                    if (answer) {
                      assignMatchAnswer(index, answer);
                    }
                  }}
                  className="grid gap-2 rounded-lg border border-white/10 bg-neutral-950/50 p-4 sm:grid-cols-[1fr_16rem] sm:items-center"
                >
                  <p className="text-sm leading-6 text-neutral-300">{statement}</p>
                  <div className="flex min-h-11 items-center justify-between gap-2 rounded-md border border-dashed border-white/15 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-200">
                    <span>{matchedAnswers[index] || "Drop answer here"}</span>
                    {matchedAnswers[index] && (
                      <button
                        type="button"
                        onClick={() => clearMatchAnswer(index)}
                        className="text-neutral-500 hover:text-neutral-200"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
          {question.choices.map((choice) => {
            const isSelected = selectedAnswers.includes(choice);

            return (
              <button
                key={choice}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleAnswer(choice)}
                className={`flex h-auto min-h-14 w-full cursor-pointer items-center justify-start gap-3 rounded-lg border border-l-4 p-4 text-left text-sm leading-6 transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/15 text-white shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/20"
                    : "border-white/10 border-l-neutral-700 bg-neutral-950/60 text-neutral-300 hover:border-white/25 hover:border-l-neutral-500 hover:bg-neutral-900"
                }`}
              >
                {allowsMultipleAnswers && (
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-400"
                        : "border-white/20"
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span className="flex-1">{choice}</span>
                {isSelected && (
                  <span
                    className="size-2 shrink-0 rounded-full bg-emerald-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

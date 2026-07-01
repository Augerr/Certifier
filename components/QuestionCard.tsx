"use client";

import { Check, GripVertical, X } from "lucide-react";

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

function getSequenceInstruction(type: ExamQuestion["type"]) {
  if (type === "Timeline") {
    return "What happens next?";
  }

  if (type === "Workflow") {
    return "Administrator workflow";
  }

  return "Drag to order";
}

export function QuestionCard({
  question,
  selectedAnswers = [],
  onAnswerChange,
}: QuestionCardProps) {
  const allowsMultipleAnswers =
    question.type === "Multiple" ||
    question.type === "Scenario" ||
    question.type === "Consultant";
  const isSequenceQuestion =
    question.type === "Order" ||
    question.type === "Timeline" ||
    question.type === "Workflow";
  const isMatchQuestion = question.type === "Match";
  const orderedAnswers =
    isSequenceQuestion && selectedAnswers.length === 0
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
    <Card className="overflow-hidden border border-white/10 bg-neutral-900/95 text-neutral-50 shadow-2xl shadow-black/40 ring-1 ring-blue-500/10">
      <div className="h-1 bg-blue-600" />
      <CardHeader className="gap-4 px-6 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
          >
            {question.category}
          </Badge>
          {(allowsMultipleAnswers || isSequenceQuestion || isMatchQuestion) && (
            <Badge
              variant="outline"
              className="border-blue-500/40 bg-blue-500/10 text-blue-200"
            >
              {isSequenceQuestion
                ? getSequenceInstruction(question.type)
                : isMatchQuestion
                  ? "Drag to match"
                  : "Multiple answers"}
            </Badge>
          )}
        </div>
        {question.type === "Scenario" && question.statements && (
          <div className="grid gap-2 rounded-lg border border-white/10 bg-neutral-950/50 p-3 text-base text-neutral-300">
            {question.statements.map((statement) => (
              <p key={statement}>{statement}</p>
            ))}
          </div>
        )}
        <CardTitle className="text-xl leading-8 text-white sm:text-2xl sm:leading-9">
          {question.prompt}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isSequenceQuestion ? (
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
                className="flex min-h-14 cursor-grab items-center gap-3 rounded-lg border border-white/10 bg-neutral-950/70 p-4 text-lg text-neutral-200 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-neutral-900 active:cursor-grabbing active:translate-y-0"
              >
                <GripVertical className="size-4 shrink-0 text-neutral-500" aria-hidden="true" />
                <span className="flex-1">{choice}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveOrderedAnswer(index, index - 1)}
                    className="rounded-md border border-white/10 px-2 py-1 text-sm text-neutral-300 transition hover:border-white/25 hover:bg-white/5 disabled:opacity-30"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    disabled={index === orderedAnswers.length - 1}
                    onClick={() => moveOrderedAnswer(index, index + 1)}
                    className="rounded-md border border-white/10 px-2 py-1 text-sm text-neutral-300 transition hover:border-white/25 hover:bg-white/5 disabled:opacity-30"
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
                  className="cursor-grab rounded-md border border-white/10 bg-neutral-950/70 px-3 py-2 text-lg text-neutral-200 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-neutral-900 active:cursor-grabbing active:translate-y-0"
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
                  className="grid gap-2 rounded-lg border border-white/10 bg-neutral-950/60 p-4 transition hover:border-white/20 sm:grid-cols-[1fr_16rem] sm:items-center"
                >
                  <p className="text-base leading-7 text-neutral-300">{statement}</p>
                  <div
                    className={`flex min-h-11 items-center justify-between gap-2 rounded-md border px-3 py-2 text-base transition ${
                      matchedAnswers[index]
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-100"
                        : "border-dashed border-white/15 bg-neutral-900/70 text-neutral-400"
                    }`}
                  >
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
                className={`group flex h-auto min-h-14 w-full cursor-pointer items-center justify-start gap-3 rounded-lg border border-l-4 p-4 text-left text-lg leading-7 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/15 text-white shadow-blue-950/30 ring-1 ring-blue-400/20"
                    : "border-white/10 border-l-neutral-700 bg-neutral-950/70 text-neutral-300 hover:border-blue-500/30 hover:border-l-blue-500/60 hover:bg-neutral-900"
                }`}
              >
                {allowsMultipleAnswers && (
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? "border-blue-300 bg-blue-400 text-neutral-950"
                        : "border-white/20"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="size-3" />}
                  </span>
                )}
                <span className="flex-1">{choice}</span>
                {isSelected && (
                  <span
                    className="size-2 shrink-0 rounded-full bg-blue-300 shadow-lg shadow-blue-500/40"
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

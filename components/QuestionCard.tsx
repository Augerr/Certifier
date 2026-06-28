"use client";

import { CheckCircle2 } from "lucide-react";

import type { ExamQuestion } from "@/types/question";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type QuestionCardProps = {
  question: ExamQuestion;
  selectedAnswer?: string;
  onAnswerChange: (answer: string) => void;
};

export function QuestionCard({
  question,
  selectedAnswer,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <Card className="border border-white/10 bg-neutral-900/90 text-neutral-50 shadow-2xl shadow-black/30 ring-0">
      <CardHeader className="gap-3 px-6 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <CardDescription className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Saviynt IGA scenario
          </CardDescription>
          <Badge
            variant="outline"
            className="border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
          >
            {question.category}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-8 text-white">
          {question.prompt}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <RadioGroup
          value={selectedAnswer}
          onValueChange={onAnswerChange}
          className="gap-3"
        >
          {question.choices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;

            return (
              <RadioGroupItem
                key={choice}
                value={choice}
                className={`flex h-auto min-h-14 w-full cursor-pointer items-center justify-start gap-3 rounded-lg border p-4 text-left text-sm leading-6 transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-white"
                    : "border-white/10 bg-neutral-950/60 text-neutral-300 hover:border-white/25 hover:bg-neutral-900"
                }`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-medium ${
                    isSelected
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                      : "border-white/10 bg-neutral-900 text-neutral-500"
                  }`}
                >
                  {index + 1}
                </span>
                <span>{choice}</span>
              </RadioGroupItem>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

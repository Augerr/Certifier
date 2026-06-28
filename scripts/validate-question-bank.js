/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const filePath = path.resolve(__dirname, "../data/exam-question-bank.json");
const examQuestionBank = JSON.parse(fs.readFileSync(filePath, "utf8"));

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const issues = [];
const seenPrompts = new Map();
const questionTypes = ["Single", "Multiple", "Order", "Match", "Scenario"];
const questionTypeByLowercase = {
  single: "Single",
  multiple: "Multiple",
  order: "Order",
  match: "Match",
  scenario: "Scenario",
};

for (let index = 0; index < examQuestionBank.length; index += 1) {
  const q = examQuestionBank[index];
  const normalizedPrompt = normalize(q.prompt || "");
  const questionType = questionTypeByLowercase[String(q.type).toLowerCase()];
  const choices = Array.isArray(q.choices) ? q.choices : Array.isArray(q.items) ? q.items : [];
  const correctAnswers = Array.isArray(q.correctAnswers)
    ? q.correctAnswers
    : Array.isArray(q.correctOrder)
      ? q.correctOrder
      : [];

  if (!q.prompt || !String(q.prompt).trim()) {
    issues.push({ index, severity: "error", message: "Missing prompt." });
  }

  if (Object.hasOwn(q, "correctAnswer")) {
    issues.push({ index, severity: "error", message: "Use correctAnswers instead of correctAnswer." });
  }

  if (!questionType || !questionTypes.includes(questionType)) {
    issues.push({ index, severity: "error", message: "Invalid question type." });
  }

  if (seenPrompts.has(normalizedPrompt)) {
    issues.push({
      index,
      severity: "error",
      message: `Duplicate prompt. First seen at index ${seenPrompts.get(normalizedPrompt)}.`,
    });
  } else {
    seenPrompts.set(normalizedPrompt, index);
  }

  const maxChoices = questionType === "Single" ? 4 : 8;

  if (choices.length < 2 || choices.length > maxChoices) {
    issues.push({ index, severity: "error", message: `Question must have between 2 and ${maxChoices} choices.` });
  } else {
    const normalizedChoices = choices.map(normalize);
    const uniqueChoices = new Set(normalizedChoices);

    if (uniqueChoices.size !== choices.length) {
      issues.push({ index, severity: "error", message: "Choices must be unique." });
    }

    if (correctAnswers.length === 0) {
      issues.push({ index, severity: "error", message: "Question must include at least one correctAnswers value." });
    }

    for (const answer of correctAnswers) {
      if (!choices.includes(answer)) {
        issues.push({ index, severity: "error", message: "Each correct answer must exactly match one of the choices." });
      }
    }

    if (new Set(correctAnswers).size !== correctAnswers.length) {
      issues.push({ index, severity: "error", message: "correctAnswers must be unique." });
    }

    if (questionType === "Single" && correctAnswers.length !== 1) {
      issues.push({ index, severity: "error", message: "Single questions must include exactly one correct answer." });
    }

    if (questionType === "Order") {
      const choicesSet = new Set(choices);
      if (
        correctAnswers.length !== choices.length ||
        !correctAnswers.every((answer) => choicesSet.has(answer))
      ) {
        issues.push({ index, severity: "error", message: "Order questions must include every choice in correctAnswers in the correct sequence." });
      }
    }

    if (questionType === "Match") {
      if (!Array.isArray(q.statements) || q.statements.length < 2) {
        issues.push({ index, severity: "error", message: "Match questions must include at least two statements." });
      } else if (q.statements.length !== correctAnswers.length) {
        issues.push({ index, severity: "error", message: "Match questions must have one correct answer per statement." });
      }
    }

    if (questionType === "Scenario" && (!Array.isArray(q.statements) || q.statements.length < 2)) {
      issues.push({ index, severity: "error", message: "Scenario questions must include at least two statements." });
    }
  }

  if (!q.explanation || !String(q.explanation).trim()) {
    issues.push({ index, severity: "warning", message: "Missing explanation." });
  }

  if (!q.category || !String(q.category).trim()) {
    issues.push({ index, severity: "warning", message: "Missing category." });
  }

  if (!["easy", "medium", "hard"].includes(q.difficulty)) {
    issues.push({ index, severity: "error", message: "Invalid difficulty." });
  }
}

const errorCount = issues.filter((issue) => issue.severity === "error").length;
const warningCount = issues.filter((issue) => issue.severity === "warning").length;

console.log(`Exam question bank validation complete. ${errorCount} error(s), ${warningCount} warning(s).`);

if (issues.length > 0) {
  for (const issue of issues) {
    console.log(`${issue.severity.toUpperCase()}: [${issue.index}] ${issue.message}`);
  }
}

if (errorCount > 0) {
  process.exit(1);
}

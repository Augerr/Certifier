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

for (let index = 0; index < examQuestionBank.length; index += 1) {
  const q = examQuestionBank[index];
  const normalizedPrompt = normalize(q.prompt || "");

  if (!q.prompt || !String(q.prompt).trim()) {
    issues.push({ index, severity: "error", message: "Missing prompt." });
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

  if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 4) {
    issues.push({ index, severity: "error", message: "Question must have between 2 and 4 choices." });
  } else {
    const normalizedChoices = q.choices.map(normalize);
    const uniqueChoices = new Set(normalizedChoices);

    if (uniqueChoices.size !== q.choices.length) {
      issues.push({ index, severity: "error", message: "Choices must be unique." });
    }

    if (!q.choices.includes(q.correctAnswer)) {
      issues.push({ index, severity: "error", message: "correctAnswer must exactly match one of the choices." });
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

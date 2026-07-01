export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType =
  | "Single"
  | "Multiple"
  | "Order"
  | "Match"
  | "Scenario"
  | "Timeline"
  | "Workflow";

export const examCategories = [
  "Access Requests",
  "Access Request System",
  "Access Reviews",
  "Applications",
  "Certifications",
  "Controls",
  "Correlation",
  "Data Transformation",
  "Endpoints",
  "Entitlements",
  "Identity Governance",
  "Identity Repository",
  "SoD",
  "Workflows",
  "Approval Workflow",
  "Jobs",
  "Roles",
  "Ownership",
  "Recommendations",
  "Risk Management",
  "Rules",
  "Lifecycle Management",
  "Connectors",
  "Imports",
  "Provisioning",
  "Security Systems",
  "Analytics",
  "Reporting",
] as const;

export type ExamCategory = (typeof examCategories)[number];

export type ExamQuestion = {
  id: number;
  type: QuestionType;
  prompt: string;
  statements?: string[];
  choices: string[];
  correctAnswers: string[];
  correctAnswerCount?: number;
  explanation: string;
  category: ExamCategory;
  difficulty: Difficulty;
};

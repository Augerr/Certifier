export const examCategories = [
  "Access Requests",
  "Certifications",
  "SoD",
  "Workflows",
  "Roles",
  "Lifecycle Management",
  "Connectors",
  "Analytics",
] as const;

export type ExamCategory = (typeof examCategories)[number];

export type ExamQuestion = {
  id: number;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  category: ExamCategory;
  difficulty: "easy" | "medium" | "hard";
};

export const passingPercentage = 70;

type RawExamQuestion = Omit<ExamQuestion, "id" | "category"> & {
  domain: string;
};

const categoryByDomain: Record<string, ExamCategory> = {
  "access requests": "Access Requests",
  certifications: "Certifications",
  SoD: "SoD",
  "JML lifecycle": "Lifecycle Management",
  reconciliation: "Connectors",
  connectors: "Connectors",
  "role mining": "Roles",
  "privileged access": "Workflows",
  workflows: "Workflows",
  "audit reporting": "Analytics",
};

const examQuestionBank: RawExamQuestion[] = [
  {
    prompt:
      "A requester submits access for a finance application, but the request should route to the entitlement owner only when the entitlement is classified as high risk. What is the best design?",
    choices: [
      "Use a conditional approval workflow based on entitlement risk",
      "Require application owner approval for every finance entitlement",
      "Create separate requestable access items for high-risk entitlements",
      "Route finance application requests through manager approval only",
    ],
    correctAnswer:
      "Use a conditional approval workflow based on entitlement risk",
    explanation:
      "Conditional workflow logic can route high-risk entitlement requests to the appropriate owner while keeping lower-risk requests on a simpler path.",
    domain: "access requests",
    difficulty: "hard",
  },
  {
    prompt:
      "A user requests an entitlement that conflicts with an existing SoD policy. The business wants exceptions allowed only with documented mitigation. What should the access workflow include?",
    choices: [
      "An SoD violation check with exception justification and mitigation approval",
      "A manager approval step followed by standard provisioning",
      "A quarterly certification item for the conflicting entitlement",
      "A request policy that blocks all access when any SoD rule is triggered",
    ],
    correctAnswer:
      "An SoD violation check with exception justification and mitigation approval",
    explanation:
      "SoD-aware access requests should detect conflicts and require documented exception handling before access is granted.",
    domain: "access requests",
    difficulty: "hard",
  },
  {
    prompt:
      "An access request is approved, but the target application account is not created. Which evidence should be reviewed first?",
    choices: [
      "Provisioning task status and connector response details",
      "Approval history and the requester's business justification",
      "The latest reconciliation import summary for the target application",
      "The user's identity attributes and request catalog eligibility",
    ],
    correctAnswer: "Provisioning task status and connector response details",
    explanation:
      "Approved requests depend on provisioning execution, so task status and connector responses are the most direct troubleshooting evidence.",
    domain: "access requests",
    difficulty: "hard",
  },
  {
    prompt:
      "A company wants contractors to request access only to applications assigned to their business unit. Which control is most appropriate?",
    choices: [
      "Catalog filtering based on identity attributes",
      "A request workflow that rejects contractors after submission",
      "A certification campaign scoped to contractor-owned accounts",
      "A birthright role assigned to all contractors in the identity source",
    ],
    correctAnswer: "Catalog filtering based on identity attributes",
    explanation:
      "Catalog filtering can restrict visible requestable access based on attributes such as worker type, department, or business unit.",
    domain: "access requests",
    difficulty: "hard",
  },
  {
    prompt:
      "A manager complains that a direct report's access request never reached them for approval. The workflow is configured for manager approval. What should be checked first?",
    choices: [
      "Whether the identity has a populated and correctly resolved manager attribute",
      "Whether the entitlement owner is configured as a fallback approver",
      "Whether the request policy bypasses manager approval for low-risk access",
      "Whether the manager's access request delegation is currently active",
    ],
    correctAnswer:
      "Whether the identity has a populated and correctly resolved manager attribute",
    explanation:
      "Manager approval routing depends on the identity's manager relationship being present and correctly resolved.",
    domain: "access requests",
    difficulty: "hard",
  },
  {
    prompt:
      "A quarterly certification should include only users with privileged entitlements in an application. What campaign scope is most appropriate?",
    choices: [
      "A certification scoped to privileged entitlements or high-risk access",
      "A manager certification that includes every entitlement in the application",
      "An application owner campaign scoped to all accounts in the system",
      "A certification of only users who requested access in the last quarter",
    ],
    correctAnswer:
      "A certification scoped to privileged entitlements or high-risk access",
    explanation:
      "Risk-based certification scope allows reviewers to focus on privileged or high-risk access without reviewing unrelated access.",
    domain: "certifications",
    difficulty: "hard",
  },
  {
    prompt:
      "During a manager certification, a reviewer revokes an entitlement. What must happen for the decision to be effective?",
    choices: [
      "A deprovisioning task must be generated and completed successfully",
      "The campaign owner must sign off after the revoke decision is submitted",
      "The target account must be included in the next reconciliation cycle",
      "The entitlement must be removed from the request catalog",
    ],
    correctAnswer:
      "A deprovisioning task must be generated and completed successfully",
    explanation:
      "A revoke decision is only operationally complete when the corresponding deprovisioning action is executed in the target system.",
    domain: "certifications",
    difficulty: "hard",
  },
  {
    prompt:
      "A reviewer bulk-approves all access during a campaign without inspecting high-risk items. What control would best reduce this risk?",
    choices: [
      "Require separate review or additional justification for high-risk access",
      "Route the entire campaign to application owners instead of managers",
      "Require comments only when reviewers revoke low-risk access",
      "Split the campaign by department while keeping the same review rules",
    ],
    correctAnswer:
      "Require separate review or additional justification for high-risk access",
    explanation:
      "High-risk access should receive additional scrutiny through workflow rules, justification, or separate campaign treatment.",
    domain: "certifications",
    difficulty: "hard",
  },
  {
    prompt:
      "A certification owner needs proof that reviewers completed reviews before the deadline and that revoked items were remediated. Which evidence is most relevant?",
    choices: [
      "Campaign completion records, reviewer decisions, and remediation task status",
      "Campaign launch configuration, reminder schedule, and reviewer list",
      "Application owner assignments and entitlement metadata exports",
      "Reconciliation history showing account state before the campaign",
    ],
    correctAnswer:
      "Campaign completion records, reviewer decisions, and remediation task status",
    explanation:
      "Certification audit evidence should include decisions, timestamps, completion status, and remediation results.",
    domain: "certifications",
    difficulty: "hard",
  },
  {
    prompt:
      "An application owner should certify accounts that are not correlated to any identity. What campaign type or scope is best suited?",
    choices: [
      "An orphan or uncorrelated account certification scoped to the application",
      "A manager certification scoped only to active employees",
      "A privileged access review scoped to emergency access assignments",
      "A role owner certification scoped to mined business roles",
    ],
    correctAnswer:
      "An orphan or uncorrelated account certification scoped to the application",
    explanation:
      "Uncorrelated accounts are best reviewed by application owners who can determine ownership, validity, or removal.",
    domain: "certifications",
    difficulty: "hard",
  },
  {
    prompt:
      "A user has access to create suppliers and approve supplier payments. The SoD rule is not detecting a violation. What should be inspected first?",
    choices: [
      "Whether the entitlements are correctly mapped to conflicting SoD functions",
      "Whether the user's request history includes both access grants",
      "Whether the application owner approved both entitlement assignments",
      "Whether the SoD policy is included in the next certification campaign",
    ],
    correctAnswer:
      "Whether the entitlements are correctly mapped to conflicting SoD functions",
    explanation:
      "SoD detection depends on accurate mapping between entitlements and the business functions that conflict.",
    domain: "SoD",
    difficulty: "hard",
  },
  {
    prompt:
      "The business wants to allow an SoD violation for one user because compensating controls exist. What should be recorded?",
    choices: [
      "Exception owner, justification, mitigation control, and expiration or review date",
      "The approver chain, request ID, and current connector task status",
      "The certification reviewer comments and campaign completion timestamp",
      "The application owner, entitlement description, and account correlation key",
    ],
    correctAnswer:
      "Exception owner, justification, mitigation control, and expiration or review date",
    explanation:
      "SoD exceptions should be documented, owned, time-bound or periodically reviewed, and tied to mitigating controls.",
    domain: "SoD",
    difficulty: "hard",
  },
  {
    prompt:
      "A role contains two entitlements that create an SoD conflict when assigned together. What is the best governance response?",
    choices: [
      "Review and redesign the role to remove or explicitly manage the toxic combination",
      "Require manager approval for every assignment of the role",
      "Add the role to the annual certification schedule unchanged",
      "Mark the role as requestable only for users in the affected department",
    ],
    correctAnswer:
      "Review and redesign the role to remove or explicitly manage the toxic combination",
    explanation:
      "Roles can package toxic access, so role contents must be reviewed for SoD conflicts before broad assignment.",
    domain: "SoD",
    difficulty: "hard",
  },
  {
    prompt:
      "A user requests emergency access that violates an SoD rule. Which process is strongest?",
    choices: [
      "Require emergency approval, document the violation, limit duration, and review activity after use",
      "Require application owner approval and convert the grant into a standing role",
      "Allow the request but suppress the SoD violation until the next campaign",
      "Create a mitigation record after provisioning without expiration",
    ],
    correctAnswer:
      "Require emergency approval, document the violation, limit duration, and review activity after use",
    explanation:
      "Emergency access should be time-bound, approved, monitored, and reviewed, especially when it creates SoD risk.",
    domain: "SoD",
    difficulty: "hard",
  },
  {
    prompt:
      "An SoD report shows many false positives after a new application integration. What is the likely cause?",
    choices: [
      "Overbroad or incorrect entitlement-to-function mappings",
      "Too many request workflows mapped to the same application",
      "Manager approvals being required for low-risk entitlements",
      "Certification campaigns using application owners instead of managers",
    ],
    correctAnswer: "Overbroad or incorrect entitlement-to-function mappings",
    explanation:
      "False positives often occur when technical entitlements are mapped too broadly or incorrectly to business functions.",
    domain: "SoD",
    difficulty: "hard",
  },
  {
    prompt:
      "A new employee should automatically receive baseline access based on department and location. Which mechanism best supports this?",
    choices: [
      "Birthright access rules driven by identity attributes",
      "Request catalog eligibility rules driven by business unit",
      "A manager-approved access request generated after onboarding",
      "A role mining recommendation promoted to production monthly",
    ],
    correctAnswer: "Birthright access rules driven by identity attributes",
    explanation:
      "Birthright rules use trusted identity attributes to assign standard access during joiner processing.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "An employee changes departments but retains access from the old department. What should be reviewed?",
    choices: [
      "Mover rules, access removal logic, and provisioning task execution",
      "Manager approval routing and request catalog eligibility",
      "Role mining coverage and role owner approval history",
      "Certification campaign scope and reviewer delegation settings",
    ],
    correctAnswer:
      "Mover rules, access removal logic, and provisioning task execution",
    explanation:
      "Mover events must both grant new required access and remove access that is no longer appropriate.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "A terminated employee still has an active account in a target application. Which evidence should be examined?",
    choices: [
      "Termination event ingestion, leaver rule execution, deprovisioning task, and connector response",
      "The last certification decision, reviewer comments, and sign-off status",
      "The access request approval chain and original business justification",
      "The orphan account campaign scope and application owner assignment",
    ],
    correctAnswer:
      "Termination event ingestion, leaver rule execution, deprovisioning task, and connector response",
    explanation:
      "Leaver troubleshooting should follow the event from source identity data through rule execution and target deprovisioning.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "HR sends future-dated hires before their start date. The business wants access active only on day one. What design should be used?",
    choices: [
      "Trigger provisioning based on effective start date rather than import date",
      "Provision baseline access when the manager approves the new hire record",
      "Create accounts immediately but delay entitlement assignment until certification",
      "Hold all joiner tasks until the next scheduled reconciliation completes",
    ],
    correctAnswer:
      "Trigger provisioning based on effective start date rather than import date",
    explanation:
      "Future-dated lifecycle events should respect effective dates so access is available when appropriate but not too early.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "A contractor extension is entered in the HR source, but their access expires anyway. What is the best first check?",
    choices: [
      "Whether the updated end date was imported and used by lifecycle or expiration rules",
      "Whether the user completed a certification review",
      "Whether the contractor's manager approved the original access request",
      "Whether the target application reconciliation job ran before expiration",
    ],
    correctAnswer:
      "Whether the updated end date was imported and used by lifecycle or expiration rules",
    explanation:
      "Contractor access expiration depends on accurate end-date ingestion and rules that act on that date.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "A reconciliation job imports accounts but creates duplicates for the same identity. What is the most likely configuration issue?",
    choices: [
      "Correlation rules are not matching accounts to existing identities consistently",
      "The connector is importing entitlement memberships before account records",
      "The identity source is sending manager changes after account reconciliation",
      "The application owner campaign is scoped to all unmatched accounts",
    ],
    correctAnswer:
      "Correlation rules are not matching accounts to existing identities consistently",
    explanation:
      "Duplicate accounts often indicate poor matching logic or inconsistent source attributes used for correlation.",
    domain: "reconciliation",
    difficulty: "hard",
  },
  {
    prompt:
      "A target application shows entitlements removed directly in the application, but Saviynt still shows them as active. What should be done?",
    choices: [
      "Run or troubleshoot reconciliation so authoritative account state is refreshed",
      "Approve a new access request for the same entitlement",
      "Generate a certification revoke task for the entitlement",
      "Recalculate request catalog eligibility for the affected user",
    ],
    correctAnswer:
      "Run or troubleshoot reconciliation so authoritative account state is refreshed",
    explanation:
      "Reconciliation updates Saviynt's view of target accounts and entitlements after out-of-band changes.",
    domain: "reconciliation",
    difficulty: "hard",
  },
  {
    prompt:
      "An application has many orphan accounts after initial reconciliation. What should the identity team prioritize?",
    choices: [
      "Validate correlation attributes and review orphan accounts with application owners",
      "Create requestable access items for each unmatched account",
      "Assign all orphan accounts to the account owner's manager",
      "Exclude the application from SoD analysis until the next import",
    ],
    correctAnswer:
      "Validate correlation attributes and review orphan accounts with application owners",
    explanation:
      "Orphan accounts may reflect poor correlation or real unmanaged access, so both rule tuning and ownership review are needed.",
    domain: "reconciliation",
    difficulty: "hard",
  },
  {
    prompt:
      "A reconciliation feed contains multi-valued group memberships. What is important for accurate access modeling?",
    choices: [
      "Parsing and mapping each membership to the correct entitlement representation",
      "Importing only the highest-risk membership for each account",
      "Treating each group membership as a separate identity record",
      "Mapping all memberships to a single application-level role",
    ],
    correctAnswer:
      "Parsing and mapping each membership to the correct entitlement representation",
    explanation:
      "Access reviews and SoD analysis require group or entitlement memberships to be modeled as discrete access objects.",
    domain: "reconciliation",
    difficulty: "hard",
  },
  {
    prompt:
      "A reconciliation job fails only after the target API returns a rate-limit response. What connector behavior should be considered?",
    choices: [
      "Retry, throttling, pagination, and error handling settings",
      "Account correlation rules and identity attribute transformations",
      "Entitlement owner mappings and request workflow approvals",
      "Certification launch schedule and remediation task priority",
    ],
    correctAnswer: "Retry, throttling, pagination, and error handling settings",
    explanation:
      "API connectors must handle operational constraints such as pagination, throttling, retries, and transient failures.",
    domain: "connectors",
    difficulty: "hard",
  },
  {
    prompt:
      "A connector successfully creates accounts but fails when adding entitlements. What should be inspected?",
    choices: [
      "Entitlement provisioning operation mappings and target API responses",
      "The identity import schedule and manager correlation rule",
      "Account correlation rules used during reconciliation",
      "The requester's manager and business justification",
    ],
    correctAnswer:
      "Entitlement provisioning operation mappings and target API responses",
    explanation:
      "Account creation and entitlement assignment may use different connector operations, payloads, permissions, or API endpoints.",
    domain: "connectors",
    difficulty: "hard",
  },
  {
    prompt:
      "A target system requires a unique username generated from first initial and last name, with collision handling. Where should this be addressed?",
    choices: [
      "Account attribute generation or transformation logic before provisioning",
      "Certification reminder configuration",
      "Application owner approval routing before account creation",
      "Post-provisioning reconciliation frequency for the target",
    ],
    correctAnswer:
      "Account attribute generation or transformation logic before provisioning",
    explanation:
      "Connector provisioning often depends on correct account attribute generation, including unique identifiers and collision handling.",
    domain: "connectors",
    difficulty: "hard",
  },
  {
    prompt:
      "A connector uses a service account that can read users but cannot disable accounts. What symptom is likely?",
    choices: [
      "Reconciliation may succeed while deprovisioning fails",
      "Access requests may remain pending until the next certification closes",
      "SoD analysis may stop evaluating entitlements from that application",
      "Account correlation may create duplicate identities during import",
    ],
    correctAnswer: "Reconciliation may succeed while deprovisioning fails",
    explanation:
      "Read and write operations can require different permissions, so a connector may reconcile successfully but fail provisioning actions.",
    domain: "connectors",
    difficulty: "hard",
  },
  {
    prompt:
      "A connector maps entitlement display names but not stable entitlement IDs. What governance risk does this create?",
    choices: [
      "Access may be misidentified if names change or are not unique",
      "Reconciliation may import accounts without entitlement membership data",
      "Manager certifications may route items to application owners",
      "Request catalog eligibility may become dependent on user department",
    ],
    correctAnswer:
      "Access may be misidentified if names change or are not unique",
    explanation:
      "Stable IDs are important for reliable reconciliation, provisioning, certification decisions, and audit evidence.",
    domain: "connectors",
    difficulty: "hard",
  },
  {
    prompt:
      "Role mining suggests a role containing access used by 95% of finance analysts plus one privileged admin entitlement used by one person. What should the role owner do?",
    choices: [
      "Exclude the privileged outlier and review it separately",
      "Create the role but require manager approval for every assignment",
      "Include the privileged entitlement and flag the role as high risk",
      "Split the role by location while preserving the same entitlement set",
    ],
    correctAnswer: "Exclude the privileged outlier and review it separately",
    explanation:
      "Role mining recommendations require business review; outlier or privileged access should not be bundled into broad roles casually.",
    domain: "role mining",
    difficulty: "hard",
  },
  {
    prompt:
      "A proposed birthright role includes access that creates SoD conflicts for some users. What is the best action?",
    choices: [
      "Refine role membership or entitlement composition and apply SoD checks before assignment",
      "Require an SoD exception for every user who receives the birthright role",
      "Publish the role and rely on quarterly certification to detect conflicts",
      "Restrict the role to employees whose managers approve the exception",
    ],
    correctAnswer:
      "Refine role membership or entitlement composition and apply SoD checks before assignment",
    explanation:
      "Birthright roles must still respect SoD and least privilege requirements.",
    domain: "role mining",
    difficulty: "hard",
  },
  {
    prompt:
      "Business users say a mined role is technically accurate but not meaningful to how work is performed. What is missing?",
    choices: [
      "Business validation of role purpose, ownership, and membership criteria",
      "A longer connector timeout",
      "An additional reconciliation job before role publication",
      "A stricter request workflow for assigning the mined role",
    ],
    correctAnswer:
      "Business validation of role purpose, ownership, and membership criteria",
    explanation:
      "Role mining identifies patterns, but business validation ensures roles are understandable, owned, and appropriate.",
    domain: "role mining",
    difficulty: "hard",
  },
  {
    prompt:
      "A role is approved for production. What ongoing governance control should be applied?",
    choices: [
      "Periodic role content and membership certification",
      "Automatic assignment to all users matching the original mining sample",
      "Permanent approval of all entitlements included in the role",
      "Removal of underlying entitlements from application owner campaigns",
    ],
    correctAnswer: "Periodic role content and membership certification",
    explanation:
      "Roles drift over time, so their contents, owners, and memberships should be periodically reviewed.",
    domain: "role mining",
    difficulty: "hard",
  },
  {
    prompt:
      "A mined role has high coverage but also grants access unrelated to the user's job duties. Which principle should guide the decision?",
    choices: [
      "Least privilege over maximum role coverage",
      "Largest possible entitlement bundle",
      "Highest statistical confidence over business interpretability",
      "Minimizing the number of roles regardless of entitlement sensitivity",
    ],
    correctAnswer: "Least privilege over maximum role coverage",
    explanation:
      "Role quality should favor appropriate access, not simply broad statistical coverage.",
    domain: "role mining",
    difficulty: "hard",
  },
  {
    prompt:
      "An administrator needs database administrator access for a production incident for two hours. What is the strongest privileged access control?",
    choices: [
      "Time-bound elevated access with approval, logging, and post-access review",
      "Permanent DBA access after one approval",
      "Standing privileged role assignment with quarterly certification",
      "Emergency access granted first with approval collected after the incident",
    ],
    correctAnswer:
      "Time-bound elevated access with approval, logging, and post-access review",
    explanation:
      "Privileged access should be temporary, approved, attributable, monitored, and reviewed after use.",
    domain: "privileged access",
    difficulty: "hard",
  },
  {
    prompt:
      "A privileged access workflow allows users to approve their own emergency access. What is the primary issue?",
    choices: [
      "Lack of independent approval and separation of duties",
      "Missing reconciliation evidence for the privileged account",
      "Insufficient role mining coverage for privileged entitlements",
      "Lack of category filtering in the request catalog",
    ],
    correctAnswer: "Lack of independent approval and separation of duties",
    explanation:
      "Privileged access approvals should be independent to avoid self-authorization of high-risk access.",
    domain: "privileged access",
    difficulty: "hard",
  },
  {
    prompt:
      "A shared privileged account is used by several administrators. What control is needed for accountability?",
    choices: [
      "Checkout or session controls that tie use to an individual identity",
      "A quarterly manager certification of the shared account",
      "A request workflow that grants access to the shared account group",
      "An application owner attestation that the shared account is required",
    ],
    correctAnswer:
      "Checkout or session controls that tie use to an individual identity",
    explanation:
      "Shared privileged access must preserve individual attribution through controlled checkout, approval, and logging.",
    domain: "privileged access",
    difficulty: "hard",
  },
  {
    prompt:
      "A privileged entitlement is requestable by all users in the catalog. What is the best remediation?",
    choices: [
      "Restrict eligibility and require enhanced approval for privileged entitlements",
      "Remove all approval steps from the workflow",
      "Keep it requestable but rely on quarterly access certification",
      "Allow requests only after the user has completed role mining review",
    ],
    correctAnswer:
      "Restrict eligibility and require enhanced approval for privileged entitlements",
    explanation:
      "Privileged access should have limited eligibility and stronger approval or justification requirements.",
    domain: "privileged access",
    difficulty: "hard",
  },
  {
    prompt:
      "An auditor asks who had privileged access to a critical application during a specific incident window. Which evidence is most relevant?",
    choices: [
      "Time-bound assignment history, approvals, and session or activity logs",
      "The latest certification sign-off and remediation summary",
      "The last reconciliation status and orphan account review results",
      "The request catalog eligibility rule and entitlement metadata",
    ],
    correctAnswer:
      "Time-bound assignment history, approvals, and session or activity logs",
    explanation:
      "Privileged access audits require evidence of who had access, when, why, who approved it, and what activity occurred.",
    domain: "audit reporting",
    difficulty: "hard",
  },
  {
    prompt:
      "A control owner wants a monthly report of overdue certifications, revoked-but-not-remediated items, and high-risk exceptions. What should the report combine?",
    choices: [
      "Campaign status, remediation task status, and risk or exception data",
      "Identity population counts, source imports, and manager coverage",
      "Certification launch dates, reviewer assignments, and email reminders",
      "Access request volume, approval turnaround time, and catalog changes",
    ],
    correctAnswer:
      "Campaign status, remediation task status, and risk or exception data",
    explanation:
      "Meaningful governance reporting combines review completion, remediation outcomes, and risk exception status.",
    domain: "audit reporting",
    difficulty: "hard",
  },
  {
    prompt:
      "An auditor asks why a terminated user's access was removed three days late. What evidence best explains the control failure?",
    choices: [
      "Identity event timestamp, leaver processing logs, provisioning task history, and connector errors",
      "The user's last completed access certification decision",
      "The terminated user's last manager certification decision",
      "The original access request ID and entitlement owner approval",
    ],
    correctAnswer:
      "Identity event timestamp, leaver processing logs, provisioning task history, and connector errors",
    explanation:
      "Late removal analysis requires tracing the event, rule processing, task generation, and target execution.",
    domain: "audit reporting",
    difficulty: "hard",
  },
  {
    prompt:
      "A compliance team wants to prove that access approvals are not being bypassed for sensitive entitlements. Which report is most useful?",
    choices: [
      "Request history showing requester, approvers, decisions, timestamps, and provisioning outcomes",
      "A count of active UI sessions",
      "Certification sign-off records for the same application",
      "Reconciliation statistics showing account and entitlement counts",
    ],
    correctAnswer:
      "Request history showing requester, approvers, decisions, timestamps, and provisioning outcomes",
    explanation:
      "Approval auditability depends on complete request records with decision, timing, and provisioning evidence.",
    domain: "audit reporting",
    difficulty: "hard",
  },
  {
    prompt:
      "A report shows many open provisioning failures for revoked access. Why is this a serious governance issue?",
    choices: [
      "Review decisions have not resulted in actual access removal",
      "The remediation report includes items from multiple applications",
      "The certification scope included both managers and application owners",
      "The report combines remediation data with request approval history",
    ],
    correctAnswer:
      "Review decisions have not resulted in actual access removal",
    explanation:
      "A revoke decision without successful remediation leaves inappropriate access active despite apparent certification completion.",
    domain: "audit reporting",
    difficulty: "hard",
  },
  {
    prompt:
      "Which of the following statements is incorrect regarding the successful implementation of IGA?",
    choices: [
      "Maintaining a higher total cost of ownership (TCO)",
      "Providing the right access at the right time",
      "Clearing the audit process",
      "Providing cataloguing feature and governing all critical applications",
    ],
    correctAnswer: "Maintaining a higher total cost of ownership (TCO)",
    explanation:
      "A successful IGA implementation is intended to reduce operational costs and improve efficiency, not increase TCO.",
    domain: "audit reporting",
    difficulty: "hard",
  },
  {
    prompt:
      "Which of the following statements is incorrect about Data Transformation in Saviynt?",
    choices: [
      "Can be performed in the Post-Import stage",
      "Can be performed in the Pre-Import stage",
      "Can be performed using the user pre-processor config JSON at the file upload level only",
      "Can be performed in the Post-Import stage by using the CUSTOMQUERYJOB job",
    ],
    correctAnswer:
      "Can be performed using the user pre-processor config JSON at the file upload level only",
    explanation:
      "Saviynt data transformation can be performed at different import stages and is not limited only to file upload-level user pre-processor configuration.",
    domain: "connectors",
    difficulty: "hard",
  },
  {
    prompt: "What are the different ways to add SAV Roles?",
    choices: [
      "Connection",
      "Access Request System and JRM",
      "Technical / User Update Rule",
      "All of the above",
    ],
    correctAnswer: "All of the above",
    explanation:
      "SAV Roles can be assigned through multiple mechanisms, including connections, access requests or JRM, and rules.",
    domain: "role mining",
    difficulty: "hard",
  },
  {
    prompt:
      "Through SAV Roles, you can control what end-users can do at both broad and granular levels in EIC.",
    choices: ["True", "False"],
    correctAnswer: "True",
    explanation:
      "SAV Roles govern user capabilities in EIC at both broad functional and granular permission levels.",
    domain: "role mining",
    difficulty: "hard",
  },
  {
    prompt:
      "The SAV Role name must be in uppercase. For example, ROLE_SAV_MANAGER.",
    choices: ["True", "False"],
    correctAnswer: "True",
    explanation:
      "SAV Role naming follows the expected uppercase format, such as ROLE_SAV_MANAGER.",
    domain: "role mining",
    difficulty: "hard",
  },
  {
    prompt:
      "If a user is still having access to critical applications even after leaving an organization or moving to any other department, it is a risk to the company. Which identity event do you think should have been managed properly to avoid such risks?",
    choices: ["Resignation", "Exit Interview", "Offboarding", "Transfer"],
    correctAnswer: "Offboarding",
    explanation:
      "Offboarding processes ensure access is removed when a user leaves the organization or no longer needs it.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "Technical Rules are used to provision ___________ to employees joining a company based on specified conditions.",
    choices: [
      "Automatic Access",
      "Birthright Access",
      "Remove Birthright Access",
      "An Account",
    ],
    correctAnswer: "Birthright Access",
    explanation:
      "Technical Rules are commonly used to grant birthright access based on user attributes and specified conditions.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "Technical Rules can be triggered from User Update Rules through re-run of all provisioning rules and selected Technical Rule actions. Select the correct option and click Submit.",
    choices: ["True", "False"],
    correctAnswer: "True",
    explanation:
      "User Update Rules can trigger Technical Rule processing through actions that rerun provisioning rules or selected Technical Rules.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "Edward an IT admin has setup a new Employee Onboarding Rule in Saviynt. He noticed that the new employees were not assigned any access even after setting up the rule, and that the rules were not running as expected.",
    choices: [
      "Set up a Technical Rule",
      "Set up a User Update Rule",
      "Check the Execution Trail page for help with troubleshooting, and rerun the failed rules and actions",
      "None of the above",
    ],
    correctAnswer:
      "Check the Execution Trail page for help with troubleshooting, and rerun the failed rules and actions",
    explanation:
      "The Execution Trail page helps troubleshoot rule execution issues and supports rerunning failed rules and actions.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "When a user's employee type is changed (condition), an action to launch a certification by the manager should be added along with another action such as notifying by an email.",
    choices: [
      "Request Rules",
      "Technical Rules",
      "User Update Rules",
      "Scan Rules",
    ],
    correctAnswer: "User Update Rules",
    explanation:
      "User Update Rules respond to identity attribute changes and can launch actions such as notifications or certifications.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "Identity BOT enables you to integrate Saviynt Enterprise Identity Cloud with applications that do not expose _______________.",
    choices: [
      "Integration APIs",
      "Accounts",
      "Reconciliation APIs",
      "None of the above",
    ],
    correctAnswer: "Integration APIs",
    explanation:
      "Identity BOT helps integrate with applications that do not expose standard integration APIs.",
    domain: "connectors",
    difficulty: "hard",
  },
  {
    prompt: "Saviynt Access Review supports",
    choices: [
      "Connected Applications",
      "Disconnected Applications",
      "Hybrid Applications",
      "All the Above",
    ],
    correctAnswer: "All the Above",
    explanation:
      "Saviynt Access Review supports access reviews across connected, disconnected, and hybrid applications.",
    domain: "certifications",
    difficulty: "hard",
  },
  {
    prompt: "How can you make an Application requestable?",
    choices: [
      "By adding an Endpoint to the Security System",
      "By adding a Workflow to the Security System",
      "By making an Application requestable in Global Configuration",
      "None of the above",
    ],
    correctAnswer: "By adding a Workflow to the Security System",
    explanation:
      "Associating a workflow with the security system is required for making the application requestable through access requests.",
    domain: "access requests",
    difficulty: "hard",
  },
  {
    prompt:
      "How many personas does the Saviynt's Access Request System support?",
    choices: ["3", "5", "7", "9"],
    correctAnswer: "3",
    explanation: "Saviynt's Access Request System supports three personas.",
    domain: "access requests",
    difficulty: "hard",
  },
  {
    prompt: "What is the initial step to enable an ES-based query?",
    choices: [
      "Fetch data directly from Elasticsearch",
      "Create and execute an ES-based SQL query to retrieve records from the SQL database and store them in Elasticsearch",
      "Set up indices in Elasticsearch",
      "Define controls for data retrieval",
    ],
    correctAnswer:
      "Create and execute an ES-based SQL query to retrieve records from the SQL database and store them in Elasticsearch",
    explanation:
      "An ES-based query begins by creating and executing the SQL query that retrieves database records and stores them in Elasticsearch.",
    domain: "audit reporting",
    difficulty: "hard",
  },
  {
    prompt:
      "How is the data utilized once available in Elasticsearch after executing the SQL query?",
    choices: [
      "It is analyzed using SQL commands",
      "Stored in a separate index for future reference",
      "Utilized to create analytics controls",
      "Transferred back to the SQL database",
    ],
    correctAnswer: "Utilized to create analytics controls",
    explanation:
      "Once the data is available in Elasticsearch, it can be used to create analytics controls.",
    domain: "audit reporting",
    difficulty: "hard",
  },
  {
    prompt:
      "You can create a _______________ if you wish to get a certain set of data from the Saviynt database. This is the most powerful of all analytics configurations since it allows retrieval of data directly from the database.",
    choices: [
      "Runtime Analytics Control",
      "Elasticsearch Query",
      "SQL query",
      "Custom Analytics Control",
    ],
    correctAnswer: "SQL query",
    explanation:
      "A SQL query can retrieve a specific set of data directly from the Saviynt database for analytics configuration.",
    domain: "audit reporting",
    difficulty: "hard",
  },
  {
    prompt:
      "What is the primary purpose of Identity Governance and Administration (IGA)?",
    choices: [
      "Manage network devices",
      "Control and govern digital identities and access rights",
      "Monitor application performance",
      "Manage database backups",
    ],
    correctAnswer: "Control and govern digital identities and access rights",
    explanation:
      "IGA solutions exist to govern who has access to what, ensuring identities and their access rights are managed, reviewed, and controlled.",
    domain: "JML lifecycle",
    difficulty: "easy",
  },
  {
    prompt: "In Saviynt, a Security System primarily represents:",
    choices: [
      "A collection of applications and endpoints",
      "A workflow engine",
      "An approval process",
      "A role hierarchy",
    ],
    correctAnswer: "A collection of applications and endpoints",
    explanation:
      "A Security System is a logical container that groups related endpoints and applications belonging to the same target system family.",
    domain: "connectors",
    difficulty: "medium",
  },
  {
    prompt:
      "Which object is used to represent a permission within an application?",
    choices: ["User", "Account", "Entitlement", "Endpoint"],
    correctAnswer: "Entitlement",
    explanation:
      "An entitlement represents a specific permission, privilege, or access right available within an application.",
    domain: "role mining",
    difficulty: "easy",
  },
  {
    prompt: "Which lifecycle event typically removes access from a user?",
    choices: ["Joiner", "Mover", "Leaver", "Approver"],
    correctAnswer: "Leaver",
    explanation:
      "The Leaver event handles termination or offboarding, which typically results in revoking and removing the user's access.",
    domain: "JML lifecycle",
    difficulty: "easy",
  },
  {
    prompt: "What is the purpose of an Endpoint?",
    choices: [
      "Store workflow definitions",
      "Represent a target system connection",
      "Create certification campaigns",
      "Generate reports",
    ],
    correctAnswer: "Represent a target system connection",
    explanation:
      "An endpoint represents the connection configuration used to integrate Saviynt with a specific target application or system.",
    domain: "connectors",
    difficulty: "easy",
  },
  {
    prompt: "How can an application be made requestable?",
    choices: [
      "Add a workflow to the application",
      "Add an endpoint to the security system",
      "Enable requestable settings on the application",
      "Assign a campaign owner",
    ],
    correctAnswer: "Enable requestable settings on the application",
    explanation:
      "Requestable settings must be enabled on the application (and its entitlements) for it to appear in the access request catalog.",
    domain: "access requests",
    difficulty: "medium",
  },
  {
    prompt:
      "Which access review focuses on reviewing entitlement details and users assigned to an entitlement?",
    choices: [
      "User Access Review",
      "Manager Review",
      "Entitlement Owner Review",
      "Role Review",
    ],
    correctAnswer: "Entitlement Owner Review",
    explanation:
      "An Entitlement Owner Review lets the entitlement owner certify whether the entitlement and the users assigned to it remain appropriate.",
    domain: "certifications",
    difficulty: "medium",
  },
  {
    prompt:
      "Which certification participant is typically responsible for reviewing employee access?",
    choices: [
      "Endpoint Owner",
      "Manager",
      "System Administrator",
      "Security Officer",
    ],
    correctAnswer: "Manager",
    explanation:
      "Managers are commonly the primary reviewers responsible for certifying the access held by their direct reports.",
    domain: "certifications",
    difficulty: "easy",
  },
  {
    prompt: "What is the purpose of Segregation of Duties (SoD)?",
    choices: [
      "Improve application performance",
      "Prevent conflicting access combinations",
      "Create workflows",
      "Automate provisioning",
    ],
    correctAnswer: "Prevent conflicting access combinations",
    explanation:
      "SoD policies are designed to prevent users from holding combinations of access that create unacceptable risk, such as fraud.",
    domain: "SoD",
    difficulty: "easy",
  },
  {
    prompt: "Which Saviynt object groups multiple entitlements together?",
    choices: ["Endpoint", "Campaign", "Role", "Dataset"],
    correctAnswer: "Role",
    explanation:
      "A role bundles multiple entitlements so they can be assigned, requested, and reviewed as a single unit.",
    domain: "role mining",
    difficulty: "easy",
  },
  {
    prompt: "What is the main purpose of an Enterprise Role?",
    choices: [
      "Database administration",
      "Group business access requirements",
      "Store account attributes",
      "Import accounts",
    ],
    correctAnswer: "Group business access requirements",
    explanation:
      "Enterprise Roles represent business-friendly groupings of access aligned to job functions or business needs.",
    domain: "role mining",
    difficulty: "medium",
  },
  {
    prompt: "Which process imports account data from connected systems?",
    choices: ["Provisioning", "Certification", "Account Import", "Role Mining"],
    correctAnswer: "Account Import",
    explanation:
      "Account Import (reconciliation) brings account data from target systems into Saviynt so it reflects the current state.",
    domain: "reconciliation",
    difficulty: "easy",
  },
  {
    prompt: "Which process sends approved access to a target application?",
    choices: ["Certification", "Provisioning", "Analytics", "Discovery"],
    correctAnswer: "Provisioning",
    explanation:
      "Provisioning takes approved access requests and applies the corresponding changes in the target application.",
    domain: "access requests",
    difficulty: "easy",
  },
  {
    prompt: "What is the purpose of a Dataset?",
    choices: [
      "Store workflow definitions",
      "Provide data for analytics and reports",
      "Store passwords",
      "Create endpoints",
    ],
    correctAnswer: "Provide data for analytics and reports",
    explanation:
      "Datasets define the data that feeds analytics controls, dashboards, and reports.",
    domain: "audit reporting",
    difficulty: "medium",
  },
  {
    prompt:
      "Which analytics type provides the most flexibility by querying database data directly?",
    choices: [
      "Static Analytics",
      "Advanced Analytics",
      "SQL Analytics",
      "Dataset Analytics",
    ],
    correctAnswer: "SQL Analytics",
    explanation:
      "SQL-based analytics queries the database directly, offering the greatest flexibility for retrieving specific data sets.",
    domain: "audit reporting",
    difficulty: "medium",
  },
  {
    prompt: "What happens after a user submits an access request?",
    choices: [
      "Certification starts immediately",
      "Approval workflow executes",
      "Import jobs start automatically",
      "Endpoint sync begins",
    ],
    correctAnswer: "Approval workflow executes",
    explanation:
      "Submitting a request triggers the configured approval workflow, which routes the request to the appropriate approvers.",
    domain: "access requests",
    difficulty: "easy",
  },
  {
    prompt: "What is the primary purpose of a Technical Role?",
    choices: [
      "Bundle low-level entitlements",
      "Define certification campaigns",
      "Create workflows",
      "Manage imports",
    ],
    correctAnswer: "Bundle low-level entitlements",
    explanation:
      "Technical Roles group fine-grained, system-level entitlements that can then be composed into business-facing Enterprise Roles.",
    domain: "role mining",
    difficulty: "medium",
  },
  {
    prompt: "Which component sends notification emails?",
    choices: ["SMTP Configuration", "Endpoint", "Dataset", "Analytics"],
    correctAnswer: "SMTP Configuration",
    explanation:
      "SMTP configuration defines the mail server settings Saviynt uses to deliver notification emails to users and approvers.",
    domain: "workflows",
    difficulty: "easy",
  },
  {
    prompt: "What is a Mover event?",
    choices: [
      "New employee onboarding",
      "User termination",
      "User changes position or department",
      "Access certification",
    ],
    correctAnswer: "User changes position or department",
    explanation:
      "A Mover event occurs when a user's role, department, or position changes, typically requiring access to be adjusted accordingly.",
    domain: "JML lifecycle",
    difficulty: "easy",
  },
  {
    prompt: "What is the purpose of a primary certifier?",
    choices: [
      "Approve imports",
      "Review and certify access",
      "Provision accounts",
      "Manage workflows",
    ],
    correctAnswer: "Review and certify access",
    explanation:
      "The primary certifier is the designated reviewer responsible for making the certification decision on the access in scope.",
    domain: "certifications",
    difficulty: "easy",
  },
  {
    prompt: "Which object represents a person's identity in Saviynt?",
    choices: ["Account", "Entitlement", "User", "Endpoint"],
    correctAnswer: "User",
    explanation:
      "The User object represents an individual's identity, holding identity attributes and linking to their accounts and access.",
    domain: "JML lifecycle",
    difficulty: "easy",
  },
  {
    prompt: "What is role-based access control (RBAC)?",
    choices: [
      "Access granted through network location",
      "Access granted through roles assigned to users",
      "Access granted manually by administrators only",
      "Access granted through certification campaigns",
    ],
    correctAnswer: "Access granted through roles assigned to users",
    explanation:
      "RBAC grants access by assigning users to roles that bundle the entitlements appropriate to their job function.",
    domain: "role mining",
    difficulty: "easy",
  },
  {
    prompt: "Which action is typically performed during a Joiner process?",
    choices: [
      "Remove accounts",
      "Revoke entitlements",
      "Provision required access",
      "Disable applications",
    ],
    correctAnswer: "Provision required access",
    explanation:
      "The Joiner process onboards a new user, which includes provisioning the access required for their role.",
    domain: "JML lifecycle",
    difficulty: "easy",
  },
  {
    prompt: "What is the purpose of a workflow?",
    choices: [
      "Define business process automation",
      "Store accounts",
      "Run imports",
      "Create datasets",
    ],
    correctAnswer: "Define business process automation",
    explanation:
      "Workflows automate and orchestrate business processes such as approvals, notifications, and task routing.",
    domain: "workflows",
    difficulty: "easy",
  },
  {
    prompt: "Which review type focuses on users and their assigned access?",
    choices: [
      "User Access Review",
      "Endpoint Review",
      "Dataset Review",
      "Analytics Review",
    ],
    correctAnswer: "User Access Review",
    explanation:
      "A User Access Review centers on individual users and the access they currently hold, so reviewers can validate it remains appropriate.",
    domain: "certifications",
    difficulty: "easy",
  },
  {
    prompt: "What is the primary goal of access certification?",
    choices: [
      "Improve performance",
      "Validate that access remains appropriate",
      "Create roles",
      "Import accounts",
    ],
    correctAnswer: "Validate that access remains appropriate",
    explanation:
      "Certification campaigns periodically confirm that existing access is still required and appropriate, flagging access to revoke otherwise.",
    domain: "certifications",
    difficulty: "easy",
  },
  {
    prompt: "Which object can contain child entitlements?",
    choices: ["Endpoint", "Entitlement", "User", "Dataset"],
    correctAnswer: "Entitlement",
    explanation:
      "Entitlements can be modeled hierarchically, with parent entitlements containing child entitlements to reflect nested permissions.",
    domain: "role mining",
    difficulty: "medium",
  },
  {
    prompt: "What is a common source for SoD violations?",
    choices: [
      "Conflicting entitlements assigned together",
      "SMTP configuration",
      "Account imports",
      "Dataset creation",
    ],
    correctAnswer: "Conflicting entitlements assigned together",
    explanation:
      "SoD violations typically arise when a user holds two or more entitlements that, in combination, create unacceptable risk.",
    domain: "SoD",
    difficulty: "easy",
  },
  {
    prompt: "Which feature helps identify risky access combinations?",
    choices: ["Campaigns", "SoD Rules", "Datasets", "Endpoints"],
    correctAnswer: "SoD Rules",
    explanation:
      "SoD Rules define which entitlement combinations are considered conflicting so they can be detected and flagged.",
    domain: "SoD",
    difficulty: "easy",
  },
  {
    prompt:
      "Which process updates user information from authoritative sources?",
    choices: ["Identity Import", "Certification", "Provisioning", "Discovery"],
    correctAnswer: "Identity Import",
    explanation:
      "Identity Import synchronizes user identity attributes from authoritative sources such as HR systems into Saviynt.",
    domain: "reconciliation",
    difficulty: "medium",
  },
  {
    prompt: "What is the purpose of Application Discovery?",
    choices: [
      "Discover unmanaged applications in the environment",
      "Discover users in Active Directory",
      "Discover workflows",
      "Discover datasets",
    ],
    correctAnswer: "Discover unmanaged applications in the environment",
    explanation:
      "Application Discovery identifies applications in the environment that are not yet onboarded or governed by Saviynt.",
    domain: "connectors",
    difficulty: "medium",
  },
  {
    prompt: "Which certification campaign reviews access assigned to users?",
    choices: [
      "User Campaign",
      "Dataset Campaign",
      "Endpoint Campaign",
      "SMTP Campaign",
    ],
    correctAnswer: "User Campaign",
    explanation:
      "A User Campaign scopes the certification around users and the access currently assigned to them.",
    domain: "certifications",
    difficulty: "medium",
  },
  {
    prompt: "Which component connects Saviynt to external applications?",
    choices: ["Endpoint", "Dataset", "Workflow", "Campaign"],
    correctAnswer: "Endpoint",
    explanation:
      "Endpoints hold the connection details and configuration that link Saviynt to external target applications.",
    domain: "connectors",
    difficulty: "easy",
  },
  {
    prompt: "Which object stores access rights within applications?",
    choices: ["Entitlement", "User", "Dataset", "Campaign"],
    correctAnswer: "Entitlement",
    explanation:
      "Entitlements represent the individual access rights and permissions available within an application.",
    domain: "role mining",
    difficulty: "easy",
  },
  {
    prompt: "What is the benefit of automated provisioning?",
    choices: [
      "Slower onboarding",
      "Reduced manual effort and errors",
      "More certifications",
      "More SoD violations",
    ],
    correctAnswer: "Reduced manual effort and errors",
    explanation:
      "Automating provisioning removes manual, error-prone steps, speeding up access delivery while improving consistency.",
    domain: "access requests",
    difficulty: "easy",
  },
  {
    prompt: "Which event usually triggers deprovisioning?",
    choices: ["Joiner", "Certification approval", "Leaver", "Dataset creation"],
    correctAnswer: "Leaver",
    explanation:
      "The Leaver event typically triggers deprovisioning so that a departing user's access is removed from target systems.",
    domain: "JML lifecycle",
    difficulty: "easy",
  },
  {
    prompt: "Which role owner is mandatory for access reviews?",
    choices: [
      "Secondary Owner",
      "Technical Owner",
      "Primary Owner/Certifier",
      "Endpoint Owner",
    ],
    correctAnswer: "Primary Owner/Certifier",
    explanation:
      "A Primary Owner/Certifier must be designated so there is always an accountable reviewer for certification decisions.",
    domain: "certifications",
    difficulty: "medium",
  },
  {
    prompt: "What is a mitigation control?",
    choices: [
      "Alternative control that reduces SoD risk",
      "Workflow engine",
      "Import process",
      "Notification system",
    ],
    correctAnswer: "Alternative control that reduces SoD risk",
    explanation:
      "A mitigation control is a compensating measure that reduces the risk of an SoD conflict when the conflicting access cannot be removed.",
    domain: "SoD",
    difficulty: "medium",
  },
  {
    prompt: "Which module is commonly used to generate reports?",
    choices: ["Analytics", "SMTP", "Endpoint", "Provisioning"],
    correctAnswer: "Analytics",
    explanation:
      "The Analytics module provides the controls, datasets, and queries used to generate reports and dashboards.",
    domain: "audit reporting",
    difficulty: "easy",
  },
  {
    prompt: "What is the purpose of an approval workflow?",
    choices: [
      "Validate requests before granting access",
      "Import accounts",
      "Discover applications",
      "Build datasets",
    ],
    correctAnswer: "Validate requests before granting access",
    explanation:
      "Approval workflows route requests to the appropriate approvers so access is validated before it is granted.",
    domain: "workflows",
    difficulty: "easy",
  },
  {
    prompt: "Which object typically owns business-level access definitions?",
    choices: ["Enterprise Role", "Endpoint", "SMTP Server", "Dataset"],
    correctAnswer: "Enterprise Role",
    explanation:
      "Enterprise Roles capture business-level access definitions aligned to job functions, separate from low-level technical permissions.",
    domain: "role mining",
    difficulty: "medium",
  },
  {
    prompt:
      "What is the relationship between Enterprise Roles and Technical Roles?",
    choices: [
      "Enterprise Roles can contain Technical Roles",
      "Technical Roles contain Enterprise Roles",
      "No relationship exists",
      "Both are identical",
    ],
    correctAnswer: "Enterprise Roles can contain Technical Roles",
    explanation:
      "Enterprise Roles can be composed of one or more Technical Roles, translating business needs into the underlying technical access.",
    domain: "role mining",
    difficulty: "medium",
  },
  {
    prompt: "What is the purpose of a requestable entitlement?",
    choices: [
      "Can be requested through the access request process",
      "Can be imported automatically",
      "Can be certified automatically",
      "Can only be assigned manually",
    ],
    correctAnswer: "Can be requested through the access request process",
    explanation:
      "Marking an entitlement requestable makes it available in the catalog so users can request it through the access request process.",
    domain: "access requests",
    difficulty: "easy",
  },
  {
    prompt: "Which component is most involved in enforcing approval chains?",
    choices: ["Workflow", "Dataset", "Endpoint", "Entitlement"],
    correctAnswer: "Workflow",
    explanation:
      "Workflows define and enforce the sequence of approval steps a request must pass through before access is granted.",
    domain: "workflows",
    difficulty: "easy",
  },
  {
    prompt: "What is the benefit of certification campaigns?",
    choices: [
      "Validate existing access periodically",
      "Improve endpoint performance",
      "Create imports",
      "Generate passwords",
    ],
    correctAnswer: "Validate existing access periodically",
    explanation:
      "Certification campaigns provide a structured, recurring process to confirm that existing access remains appropriate.",
    domain: "certifications",
    difficulty: "easy",
  },
  {
    prompt: "Which object represents a user account on a target system?",
    choices: ["User", "Endpoint", "Account", "Entitlement"],
    correctAnswer: "Account",
    explanation:
      "An Account represents the actual user identity and credentials as they exist on a specific target system.",
    domain: "reconciliation",
    difficulty: "easy",
  },
  {
    prompt: "Which import typically loads permissions from an application?",
    choices: [
      "User Import",
      "Entitlement Import",
      "Identity Import",
      "Campaign Import",
    ],
    correctAnswer: "Entitlement Import",
    explanation:
      "Entitlement Import brings the available permissions and access rights from a target application into Saviynt.",
    domain: "reconciliation",
    difficulty: "medium",
  },
  {
    prompt:
      "Which concept ensures users receive only access needed for their job?",
    choices: ["Least Privilege", "SMTP", "Dataset Design", "Discovery"],
    correctAnswer: "Least Privilege",
    explanation:
      "The principle of least privilege limits a user's access to only what is necessary to perform their job functions.",
    domain: "role mining",
    difficulty: "easy",
  },
  {
    prompt: "What is one major advantage of RBAC?",
    choices: [
      "Increased manual administration",
      "Simplified access management",
      "More SoD violations",
      "Reduced visibility",
    ],
    correctAnswer: "Simplified access management",
    explanation:
      "By assigning access through roles rather than individually, RBAC simplifies how access is granted, reviewed, and managed at scale.",
    domain: "role mining",
    difficulty: "easy",
  },
  {
    prompt:
      "Which statement best describes Saviynt's Identity Lifecycle Management?",
    choices: [
      "Management of user access from onboarding through termination",
      "Management of server hardware",
      "Management of application code deployment",
      "Management of network devices",
    ],
    correctAnswer:
      "Management of user access from onboarding through termination",
    explanation:
      "Identity Lifecycle Management governs how a user's access is established, adjusted, and removed across their entire tenure (Joiner-Mover-Leaver).",
    domain: "JML lifecycle",
    difficulty: "easy",
  },
  {
    prompt:
      "A Saviynt administrator is explaining why new features can be released without long enterprise upgrade projects. Which architecture characteristic best supports this?",
    choices: [
      "Cloud-native microservices architecture",
      "Manual transport packages only",
      "Single-server deployment model",
      "Flat database schema without services",
    ],
    correctAnswer: "Cloud-native microservices architecture",
    explanation:
      "A cloud-native microservices design allows independent scaling and frequent feature delivery without requiring every component to be upgraded as one unit.",
    domain: "connectors",
    difficulty: "medium",
  },
  {
    prompt:
      "Which Saviynt data model object represents the target system that contains accounts and entitlements?",
    choices: ["Endpoint", "User", "Security System", "Campaign"],
    correctAnswer: "Endpoint",
    explanation:
      "An endpoint models the governed target application or system where accounts and entitlements reside.",
    domain: "connectors",
    difficulty: "easy",
  },
  {
    prompt:
      "An application cannot support automated provisioning, but access must still be tracked and reviewed. Which onboarding approach fits best?",
    choices: [
      "Disconnected application with manual fulfillment",
      "Delete the application from governance scope",
      "Treat each account as a separate identity source",
      "Use only SMTP notifications without an endpoint",
    ],
    correctAnswer: "Disconnected application with manual fulfillment",
    explanation:
      "Disconnected applications can be onboarded for request, review, and governance while fulfillment tasks are completed manually.",
    domain: "connectors",
    difficulty: "medium",
  },
  {
    prompt:
      "A connected application needs Saviynt to pull account and entitlement data directly from the target. What must be configured first?",
    choices: [
      "A connector and import mapping for the application",
      "A certification campaign owner",
      "An analytics transport package",
      "A JITA policy without reconciliation",
    ],
    correctAnswer: "A connector and import mapping for the application",
    explanation:
      "Connected imports require a connector plus mapping rules so target data can be transformed into Saviynt users, accounts, and entitlements.",
    domain: "reconciliation",
    difficulty: "medium",
  },
  {
    prompt:
      "A team uploads user records from a CSV file because no source connector is available. What type of user onboarding is this?",
    choices: [
      "Manual user import",
      "Connected user import",
      "Just-in-time access",
      "Role mining",
    ],
    correctAnswer: "Manual user import",
    explanation:
      "Manual user import uses an uploaded file to create or update identities when no connected source is used.",
    domain: "JML lifecycle",
    difficulty: "easy",
  },
  {
    prompt:
      "Why is data transformation commonly used before importing users into Saviynt?",
    choices: [
      "To normalize source data into the expected identity format",
      "To bypass all lifecycle rules",
      "To remove all account relationships",
      "To convert approvals into certifications",
    ],
    correctAnswer: "To normalize source data into the expected identity format",
    explanation:
      "Transformation cleans and maps source attributes so imported identities match the expected Saviynt schema and rule logic.",
    domain: "JML lifecycle",
    difficulty: "medium",
  },
  {
    prompt:
      "A Workday integration should automatically create or update identities in Saviynt. Which pattern does this describe?",
    choices: [
      "Authoritative source user import",
      "Entitlement owner certification",
      "Manual disconnected provisioning",
      "Transport history review",
    ],
    correctAnswer: "Authoritative source user import",
    explanation:
      "Workday commonly acts as an authoritative HR source that feeds identity attributes into Saviynt for lifecycle processing.",
    domain: "JML lifecycle",
    difficulty: "medium",
  },
  {
    prompt:
      "After onboarding an application, Saviynt automatically indexes connection details, endpoint data, and security system information. What stage is this associated with?",
    choices: [
      "Post-enrollment check",
      "Campaign sign-off",
      "SoD mitigation",
      "Email template approval",
    ],
    correctAnswer: "Post-enrollment check",
    explanation:
      "Post-enrollment checks validate and index the application objects created during onboarding.",
    domain: "connectors",
    difficulty: "medium",
  },
  {
    prompt:
      "Which capability helps identify applications running in the environment that are not yet governed?",
    choices: [
      "Application Discovery",
      "User Manager Certification",
      "Manual Provisioning",
      "Primary Certifier Delegation",
    ],
    correctAnswer: "Application Discovery",
    explanation:
      "Application Discovery provides visibility into applications across the environment so they can be assessed and onboarded into governance.",
    domain: "connectors",
    difficulty: "easy",
  },
  {
    prompt:
      "An access request should be created for a shared account that needs controlled, temporary access. Which request type is most relevant?",
    choices: [
      "Shared account request",
      "Dataset query request",
      "Transport package request",
      "Campaign template request",
    ],
    correctAnswer: "Shared account request",
    explanation:
      "Shared account request flows govern access to accounts used by more than one person and can add approval and tracking.",
    domain: "access requests",
    difficulty: "medium",
  },
  {
    prompt:
      "A request must route differently when SOX-critical access is included. What should the workflow use?",
    choices: [
      "Dynamic workflow logic based on SOX-critical attributes",
      "A static approval chain for every request",
      "A disconnected import with no approvers",
      "A certification template instead of a request workflow",
    ],
    correctAnswer: "Dynamic workflow logic based on SOX-critical attributes",
    explanation:
      "Dynamic workflows can inspect request attributes, such as SOX criticality, and route approvals to the required compliance approvers.",
    domain: "workflows",
    difficulty: "hard",
  },
  {
    prompt:
      "Which configuration allows Saviynt to add an account name directly on an access request form?",
    choices: [
      "Allow adding account name from request form",
      "Enable orphan account deletion",
      "Run Trust Modelling Job",
      "Disable all request guardrails",
    ],
    correctAnswer: "Allow adding account name from request form",
    explanation:
      "The global request option for adding account names lets requesters provide account identifiers during the request flow.",
    domain: "access requests",
    difficulty: "medium",
  },
  {
    prompt:
      "A request process should prevent unsafe or inefficient analytics execution. Which feature is designed for this type of protection?",
    choices: [
      "Analytics guardrails",
      "Manual account import",
      "Primary account type execution",
      "Application owner sign-off",
    ],
    correctAnswer: "Analytics guardrails",
    explanation:
      "Analytics guardrails help control query execution behavior, such as query time and memory limits, to keep reporting stable.",
    domain: "audit reporting",
    difficulty: "medium",
  },
  {
    prompt:
      "A provisioning task appears immediately after approval and does not require the requester to wait for a scheduled job. What task style is this?",
    choices: [
      "Instant provisioning task",
      "Manual-only fulfillment task",
      "Certification remediation task",
      "Transport import task",
    ],
    correctAnswer: "Instant provisioning task",
    explanation:
      "Instant provisioning initiates task execution as soon as the required approval or trigger condition is met.",
    domain: "access requests",
    difficulty: "medium",
  },
  {
    prompt: "What is the purpose of configuring email templates in Saviynt?",
    choices: [
      "To generate event-based notifications for users and approvers",
      "To define endpoint entitlement hierarchy",
      "To run SQL analytics controls",
      "To import transport packages",
    ],
    correctAnswer:
      "To generate event-based notifications for users and approvers",
    explanation:
      "Email templates define notification content and recipients for events such as approvals, tasks, campaigns, and reminders.",
    domain: "workflows",
    difficulty: "easy",
  },
  {
    prompt:
      "Saviynt recommends access in request forms by comparing similar users and peer patterns. Which capability is being used?",
    choices: [
      "Intelligent recommendations with peer groups",
      "Manual disconnected import",
      "Static SoD rules only",
      "Transport package export",
    ],
    correctAnswer: "Intelligent recommendations with peer groups",
    explanation:
      "Peer-group recommendations analyze similar users and access patterns to suggest applications, entitlements, or roles.",
    domain: "access requests",
    difficulty: "medium",
  },
  {
    prompt:
      "Which setting helps ensure an access recommendation is based on enough similar users before it is shown?",
    choices: [
      "Minimum user threshold for a recommendation rule",
      "Campaign sign-off deadline",
      "SMTP authentication mode",
      "Endpoint display name",
    ],
    correctAnswer: "Minimum user threshold for a recommendation rule",
    explanation:
      "A minimum user threshold avoids weak recommendations by requiring enough peer data before the recommendation is generated.",
    domain: "access requests",
    difficulty: "hard",
  },
  {
    prompt: "What is the main benefit of Just-in-Time Access (JITA)?",
    choices: [
      "Granting temporary elevated access only when needed",
      "Permanently assigning every high-risk entitlement",
      "Replacing all certification campaigns",
      "Disabling all approval workflows",
    ],
    correctAnswer: "Granting temporary elevated access only when needed",
    explanation:
      "JITA reduces standing privileged access by granting access for a limited purpose and duration.",
    domain: "privileged access",
    difficulty: "medium",
  },
  {
    prompt: "Which JITA control most directly reduces standing privilege risk?",
    choices: [
      "On-demand access with time-bound approval",
      "Permanent direct assignment of privileged roles",
      "Manual deletion of request history",
      "Skipping access review for elevated users",
    ],
    correctAnswer: "On-demand access with time-bound approval",
    explanation:
      "Time-bound, on-demand access lets users elevate only when required and reduces the attack surface created by persistent privileges.",
    domain: "privileged access",
    difficulty: "hard",
  },
  {
    prompt:
      "A new hire should receive baseline access before their start date but only become active at the right time. Which lifecycle scenario is this?",
    choices: [
      "Pre-start day provisioning",
      "Orphan account certification",
      "Transport package import",
      "Analytics output save",
    ],
    correctAnswer: "Pre-start day provisioning",
    explanation:
      "Pre-start day provisioning prepares new-hire access based on effective dates so users are ready on day one without receiving access too early.",
    domain: "JML lifecycle",
    difficulty: "medium",
  },
  {
    prompt:
      "Which Saviynt rule type is commonly used to provision or deprovision access based on lifecycle events and identity attributes?",
    choices: [
      "Technical rule",
      "Email template",
      "Transport history",
      "Campaign report",
    ],
    correctAnswer: "Technical rule",
    explanation:
      "Technical rules automate account and access changes based on conditions such as user attributes, joins, moves, and leaves.",
    domain: "JML lifecycle",
    difficulty: "medium",
  },
  {
    prompt:
      "A user update rule should run only when a user's title and manager change. What should define this behavior?",
    choices: [
      "Trigger conditions on the updated attributes",
      "A static endpoint owner certification",
      "An analytics download format",
      "An application discovery schedule",
    ],
    correctAnswer: "Trigger conditions on the updated attributes",
    explanation:
      "User update rules should define the specific attribute-change conditions that trigger their actions.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt:
      "When technical rules are not granting expected birthright access, what should be reviewed first?",
    choices: [
      "Rule conditions, trigger type, and rule-user mappings",
      "Only the email template subject line",
      "Transport history for unrelated objects",
      "Campaign report download settings",
    ],
    correctAnswer: "Rule conditions, trigger type, and rule-user mappings",
    explanation:
      "Birthright failures usually require checking whether the user matched the rule, the rule triggered, and the mapped access was valid.",
    domain: "JML lifecycle",
    difficulty: "hard",
  },
  {
    prompt: "What is the purpose of an execution trail for rules?",
    choices: [
      "To capture rule and action details for troubleshooting",
      "To permanently approve every access request",
      "To replace all import mappings",
      "To create campaign templates automatically",
    ],
    correctAnswer: "To capture rule and action details for troubleshooting",
    explanation:
      "Execution trails help administrators determine which rules ran, what actions were attempted, and where failures occurred.",
    domain: "JML lifecycle",
    difficulty: "medium",
  },
  {
    prompt:
      "Which certification type is best when a manager must review access held by direct reports?",
    choices: [
      "User Manager Certification",
      "Role Mining Certification",
      "Transport Certification",
      "SMTP Certification",
    ],
    correctAnswer: "User Manager Certification",
    explanation:
      "User Manager Certification routes access review to the manager responsible for the users in scope.",
    domain: "certifications",
    difficulty: "easy",
  },
  {
    prompt:
      "Which certification type focuses on whether users should retain a specific entitlement?",
    choices: [
      "Entitlement Owner Certification",
      "Application Discovery Review",
      "Transport Package Review",
      "JITA Policy Review",
    ],
    correctAnswer: "Entitlement Owner Certification",
    explanation:
      "Entitlement Owner Certification asks the entitlement owner to validate users assigned to that entitlement.",
    domain: "certifications",
    difficulty: "medium",
  },
  {
    prompt:
      "Which stage of the campaign lifecycle includes reviewer decisions, e-signature completion, and revoke remediation?",
    choices: [
      "Review certification stage",
      "Application enrollment stage",
      "Transport export stage",
      "Identity import pre-stage",
    ],
    correctAnswer: "Review certification stage",
    explanation:
      "The review stage covers certification decisions, completion, revocations, remediation, and evidence needed for audit.",
    domain: "certifications",
    difficulty: "medium",
  },
  {
    prompt:
      "A campaign owner wants to reuse similar campaign settings across repeated reviews. Which feature is most useful?",
    choices: [
      "Campaign templates",
      "Manual provisioning only",
      "JITA shared accounts",
      "Log threading",
    ],
    correctAnswer: "Campaign templates",
    explanation:
      "Campaign templates simplify repeated review creation by preserving common campaign configuration.",
    domain: "certifications",
    difficulty: "medium",
  },
  {
    prompt:
      "Saviynt shows AI-assisted recommendations during access review, but final decisions still require reviewer input. What principle does this reflect?",
    choices: [
      "Recommendations support reviewers but do not replace accountable certification decisions",
      "AI recommendations automatically revoke all low-score access",
      "Campaigns are no longer needed when recommendations exist",
      "Trust scores are used only for transport packages",
    ],
    correctAnswer:
      "Recommendations support reviewers but do not replace accountable certification decisions",
    explanation:
      "Intelligent recommendations can guide reviewers, but certification accountability remains with the assigned reviewer or certifier.",
    domain: "certifications",
    difficulty: "hard",
  },
  {
    prompt:
      "In trust modelling, what does a higher signal weight generally indicate?",
    choices: [
      "The signal has greater influence on the trust score",
      "The signal is ignored during scoring",
      "The signal disables access requests",
      "The signal is used only for email delivery",
    ],
    correctAnswer: "The signal has greater influence on the trust score",
    explanation:
      "Signal weights determine how strongly each access-risk or access-context signal contributes to the overall trust score.",
    domain: "certifications",
    difficulty: "medium",
  },
  {
    prompt:
      "Which signal would most likely lower trust in an access review recommendation?",
    choices: [
      "The access is in a banned-access list",
      "The access was recently certified with no risk",
      "Many peers have the same access",
      "The access aligns with role composition",
    ],
    correctAnswer: "The access is in a banned-access list",
    explanation:
      "Banned-access signals indicate access that should not normally be held and therefore reduce confidence in retaining it.",
    domain: "certifications",
    difficulty: "hard",
  },
  {
    prompt: "What is the primary use of Saviynt Analytics?",
    choices: [
      "Creating reports and controls from Saviynt data",
      "Replacing endpoint connectors",
      "Creating user passwords",
      "Launching microservices manually",
    ],
    correctAnswer: "Creating reports and controls from Saviynt data",
    explanation:
      "Analytics is used to query, report, monitor, and act on identity governance data.",
    domain: "audit reporting",
    difficulty: "easy",
  },
  {
    prompt:
      "Which analytics option is best when an administrator needs maximum flexibility to query database data directly?",
    choices: [
      "SQL Query",
      "Campaign Launch",
      "Endpoint Enrollment",
      "Email Template",
    ],
    correctAnswer: "SQL Query",
    explanation:
      "SQL Query analytics allows direct querying of Saviynt data for custom reporting and controls.",
    domain: "audit reporting",
    difficulty: "medium",
  },
  {
    prompt:
      "An analytics control identifies inactive users who still have active accounts. What should the administrator typically do next?",
    choices: [
      "Review the results and initiate remediation or deprovisioning",
      "Mark all accounts as certified without review",
      "Disable the identity source import",
      "Export a transport package for every endpoint",
    ],
    correctAnswer:
      "Review the results and initiate remediation or deprovisioning",
    explanation:
      "Analytics findings should drive investigation and remediation, especially when inactive identities retain active target access.",
    domain: "audit reporting",
    difficulty: "medium",
  },
  {
    prompt:
      "An orphan account report finds accounts that do not correlate to active identities. Which action is appropriate?",
    choices: [
      "Accept, map, or delete the orphan accounts after review",
      "Automatically assign every account to the campaign owner",
      "Ignore the accounts until the next role mining job",
      "Convert each account into a security system",
    ],
    correctAnswer: "Accept, map, or delete the orphan accounts after review",
    explanation:
      "Orphan account handling typically involves validating ownership, mapping to identities where appropriate, or deleting invalid access.",
    domain: "reconciliation",
    difficulty: "medium",
  },
  {
    prompt:
      "Which feature helps administrators review prior analytics runs, including success, failures, and result history?",
    choices: [
      "Analytics run history",
      "Application enrollment modes",
      "Primary certifier setup",
      "JITA shared account request",
    ],
    correctAnswer: "Analytics run history",
    explanation:
      "Run history pages provide operational evidence about analytics execution, outcomes, and saved results.",
    domain: "audit reporting",
    difficulty: "easy",
  },
  {
    prompt:
      "Saviynt needs to move configuration objects from one environment to another. Which capability supports this?",
    choices: [
      "Transport packages",
      "User access review",
      "Peer recommendations",
      "Inactive account analytics only",
    ],
    correctAnswer: "Transport packages",
    explanation:
      "Transport packages export and import supported configuration objects between environments.",
    domain: "workflows",
    difficulty: "medium",
  },
  {
    prompt:
      "Before importing a transport package into production, what is a good practice?",
    choices: [
      "Review imported object details and choose whether to activate immediately",
      "Delete all transport history",
      "Disable every endpoint connector",
      "Run certification sign-off first",
    ],
    correctAnswer:
      "Review imported object details and choose whether to activate immediately",
    explanation:
      "Transport import should be reviewed carefully so administrators understand the objects being moved and when they become active.",
    domain: "workflows",
    difficulty: "hard",
  },
  {
    prompt:
      "An administrator needs to troubleshoot a failed job and wants to search logs by request or thread details. Which tool is most relevant?",
    choices: [
      "Saviynt Log Viewer",
      "Campaign template editor",
      "Application Discovery",
      "Role composition signal",
    ],
    correctAnswer: "Saviynt Log Viewer",
    explanation:
      "The Log Viewer helps locate and inspect logs for troubleshooting, including filtering around requests, jobs, and thread execution.",
    domain: "audit reporting",
    difficulty: "medium",
  },
  {
    prompt:
      "Why are thread names and request identifiers useful in troubleshooting?",
    choices: [
      "They help correlate related log entries across execution flow",
      "They automatically approve failed requests",
      "They replace connector configuration",
      "They create new user identities",
    ],
    correctAnswer:
      "They help correlate related log entries across execution flow",
    explanation:
      "Thread and request identifiers make it easier to follow a single operation across multiple log entries and processes.",
    domain: "audit reporting",
    difficulty: "medium",
  },
  {
    prompt:
      "Role mining identifies users with similar access patterns. What is the expected outcome?",
    choices: [
      "Suggested roles and entitlements for governance",
      "Automatic deletion of all direct entitlements",
      "Replacement of all reconciliation jobs",
      "Creation of SMTP templates",
    ],
    correctAnswer: "Suggested roles and entitlements for governance",
    explanation:
      "Role mining analyzes access patterns to recommend roles and entitlement groupings that can be reviewed and governed.",
    domain: "role mining",
    difficulty: "medium",
  },
  {
    prompt:
      "Which issue is Identity Security Posture Management (ISPM) intended to help address?",
    choices: [
      "Detecting risky identity configurations and access exposure",
      "Rendering the user interface theme",
      "Compressing transport package ZIP files",
      "Skipping identity governance controls",
    ],
    correctAnswer:
      "Detecting risky identity configurations and access exposure",
    explanation:
      "ISPM focuses on finding identity security risks, misconfigurations, and exposure so teams can prioritize remediation.",
    domain: "audit reporting",
    difficulty: "medium",
  },
  {
    prompt:
      "A contractor has passed their end date but still has active accounts. Which analytics use case directly detects this?",
    choices: [
      "Active users past their end date or inactive users with active accounts",
      "Application enrollment modes",
      "Campaign launch scope",
      "SOX workflow variable setup",
    ],
    correctAnswer:
      "Active users past their end date or inactive users with active accounts",
    explanation:
      "Analytics can flag users whose lifecycle status or end date no longer justifies active accounts, prompting remediation.",
    domain: "audit reporting",
    difficulty: "hard",
  },
];

export const examQuestions: ExamQuestion[] = examQuestionBank.map(
  ({ domain, ...question }, index) => ({
    ...question,
    id: index + 1,
    category: categoryByDomain[domain],
  }),
);

export type WorkflowStatus = "draft" | "published" | "archived";

export type WorkflowNodeKind = "trigger" | "ai" | "condition" | "action";

export type WorkflowNode = {
  id: string;
  kind: WorkflowNodeKind;
  title: string;
  description: string;
  branch?: "yes" | "no" | null;
};

export type WorkflowGraph = {
  nodes: WorkflowNode[];
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  runs: number;
  lastRunAt: string | null;
  updatedAt: string;
  graph: WorkflowGraph;
};

export type WorkflowPaletteItem = {
  id: string;
  group: "Triggers" | "Actions" | "Conditions";
  title: string;
  description: string;
  tone: string;
};

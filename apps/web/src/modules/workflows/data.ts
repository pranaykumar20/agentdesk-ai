import {
  getDemoWorkflow,
  listDemoWorkflows,
  saveDemoWorkflow,
  WORKFLOW_PALETTE,
} from "./demo-data";
import type { Workflow, WorkflowStatus } from "./types";

export async function listWorkflows(organizationId: string): Promise<Workflow[]> {
  return listDemoWorkflows(organizationId);
}

export async function getWorkflow(
  organizationId: string,
  id: string,
): Promise<Workflow | null> {
  return getDemoWorkflow(organizationId, id);
}

export async function updateWorkflowStatus(
  organizationId: string,
  id: string,
  status: WorkflowStatus,
): Promise<Workflow | null> {
  return saveDemoWorkflow(organizationId, id, { status });
}

export function getWorkflowPalette() {
  return WORKFLOW_PALETTE;
}

export async function getWorkflowMetrics(organizationId: string) {
  const workflows = await listWorkflows(organizationId);
  return {
    total: workflows.length,
    published: workflows.filter((w) => w.status === "published").length,
    draft: workflows.filter((w) => w.status === "draft").length,
    runs: workflows.reduce((sum, w) => sum + w.runs, 0),
  };
}

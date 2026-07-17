import type { WorkflowNode, WorkflowNodeKind } from "@/modules/workflows/types";
import { cn } from "@/lib/utils";

const kindTone: Record<WorkflowNodeKind, string> = {
  trigger: "border-violet-200 bg-violet-50 text-violet-700",
  ai: "border-emerald-200 bg-emerald-50 text-emerald-700",
  condition: "border-amber-200 bg-amber-50 text-amber-700",
  action: "border-sky-200 bg-sky-50 text-sky-700",
};

export function WorkflowCanvas({
  nodes,
  selectedId,
}: {
  nodes: WorkflowNode[];
  selectedId?: string;
}) {
  const trunk = nodes.filter((n) => !n.branch);
  const yes = nodes.filter((n) => n.branch === "yes");
  const no = nodes.filter((n) => n.branch === "no");
  const beforeBranch = trunk.slice(0, 3);
  const afterBranch = trunk.slice(3);

  return (
    <div className="relative min-h-[560px] rounded-xl border border-border bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] p-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
        {beforeBranch.map((node, idx) => (
          <NodeBlock key={node.id} node={node} selected={node.id === selectedId} showConnector={idx < beforeBranch.length - 1 || yes.length > 0} />
        ))}

        {(yes.length > 0 || no.length > 0) && (
          <div className="grid w-full gap-4 md:grid-cols-2">
            <BranchColumn label="Yes" nodes={yes} selectedId={selectedId} />
            <BranchColumn label="No" nodes={no} selectedId={selectedId} />
          </div>
        )}

        {afterBranch.map((node, idx) => (
          <NodeBlock
            key={node.id}
            node={node}
            selected={node.id === selectedId}
            showConnector={idx < afterBranch.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function BranchColumn({
  label,
  nodes,
  selectedId,
}: {
  label: string;
  nodes: WorkflowNode[];
  selectedId?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/70 p-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {nodes.map((node, idx) => (
        <NodeBlock
          key={node.id}
          node={node}
          selected={node.id === selectedId}
          showConnector={idx < nodes.length - 1}
        />
      ))}
    </div>
  );
}

function NodeBlock({
  node,
  selected,
  showConnector,
}: {
  node: WorkflowNode;
  selected?: boolean;
  showConnector?: boolean;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      <div
        className={cn(
          "w-full rounded-xl border bg-card px-4 py-3 shadow-sm",
          selected ? "ring-2 ring-primary" : "border-border",
        )}
      >
        <span
          className={cn(
            "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase",
            kindTone[node.kind],
          )}
        >
          {node.kind}
        </span>
        <p className="mt-2 text-sm font-semibold text-foreground">{node.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{node.description}</p>
      </div>
      {showConnector ? <div className="my-1 h-4 w-px bg-border" /> : null}
    </div>
  );
}

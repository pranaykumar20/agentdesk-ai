import type { VoiceFlowNode, VoiceNodeKind } from "@/modules/voice-flows/types";
import { cn } from "@/lib/utils";

const kindTone: Record<VoiceNodeKind, string> = {
  start: "border-violet-200 bg-violet-50 text-violet-700",
  speak: "border-emerald-200 bg-emerald-50 text-emerald-700",
  listen: "border-sky-200 bg-sky-50 text-sky-700",
  logic: "border-amber-200 bg-amber-50 text-amber-700",
  flow: "border-rose-200 bg-rose-50 text-rose-700",
  action: "border-orange-200 bg-orange-50 text-orange-700",
};

export function VoiceFlowCanvas({
  nodes,
  selectedId,
}: {
  nodes: VoiceFlowNode[];
  selectedId?: string;
}) {
  const trunk = nodes.filter((n) => !n.branchLabel);
  const branches = nodes.filter((n) => n.branchLabel);
  const before = trunk.slice(0, 4);
  const after = trunk.slice(4);

  return (
    <div className="relative min-h-[560px] rounded-xl border border-border bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] p-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
        {before.map((node, idx) => (
          <VoiceNodeBlock
            key={node.id}
            node={node}
            selected={node.id === selectedId}
            showConnector={idx < before.length - 1 || branches.length > 0}
          />
        ))}

        {branches.length > 0 ? (
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((node) => (
              <div key={node.id} className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {node.branchLabel}
                </span>
                <VoiceNodeBlock node={node} selected={node.id === selectedId} />
              </div>
            ))}
          </div>
        ) : null}

        {after.map((node, idx) => (
          <VoiceNodeBlock
            key={node.id}
            node={node}
            selected={node.id === selectedId}
            showConnector={idx < after.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function VoiceNodeBlock({
  node,
  selected,
  showConnector,
}: {
  node: VoiceFlowNode;
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

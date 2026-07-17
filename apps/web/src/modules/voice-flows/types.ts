export type VoiceFlowStatus = "draft" | "published" | "archived";

export type VoiceNodeKind = "start" | "speak" | "listen" | "logic" | "flow" | "action";

export type VoiceFlowNode = {
  id: string;
  kind: VoiceNodeKind;
  title: string;
  description: string;
  branchLabel?: string;
};

export type VoiceFlow = {
  id: string;
  name: string;
  description: string;
  status: VoiceFlowStatus;
  agentName: string;
  updatedAt: string;
  nodes: VoiceFlowNode[];
};

export type VoicePaletteItem = {
  id: string;
  group: "Speak" | "Listen" | "Logic" | "Flow";
  title: string;
  description: string;
  tone: string;
};

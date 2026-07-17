export type SmsCampaignStatus = "draft" | "scheduled" | "sending" | "completed" | "failed";

export type SmsCampaignType =
  | "appointment"
  | "promotional"
  | "reengagement"
  | "transactional"
  | "informational";

export type SmsCampaign = {
  id: string;
  name: string;
  description: string;
  campaignType: SmsCampaignType;
  status: SmsCampaignStatus;
  audienceCount: number;
  sentCount: number;
  deliveryRate: number;
  responseRate: number;
  sentAt: string | null;
};

export type SmsCampaignMetrics = {
  totalCampaigns: number;
  messagesSent: number;
  deliveryRate: number;
  responseRate: number;
  optOuts: number;
};

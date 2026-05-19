export type BillingRiskLevel = "healthy" | "watch" | "attention";

export type BillingSummaryDraft = {
  title: string;
  riskLevel: BillingRiskLevel;
  narrative: string;
  nextActions: string[];
};

export type BillingRiskLevel = "healthy" | "watch" | "attention";

export type BillingSummaryDraft = {
  title: string;
  riskLevel: BillingRiskLevel;
  narrative: string;
  nextActions: string[];
};

export type PaymentFailureDraft = {
  subject: string;
  body: string;
  nextActions: string[];
};

export type AdminActivityInsight = {
  title: string;
  riskLevel: BillingRiskLevel;
  narrative: string;
  nextActions: string[];
};

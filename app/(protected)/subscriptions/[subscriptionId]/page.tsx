import { SubscriptionDetailClient } from "@/components/subscriptions/subscription-detail-client";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ subscriptionId: string }>;
}) {
  const { subscriptionId } = await params;

  return <SubscriptionDetailClient subscriptionId={Number(subscriptionId)} />;
}

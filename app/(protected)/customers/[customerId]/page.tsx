import { CustomerDetailClient } from "@/components/customers/customer-detail-client";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  return <CustomerDetailClient customerId={Number(customerId)} />;
}

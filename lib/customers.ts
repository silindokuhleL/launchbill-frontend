import { api } from "@/lib/api";
import type { ApiCollection, ApiResource } from "@/types/api";
import type { Customer, CustomerFormValues, CustomerPayload } from "@/types/customers";

export async function listCustomers() {
  const response = await api.get<ApiCollection<Customer>>("/customers");

  return response.data.data;
}

export async function createCustomer(payload: CustomerPayload) {
  const response = await api.post<ApiResource<Customer>>("/customers", payload);

  return response.data.data;
}

export async function updateCustomer(
  customerId: number,
  payload: Partial<CustomerPayload>,
) {
  const response = await api.patch<ApiResource<Customer>>(
    `/customers/${customerId}`,
    payload,
  );

  return response.data.data;
}

export async function archiveCustomer(customerId: number) {
  await api.delete(`/customers/${customerId}`);
}

export function customerToFormValues(customer?: Customer): CustomerFormValues {
  return {
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    company_name: customer?.company_name ?? "",
    phone: customer?.phone ?? "",
    provider_customer_id: customer?.provider_customer_id ?? "",
    status: customer?.status ?? "active",
    line1: customer?.billing_address.line1 ?? "",
    city: customer?.billing_address.city ?? "",
    region: customer?.billing_address.region ?? "",
    postal_code: customer?.billing_address.postal_code ?? "",
    country: customer?.billing_address.country ?? "ZA",
    notes: customer?.notes ?? "",
  };
}

export function formValuesToCustomerPayload(
  values: CustomerFormValues,
): CustomerPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    company_name: values.company_name.trim() || undefined,
    phone: values.phone.trim() || undefined,
    provider_customer_id: values.provider_customer_id.trim() || undefined,
    status: values.status,
    billing_address: {
      line1: values.line1.trim() || undefined,
      city: values.city.trim() || undefined,
      region: values.region.trim() || undefined,
      postal_code: values.postal_code.trim() || undefined,
      country: values.country.trim().toUpperCase() || undefined,
    },
    notes: values.notes.trim() || undefined,
  };
}

export function formatCustomerAddress(customer: Pick<Customer, "billing_address">) {
  return [
    customer.billing_address.line1,
    customer.billing_address.city,
    customer.billing_address.region,
    customer.billing_address.postal_code,
    customer.billing_address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

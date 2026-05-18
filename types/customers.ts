export type CustomerStatus = "active" | "inactive";

export type BillingAddress = {
  line1?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
};

export type Customer = {
  id: number;
  account_id: number;
  name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  provider_customer_id: string | null;
  status: CustomerStatus;
  billing_address: BillingAddress;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CustomerPayload = {
  name: string;
  email: string;
  company_name?: string;
  phone?: string;
  provider_customer_id?: string;
  status?: CustomerStatus;
  billing_address?: BillingAddress;
  notes?: string;
};

export type CustomerFormValues = {
  name: string;
  email: string;
  company_name: string;
  phone: string;
  provider_customer_id: string;
  status: CustomerStatus;
  line1: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  notes: string;
};

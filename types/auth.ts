export type { ApiResource } from "@/types/api";

export type AccountSummary = {
  id: number;
  name: string;
  billing_email: string | null;
  status: string;
  is_owner: boolean;
  roles: string[];
  permissions: string[];
  theme: {
    primary_color: string | null;
  };
};

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  accounts: AccountSummary[];
  global_roles: string[];
  global_permissions: string[];
};

export type AuthSession = {
  token: string;
  token_type: "Bearer";
  user: AuthenticatedUser;
};

export type DemoUser = {
  label: string;
  email: string;
  role: string;
};

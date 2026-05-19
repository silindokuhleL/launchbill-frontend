import type { LucideIcon } from "lucide-react";

export type PermissionGroup = {
  name: string;
  permissions: string[];
};

export type RoleDefinition = {
  name: string;
  label: string;
  description: string;
  permissions: string[];
  icon: LucideIcon;
};

"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { findNavigationItem } from "@/lib/navigation";

type ModulePageProps = {
  actionLabel?: string;
};

export function ModulePage({ actionLabel = "Coming after the API" }: ModulePageProps) {
  const pathname = usePathname();
  const item = findNavigationItem(pathname);
  const Icon = item.icon;

  return (
    <>
      <PageHeader
        eyebrow="Module placeholder"
        title={item.label}
        description={item.description}
      />
      <EmptyState
        description="This page is intentionally empty while we finish the backend services, policies, resources, and tests. The shell is ready, so each module can plug in without reworking navigation."
        icon={Icon}
        title={`${item.label} workspace`}
      >
        <Button disabled variant="secondary">
          {actionLabel}
        </Button>
      </EmptyState>
    </>
  );
}

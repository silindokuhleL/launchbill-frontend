import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DataTable,
  dataTableColumnCount,
  dataTableWrapperClass,
  type DataTableColumn,
} from "@/components/ui/data-table";

type DemoInvoice = {
  customer: string;
  id: number;
  number: string;
  status: string;
};

const columns: Array<DataTableColumn<DemoInvoice>> = [
  {
    cell: (invoice) => invoice.number,
    header: "Invoice",
    key: "invoice",
  },
  {
    cell: (invoice) => invoice.customer,
    header: "Customer",
    key: "customer",
  },
  {
    cell: (invoice) => invoice.status,
    header: "Status",
    key: "status",
  },
];

const invoices: DemoInvoice[] = [
  {
    customer: "Acme Trading",
    id: 1,
    number: "INV-2026-0001",
    status: "Paid",
  },
  {
    customer: "Northstar Labs",
    id: 2,
    number: "INV-2026-0002",
    status: "Open",
  },
];

describe("DataTable", () => {
  it("renders headers, desktop rows, and mobile cards", () => {
    render(
      <DataTable
        columns={columns}
        data={invoices}
        getRowKey={(invoice) => invoice.id}
        mobileCard={(invoice) => (
          <article aria-label={`Mobile ${invoice.number}`}>{invoice.customer}</article>
        )}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Invoice" })).not.toBeNull();
    expect(screen.getByRole("columnheader", { name: "Customer" })).not.toBeNull();
    expect(screen.getByText("INV-2026-0001")).not.toBeNull();
    expect(screen.getByLabelText("Mobile INV-2026-0002")).not.toBeNull();
  });

  it("renders an empty state instead of an empty table", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyState={<p>No invoices yet.</p>}
        getRowKey={(invoice) => invoice.id}
      />,
    );

    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText("No invoices yet.")).not.toBeNull();
  });

  it("keeps helper output stable for responsive table layout", () => {
    expect(dataTableColumnCount(columns)).toBe(3);
    expect(dataTableWrapperClass(true)).toContain("md:block");
    expect(dataTableWrapperClass(false)).toContain("overflow-x-auto");
  });
});

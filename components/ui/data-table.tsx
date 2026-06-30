import type { ReactNode } from "react";

export type DataTableColumn<TItem> = {
  cell: (item: TItem) => ReactNode;
  className?: string;
  header: ReactNode;
  key: string;
};

type DataTableProps<TItem> = {
  columns: Array<DataTableColumn<TItem>>;
  data: TItem[];
  emptyState?: ReactNode;
  getRowKey: (item: TItem) => string | number;
  mobileCard?: (item: TItem) => ReactNode;
};

export function dataTableColumnCount<TItem>(
  columns: Array<DataTableColumn<TItem>>,
) {
  return columns.length;
}

export function dataTableWrapperClass(hasMobileCards: boolean) {
  return hasMobileCards
    ? "hidden overflow-hidden rounded-md border border-[#d8e7dd] md:block"
    : "overflow-x-auto rounded-md border border-[#d8e7dd]";
}

export function DataTable<TItem>({
  columns,
  data,
  emptyState,
  getRowKey,
  mobileCard,
}: DataTableProps<TItem>) {
  if (data.length === 0) {
    return emptyState ? (
      <div className="rounded-md border border-[#d8e7dd] bg-[#fbfdfc] p-4">
        {emptyState}
      </div>
    ) : null;
  }

  return (
    <>
      <div className={dataTableWrapperClass(Boolean(mobileCard))}>
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead className="bg-[#f4fbf6] text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3" key={column.key}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d8e7dd]">
            {data.map((item) => (
              <tr className="bg-white align-top" key={getRowKey(item)}>
                {columns.map((column) => (
                  <td
                    className={`break-words px-4 py-4 ${column.className ?? ""}`}
                    key={column.key}
                  >
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mobileCard ? (
        <div className="grid gap-3 md:hidden">
          {data.map((item) => (
            <div key={getRowKey(item)}>{mobileCard(item)}</div>
          ))}
        </div>
      ) : null}
    </>
  );
}

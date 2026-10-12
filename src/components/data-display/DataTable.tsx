import type { ColumnDef, OnChangeFn, RowSelectionState, SortingState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { Checkbox } from '@/components/forms/Checkbox';
import { Pagination } from '@/components/navigation/Pagination';
import { cn } from '@/utils/cn';
import { EmptyState } from '../feedback/EmptyState';
import { ErrorState } from '../feedback/ErrorState';
import { SkeletonTable } from '../feedback/Skeleton';

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  pagination?: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void };
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  bulkActions?: ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading,
  error,
  onRetry,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your filters or search.',
  emptyAction,
  sorting,
  onSortingChange,
  manualSorting,
  rowSelection,
  onRowSelectionChange,
  pagination,
  onRowClick,
  toolbar,
  bulkActions,
}: DataTableProps<T>) {
  const selectable = Boolean(rowSelection && onRowSelectionChange);

  const tableColumns: ColumnDef<T, unknown>[] = selectable
    ? [
        {
          id: '__select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
              aria-label="Select all rows"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select row"
            />
          ),
          size: 36,
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, rowSelection },
    getRowId,
    onSortingChange,
    onRowSelectionChange,
    manualSorting,
    enableRowSelection: selectable,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedCount = rowSelection ? Object.keys(rowSelection).filter((id) => rowSelection[id]).length : 0;

  return (
    <div className="flex flex-col">
      {(toolbar || (selectable && selectedCount > 0)) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 bg-surface-subtle/50">
          <div className="flex-1">{toolbar}</div>
          {selectable && selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-caption font-medium text-text-secondary">
                {selectedCount} selected
              </span>
              {bulkActions}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="p-5">
          <SkeletonTable />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-surface-subtle/60">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-caption font-semibold uppercase tracking-wide text-text-tertiary"
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 hover:text-text-primary transition-colors"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sortDirection === 'asc' ? (
                              <ArrowUp className="size-3" />
                            ) : sortDirection === 'desc' ? (
                              <ArrowDown className="size-3" />
                            ) : (
                              <ArrowUpDown className="size-3 opacity-30" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors duration-100',
                    onRowClick && 'cursor-pointer hover:bg-surface-subtle',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-body-2 text-text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && !isLoading && !error && data.length > 0 && <Pagination {...pagination} />}
    </div>
  );
}

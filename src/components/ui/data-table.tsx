import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type DataTableSortDirection = 'asc' | 'desc'

export type DataTableEmptyState = {
  title: string
  description?: string
  illustration?: ReactNode
  action?: ReactNode
}

export type DataTableColumn<T> = {
  id: string
  header: ReactNode
  cell: (item: T) => ReactNode
  sortable?: boolean
  sortValue?: (item: T) => string | number
  headerClassName?: string
  cellClassName?: string
}

export type DataTableProps<T> = {
  data: T[]
  columns: DataTableColumn<T>[]
  getRowKey: (item: T) => string
  pageSize?: number
  height?: number | string
  title?: ReactNode
  toolbar?: ReactNode
  emptyState?: DataTableEmptyState
  className?: string
  defaultSort?: {
    columnId: string
    direction: DataTableSortDirection
  }
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  pageSize = 10,
  height = 460,
  title,
  toolbar,
  emptyState,
  className,
  defaultSort,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(defaultSort?.columnId ?? '')
  const [sortDir, setSortDir] = useState<DataTableSortDirection>(defaultSort?.direction ?? 'desc')

  const sortedData = useMemo(() => {
    if (!sortKey) return [...data]

    const column = columns.find((col) => col.id === sortKey)
    if (!column?.sortValue) return [...data]

    const rows = [...data]
    rows.sort((a, b) => {
      const aValue = column.sortValue!(a)
      const bValue = column.sortValue!(b)

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue
      }

      const cmp = String(aValue).localeCompare(String(bValue))
      return sortDir === 'asc' ? cmp : -cmp
    })

    return rows
  }, [columns, data, sortDir, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const showEmptyState = pageRows.length === 0 && Boolean(emptyState)

  const toggleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column?.sortable) return

    if (sortKey === columnId) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(columnId)
      setSortDir('desc')
    }
    setPage(1)
  }

  const sortIndicator = (columnId: string) => {
    if (sortKey !== columnId) return null
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  const resolvedHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div className={cn('space-y-4', className)}>
      {title || toolbar ? (
        <div
          className={cn(
            'flex flex-col gap-3 lg:flex-row lg:items-end',
            title ? 'lg:justify-between' : 'lg:justify-end'
          )}
        >
          {title ? <div>{title}</div> : null}
          {toolbar ? <div className="w-full lg:w-auto">{toolbar}</div> : null}
        </div>
      ) : null}

      <div
        className={cn(
          'relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white',
          showEmptyState ? 'h-auto' : undefined
        )}
        style={showEmptyState ? undefined : { height: resolvedHeight }}
      >
        <div
          className={cn(
            showEmptyState ? 'overflow-hidden' : 'min-h-0 flex-1 overflow-y-auto pb-14'
          )}
        >
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="border-b border-zinc-200 bg-zinc-50/95">
              <TableRow className="border-b border-zinc-200 hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead key={column.id} className={column.headerClassName}>
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        className="hover:text-zinc-800"
                      >
                        {column.header}
                        {sortIndicator(column.id)}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length > 0 ? (
                pageRows.map((item) => (
                  <TableRow key={getRowKey(item)} className="border-b border-zinc-200">
                    {columns.map((column) => (
                      <TableCell key={column.id} className={column.cellClassName}>
                        {column.cell(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : showEmptyState ? (
                <TableRow className="hover:bg-transparent border-b-0">
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState
                      title={emptyState!.title}
                      description={emptyState!.description}
                      illustration={emptyState!.illustration}
                      action={emptyState!.action}
                      compact
                      embedded
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="py-16 text-center text-sm text-zinc-500"
                  >
                    No results match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3',
            showEmptyState
              ? 'relative'
              : 'absolute inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur-sm'
          )}
        >
          <p className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

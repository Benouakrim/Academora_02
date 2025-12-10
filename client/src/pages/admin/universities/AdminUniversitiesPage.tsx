import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDeleteUniversity, useUniversities } from '@/hooks/useAdminUniversities'
import type { University } from '@/hooks/useAdminUniversities'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AdminUniversitiesPage() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data, isLoading } = useUniversities(page, pageSize)
  const del = useDeleteUniversity()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const universities = data?.data ?? []
  const total = data?.meta?.total ?? universities.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const columns: ColumnDef<University>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link to={`/admin/universities/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue('name') as string}
        </Link>
      ),
    },
    { accessorKey: 'country', header: 'Country' },
    { accessorKey: 'city', header: 'City' },
    {
      accessorKey: 'tuitionOutState',
      header: 'Tuition',
      cell: ({ row }) => {
        const amount = Number(row.getValue('tuitionOutState')) || 0
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const uni = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Link to={`/admin/universities/${uni.id}`}>
                <DropdownMenuItem>Edit Details</DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeletingId(uni.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Universities</h2>
        <Link to="/admin/universities/new" className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
          Add New
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={universities} />
      )}

      <div className="flex items-center justify-between">
        <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <div className="text-sm text-slate-600">Page {page} of {totalPages}</div>
        <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete university?</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={async () => {
              if (!deletingId) return
              await del.mutateAsync(deletingId)
              setDeletingId(null)
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

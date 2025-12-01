import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDeleteUniversity, useUniversities } from '@/hooks/useAdminUniversities'
import type { University } from '@/hooks/useAdminUniversities'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminUniversitiesPage() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data, isLoading } = useUniversities(page, pageSize)
  const del = useDeleteUniversity()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const universities = data?.data ?? []
  const total = data?.meta?.total ?? universities.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Universities</h2>
        <Link to="/admin/universities/new" className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
          Add New
        </Link>
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Tuition (Out)</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-32" /></td>
                </tr>
              ))
            ) : (
              universities.map((u: University) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/admin/universities/${u.id}`} className="hover:underline">{u.name}</Link>
                  </td>
                  <td className="px-4 py-3">{u.country}</td>
                  <td className="px-4 py-3">{u.city ?? '-'}</td>
                  <td className="px-4 py-3">{u.tuitionOutState ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/universities/${u.id}`} className="rounded-md px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800">Edit</Link>
                      <Button variant="destructive" onClick={() => setDeletingId(u.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deletingId) return
                await del.mutateAsync(deletingId)
                setDeletingId(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

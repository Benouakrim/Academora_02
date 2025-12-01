import { Link } from 'react-router-dom'
import { useAdminStats } from '@/hooks/useAdminStats'
import { Users, School, Bookmark } from 'lucide-react'

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminStats()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-slate-600">Quick snapshot of system metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500"><Users className="h-4 w-4" /> Total Users</div>
          <div className="mt-2 text-2xl font-semibold">{isLoading ? '—' : data?.counts.users ?? '—'}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500"><School className="h-4 w-4" /> Total Universities</div>
          <div className="mt-2 text-2xl font-semibold">{isLoading ? '—' : data?.counts.universities ?? '—'}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500"><Bookmark className="h-4 w-4" /> Total Saved Items</div>
          <div className="mt-2 text-2xl font-semibold">{isLoading ? '—' : data?.counts.saved ?? '—'}</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h3 className="text-lg font-semibold">Recent Users</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentUsers ?? []).map((u) => {
                const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—'
                const joined = new Date(u.createdAt).toLocaleDateString()
                return (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3">{name}</td>
                    <td className="px-4 py-3">{u.email ?? '—'}</td>
                    <td className="px-4 py-3">{joined}</td>
                  </tr>
                )
              })}
              {isLoading && (
                <tr>
                  <td className="px-4 py-3">Loading...</td>
                  <td />
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="mt-3">
          <Link
            to="/admin/universities/new"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            Add University
          </Link>
        </div>
      </div>
    </div>
  )
}

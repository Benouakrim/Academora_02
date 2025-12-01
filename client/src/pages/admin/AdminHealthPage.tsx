export default function AdminHealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">System Health</h2>
        <p className="text-slate-600">Operational overview and status checks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-lg font-semibold">API</h3>
          <p className="mt-2 text-green-700 bg-green-100 inline-block rounded px-2 py-1 text-sm">Operational</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-lg font-semibold">Database</h3>
          <p className="mt-2 text-green-700 bg-green-100 inline-block rounded px-2 py-1 text-sm">Operational</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-lg font-semibold">Auth (Clerk)</h3>
          <p className="mt-2 text-green-700 bg-green-100 inline-block rounded px-2 py-1 text-sm">Operational</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-lg font-semibold">Background Jobs</h3>
          <p className="mt-2 text-slate-700 bg-slate-100 inline-block rounded px-2 py-1 text-sm">No jobs configured</p>
        </div>
      </div>
    </div>
  )
}

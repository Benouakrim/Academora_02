import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAdmin from '@/hooks/useAdmin'

export default function AdminLayout() {
  const { isLoading } = useAdmin()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        <div className="animate-pulse">Loading Admin...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-4 py-5 text-lg font-semibold">Admin Portal</div>
        <nav className="flex-1 px-2 space-y-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800' : 'hover:bg-slate-800/60'}`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/admin/universities"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800' : 'hover:bg-slate-800/60'}`
            }
          >
            Universities
          </NavLink>
          <NavLink
            to="/admin/health"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${isActive ? 'bg-slate-800' : 'hover:bg-slate-800/60'}`
            }
          >
            System Health
          </NavLink>
        </nav>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="m-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700"
        >
          Exit Admin
        </button>
      </aside>

      <div className="ml-64">
        <header className="border-b bg-white">
          <div className="px-6 py-4">
            <h1 className="text-xl font-semibold">Admin</h1>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

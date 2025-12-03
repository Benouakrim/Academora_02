import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'

const nav = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/saved', label: 'Saved List' },
  { to: '/dashboard/profile', label: 'Profile' },
  { to: '/dashboard/referrals', label: 'Referrals' },
  { to: '/dashboard/claims', label: 'My Claims' },
]

export default function DashboardLayout() {
  return (
    <div className="min-h-screen grid grid-cols-12">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r bg-muted/20">
        <div className="sticky top-14 p-4">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  clsx(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <section className="col-span-12 md:col-span-9 lg:col-span-10 p-4 md:p-6 lg:p-8">
        <Outlet />
      </section>
    </div>
  )
}

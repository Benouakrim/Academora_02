import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, School, FileText, MessageSquare, Activity, Shield, LogOut, ShieldCheck, Layers, Users } from 'lucide-react'
import useAdmin from '@/hooks/useAdmin'
import { Button } from '@/components/ui/button'

export default function AdminLayout() {
  const { isLoading } = useAdmin()
  const navigate = useNavigate()

  if (isLoading) return <div className="min-h-screen grid place-items-center">Loading...</div>

  const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/universities', label: 'Universities', icon: School },
    { to: '/admin/articles', label: 'Articles', icon: FileText },
    { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
    { to: '/admin/claims', label: 'Claims', icon: ShieldCheck },
    { to: '/admin/groups', label: 'Groups', icon: Users },
    { to: '/admin/micro-content', label: 'Micro-Content', icon: Layers },
    { to: '/admin/health', label: 'System Health', icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-border fixed inset-y-0 left-0 z-50 flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Shield className="w-6 h-6" /> Admin
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => navigate('/')}
          >
            <LogOut className="w-4 h-4 mr-2" /> Exit Admin
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

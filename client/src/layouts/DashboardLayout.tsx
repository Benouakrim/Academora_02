import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { useState, useMemo } from 'react'
import { Menu, X, BarChart3, Bookmark, User, Award, Users, FileText, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useIsAdmin } from '@/hooks/useIsAdmin'

// Base navigation items available to all users
const baseNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/saved', label: 'Saved List', icon: Bookmark },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/badges', label: 'Badges', icon: Award },
  { to: '/dashboard/referrals', label: 'Referrals', icon: Users },
]

// Admin-only navigation items (hidden from regular users for launch)
const adminOnlyNav = [
  { to: '/dashboard/claims', label: 'My Claims', icon: FileText },
  { to: '/dashboard/my-articles', label: 'My Articles', icon: FileText },
  { to: '/dashboard/my-articles/analytics', label: 'My Analytics', icon: BarChart3 },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isAdmin } = useIsAdmin()

  // Combine nav items based on user role
  const nav = useMemo(() => {
    return isAdmin ? [...baseNav, ...adminOnlyNav] : baseNav
  }, [isAdmin])

  const toggleSidebar = () => setSidebarOpen((open) => !open)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="min-h-screen">
          {/* Fixed Sidebar Toggle Button (always visible, well positioned) */}
          <button
            type="button"
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            onClick={toggleSidebar}
            className="fixed z-50 bg-background border border-border rounded-full shadow-lg p-2 flex items-center justify-center transition-all duration-200 hover:bg-primary/10"
            style={{
              top: 'calc(64px + 1rem)', // 64px navbar + 1rem spacing
              left: sidebarOpen ? '260px' : '20px', // flush with sidebar or edge
              width: '40px',
              height: '40px',
            }}
          >
            {sidebarOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
          </button>

          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside
              className={clsx(
                'transition-all duration-300 ease-in-out md:sticky md:top-14 left-0 top-0 h-screen md:h-auto border-r border-border z-40',
                sidebarOpen ? 'w-64' : 'w-0',
                'bg-gradient-to-b from-background via-background/95 to-background/90 dark:from-neutral-950 dark:via-neutral-950/95 dark:to-neutral-950/90',
                sidebarOpen ? 'block' : 'hidden md:block'
              )}
            >
              {sidebarOpen && (
                <div className="sticky top-0 md:top-14 p-4 md:p-5 bg-background/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-border/50 md:border-b-0 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-bold text-xs uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2 px-3">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      Dashboard
                    </h2>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {nav.map((item) => {
                      const Icon = item.icon
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/dashboard'}
                          // Only toggle sidebar with the button, not on menu click
                          className={({ isActive }) =>
                            clsx(
                              'px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                              'flex items-center relative group gap-3',
                              isActive
                                ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold shadow-sm border border-primary/20 dark:from-primary/20 dark:to-primary/10'
                                : 'text-foreground/70 hover:text-foreground hover:bg-accent/60 dark:hover:bg-neutral-800/50'
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <span className="flex-1">{item.label}</span>
                              {/* Active indicator dot */}
                              <span className={clsx(
                                'absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-200',
                                isActive ? 'bg-primary scale-100' : 'scale-0',
                                'right-2'
                              )} />
                            </>
                          )}
                        </NavLink>
                      )
                    })}
                  </nav>
                  {/* Help Section */}
                  <div className="p-4 mt-6 border-t border-border/50">
                    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-3">
                      <h3 className="text-xs font-bold text-foreground mb-2">Need Help?</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Contact our support team for any questions.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs border-primary/30 hover:bg-primary/10 dark:border-primary/30"
                      >
                        Get Support
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:block p-4 mt-8 border-t border-border/50">
                    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-3">
                      <h3 className="text-xs font-bold text-foreground mb-2">💡 Tip</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Keep your profile updated to get personalized university recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </aside>

            {/* Main Content */}
            <section className={clsx(
              'flex-1 p-4 md:p-6 lg:p-8 bg-background/50 transition-all duration-300',
              sidebarOpen ? 'md:ml-0' : 'md:ml-0'
            )}>
              <Outlet />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

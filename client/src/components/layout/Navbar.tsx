import { Link } from 'react-router-dom'
import { UserButton, useAuth, useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { Menu, Sparkles, Settings, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import AdminMenu from './AdminMenu'
import UserMenu from './UserMenu'

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { profile, fetchProfile } = useUserStore()
  
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (isSignedIn && !profile) {
      fetchProfile().catch(() => {})
    }
  }, [isSignedIn, profile, fetchProfile])

  // Check admin status from Clerk metadata OR DB profile
  const isAdmin = 
    user?.publicMetadata?.role === 'admin' || 
    profile?.role === 'ADMIN';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 w-full border-b border-white/20 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm"
      >
        {/* Gradient Border Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo & Menu Triggers */}
          <div className="flex items-center gap-4">
            {isSignedIn && !isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => setShowUserMenu(true)} className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => setShowAdminMenu(true)} className="text-primary">
                <Settings className="h-5 w-5" />
              </Button>
            )}

            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-40 group-hover:opacity-75 transition-opacity" />
                <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center text-white font-bold shadow-lg">
                  A
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 dark:from-white dark:to-gray-300">
                AcademOra
              </span>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { to: '/search', label: 'Universities' },
              { to: '/compare', label: 'Compare' },
              { to: '/blog', label: 'Insights' },
            ].map((link) => (
              <Link 
                key={link.to} 
                to={link.to}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right: Auth Actions */}
          <div className="flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <Link to="/sign-in">
                  <Button variant="ghost" className="font-medium">Sign In</Button>
                </Link>
                <Link to="/sign-up">
                  <Button className="bg-gradient-brand shadow-lg shadow-primary/20 border-0">
                    Get Started <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      <AdminMenu isOpen={showAdminMenu} onToggle={() => setShowAdminMenu(false)} />
      <UserMenu isOpen={showUserMenu} onToggle={() => setShowUserMenu(false)} />
    </>
  )
}

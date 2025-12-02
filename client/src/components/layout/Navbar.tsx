import { Link, NavLink } from 'react-router-dom'
import { UserButton, useAuth, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'

const navItems = [
  { to: '/search', label: 'Universities' },
  { to: '/blog', label: 'Blog' }, // New link
  { to: '/compare', label: 'Compare' },
]

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { profile, fetchProfile } = useUserStore()
  useEffect(() => {
    if (isSignedIn && !profile) {
      fetchProfile().catch(() => {})
    }
  }, [isSignedIn, profile, fetchProfile])
  const role = user?.publicMetadata?.role as string | undefined
  const isAdmin = (
    role === 'admin' ||
    (user?.publicMetadata?.isAdmin as boolean | undefined) === true ||
    (profile?.role?.toUpperCase?.() === 'ADMIN')
  )
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-bold text-xl tracking-tight">AcademOra</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <Link to="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm" className="bg-gradient-brand border-0 hover:opacity-90 transition-opacity">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">Admin</Button>
                </Link>
              )}
              <UserButton />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium py-2 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              {!isSignedIn ? (
                <div className="flex flex-col gap-2">
                  <Link to="/sign-in" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/sign-up" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-brand">Get Started</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Dashboard</Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Admin</Button>
                    </Link>
                  )}
                  <div className="flex justify-center py-2">
                    <UserButton />
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

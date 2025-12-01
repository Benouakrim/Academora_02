import { Link, NavLink } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { isSignedIn } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-lg">
            AcademOra
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/search">Search</NavItem>
            <NavItem to="/matching">Matching</NavItem>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-4"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-4"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

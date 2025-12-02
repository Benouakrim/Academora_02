import { Link } from 'react-router-dom'
import { GraduationCap, Github, Twitter, Linkedin, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">AcademOra</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering the next generation of students with data-driven university discovery and financial planning tools.
            </p>
            <div className="flex gap-4 pt-2">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <Button key={i} variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                  <Icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>
          
          {/* Links Columns */}
          <div>
            <h4 className="font-bold mb-6 text-foreground">Platform</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/search" className="hover:text-primary transition-colors">University Search</Link></li>
              <li><Link to="/compare" className="hover:text-primary transition-colors">Comparison Tool</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Student Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-foreground">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-foreground">Legal</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} AcademOra Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
            <span>for students worldwide.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import AnimatedBackground from '@/components/ui/animated-background'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <AnimatedBackground intensity={3} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Your Dream University Awaits
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover, compare, and plan your path with data-driven insights.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/sign-up">
              <Button className="w-full sm:w-auto">Get Started</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" className="w-full sm:w-auto">How it Works</Button>
            </a>
          </div>

          <div className="mt-6 text-sm text-foreground/70">
            Trusted by 50,000+ students worldwide
          </div>
        </div>
      </div>
    </section>
  )
}

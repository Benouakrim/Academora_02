import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Search, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AnimatedBackground from '@/components/ui/animated-background'
import { mediaApi } from '@/api/mediaApi'

export default function HeroSection() {
  const videoSectionRef = useRef<HTMLDivElement>(null)
  const bgImageRef = useRef<string | null>(null)

  useEffect(() => {
    // Fetch hero video for background image
    const fetchHeroImage = async () => {
      try {
        const hero = await mediaApi.getHeroVideo()
        if (hero?.thumbnailUrl) {
          bgImageRef.current = hero.thumbnailUrl
        }
      } catch (error) {
        console.error('Failed to fetch hero image:', error)
      }
    }

    fetchHeroImage()
  }, [])

  const scrollToVideos = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section 
      ref={videoSectionRef}
      className="relative overflow-hidden min-h-[90vh] flex items-center justify-center pt-16"
      style={{
        backgroundImage: bgImageRef.current ? `url(${bgImageRef.current})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Overlay for Readability */}
      <div className="absolute inset-0 z-0">
        {bgImageRef.current ? (
          <>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
          </>
        ) : (
          <>
            <AnimatedBackground intensity={2} className="opacity-50 dark:opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          </>
        )}
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AcademOra V1.0 is Live
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Find Your{' '}
            <span className="text-gradient-brand relative inline-block">
              Dream University
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Data-driven matching, financial aid predictions, and real student insights. 
            Stop guessing and start planning your future with confidence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/search">
              <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-primary-lg shadow-primary/20">
                <Search className="w-5 h-5" />
                Find Universities
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg gap-2 bg-white/50 dark:bg-black/50 backdrop-blur-md"
              onClick={scrollToVideos}
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-12 flex flex-col items-center gap-4 text-sm text-muted-foreground"
          >
            <p>Trusted by students from</p>
            <div className="flex items-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> MIT</div>
               <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Stanford</div>
               <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Oxford</div>
               <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Toronto</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

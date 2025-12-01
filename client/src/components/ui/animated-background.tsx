import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

type AnimatedBackgroundProps = {
  colors?: string[]
  className?: string
  intensity?: number // 1..3 controls orb size/blur
}

const defaultColors = [
  'bg-primary/20',
  'bg-secondary/20',
  'bg-accent/20',
]

export default function AnimatedBackground({
  colors = defaultColors,
  className,
  intensity = 2,
}: AnimatedBackgroundProps) {
  const controls = useAnimationControls()

  useEffect(() => {
    async function loop() {
      while (true) {
        await controls.start({
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
          transition: { duration: 12 + Math.random() * 10, ease: 'easeInOut' },
        })
      }
    }
    loop()
  }, [controls])

  const size = intensity === 3 ? 'w-[38rem] h-[38rem]' : intensity === 1 ? 'w-[20rem] h-[20rem]' : 'w-[28rem] h-[28rem]'
  const blur = intensity === 3 ? 'blur-3xl' : 'blur-2xl'

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="relative h-full w-full">
        {colors.slice(0, 3).map((c, i) => (
          <motion.div
            key={i}
            animate={controls}
            className={cn('absolute rounded-full', blur, c)}
            style={{
              left: `${20 + i * 25}%`,
              top: `${20 + (2 - i) * 20}%`,
              filter: 'saturate(1.2)',
            }}
          >
            <div className={cn('opacity-70', size)} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function ProblemSolutionSection() {
  const problems = [
    "Applying to universities blindly without knowing real costs",
    "Spending hours researching without a clear strategy",
    "Missing financial aid opportunities that match your profile",
    "Comparing universities without reliable data",
    "Getting rejected from dreams schools due to poor targeting"
  ]

  const solutions = [
    "Instant net price estimates tailored to your income & profile",
    "AI-powered matching finds your perfect universities in minutes",
    "Smart financial aid predictions show your actual costs upfront",
    "Comprehensive data-driven comparisons in one unified platform",
    "Strategic recommendations increase your acceptance rates"
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            The University Search Struggle is <span className="text-destructive">Real</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Students waste months researching universities without a clear strategy. We fixed that.
          </p>
        </motion.div>

        {/* Problem & Solution Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
              </div>
              The Old Way
            </h3>
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-4 border-l-4 border-l-destructive/50 bg-destructive/5 hover:bg-destructive/10 transition-colors duration-300">
                    <p className="text-muted-foreground">{problem}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              The Academora Way
            </h3>
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <motion.div
                  key={solution}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-4 border-l-4 border-l-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors duration-300">
                    <p className="text-muted-foreground">{solution}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-12 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-primary mb-2">8 hours</div>
            <p className="text-muted-foreground">Average time saved per student</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">40K+</div>
            <p className="text-muted-foreground">Average annual savings on costs</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">3x</div>
            <p className="text-muted-foreground">Higher acceptance rate to target schools</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { ArrowRight, Search, TrendingUp, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export default function ProductDemoSection() {
  const steps = [
    {
      number: 1,
      title: "Tell Us About Yourself",
      description: "Share your academic profile: GPA, test scores, interests, and career goals",
      icon: Search,
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: 2,
      title: "Get AI-Powered Matches",
      description: "Our algorithm analyzes thousands of universities to find your perfect fit",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500"
    },
    {
      number: 3,
      title: "Compare & Analyze",
      description: "View side-by-side comparisons of costs, acceptance rates, and outcomes",
      icon: BarChart3,
      color: "from-orange-500 to-red-500"
    },
    {
      number: 4,
      title: "Make Confident Decisions",
      description: "Access financial aid predictions and student reviews to decide with certainty",
      icon: Search,
      color: "from-green-500 to-emerald-500"
    }
  ]

  const features = [
    "Instant Financial Aid Estimates",
    "AI Matching Algorithm",
    "Real Student Reviews",
    "Career Outcome Analytics",
    "Side-by-Side University Comparison",
    "Scholarship Finder"
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
      
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            See How It Works in 4 Simple Steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From profile creation to confident university selection, it takes less than 10 minutes
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Arrow Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 -right-3 w-6 h-0.5 bg-border/50"></div>
                )}

                <Card className="h-full p-6 text-center group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50">
                  {/* Step Number Badge */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} p-0.5 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Demo Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 md:p-12 mb-12"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">
            Everything Included
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-black/70 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <span className="font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start your journey toward the right university today. It's completely free to get started.
          </p>
          <Link to="/search">
            <Button size="lg" className="gap-2">
              Explore Universities Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

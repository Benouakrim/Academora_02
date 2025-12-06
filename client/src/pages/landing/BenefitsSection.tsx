import { motion } from 'framer-motion'
import { Zap, Brain, Shield, TrendingUp, BarChart3, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Our intelligent algorithm analyzes your profile to find perfect-fit universities tailored to your goals and abilities.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Instant Financial Insights",
      description: "Get real-time net price estimates and financial aid predictions before you apply. No surprises.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: BarChart3,
      title: "Data-Driven Comparisons",
      description: "Compare universities side-by-side using acceptance rates, costs, and post-graduation outcomes.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Verified Student Reviews",
      description: "Read authentic reviews from current students about campus life, academics, and real student experiences.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Career Path Analytics",
      description: "Visualize potential career outcomes and salary expectations based on your field of study.",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: Lightbulb,
      title: "Smart Recommendations",
      description: "Receive personalized suggestions for scholarships, programs, and universities you haven't considered.",
      color: "from-indigo-500 to-blue-500"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold"
          >
            Why Students Choose Academora
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            We combine advanced technology with real student insights to help you make the best university decision
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16 pt-12 border-t border-border/50"
        >
          <p className="text-muted-foreground mb-4">
            These benefits have saved our students an average of $40,000+ per year in education costs
          </p>
        </motion.div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { ArrowRight, Eye, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export default function SecondaryCTASection() {
  const ctas = [
    {
      icon: Eye,
      title: "Watch Demo",
      description: "See Academora in action with our 5-minute guided walkthrough",
      cta: "View Demo",
      color: "from-blue-500 to-cyan-500",
      action: () => window.open('#', '_blank')
    },
    {
      icon: MessageSquare,
      title: "Talk to Our Team",
      description: "Have questions? Chat with an education advisor right now",
      cta: "Start Chat",
      color: "from-purple-500 to-pink-500",
      action: () => {
        // Trigger chat widget if available
        if (window.Intercom) {
          window.Intercom('show')
        }
      }
    },
    {
      icon: ArrowRight,
      title: "Schedule a Call",
      description: "Get personalized guidance from our education experts",
      cta: "Book a Call",
      color: "from-orange-500 to-red-500",
      action: () => window.open('#', '_blank')
    }
  ]

  const features = [
    { label: "Free University Search", value: "✓" },
    { label: "AI Matching Algorithm", value: "✓" },
    { label: "Financial Aid Calculator", value: "✓" },
    { label: "Real Student Reviews", value: "✓" },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        {/* Primary CTA Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Not Sure Where to Start?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose an option that works best for you
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ctas.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full p-6 flex flex-col group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 cursor-pointer"
                    onClick={item.action}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm flex-grow mb-4">
                      {item.description}
                    </p>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      {item.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-primary/5 border border-primary/20 rounded-xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side - Features */}
            <div>
              <h3 className="text-xl font-bold mb-6">Everything You Get</h3>
              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{feature.value}</span>
                    </div>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - CTA */}
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4">
                Ready to Find Your Dream University?
              </h3>
              <p className="text-muted-foreground mb-6">
                Start exploring now. It only takes a few minutes to get personalized university matches.
              </p>
              <Link to="/search" className="w-fit">
                <Button size="lg" className="gap-2">
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

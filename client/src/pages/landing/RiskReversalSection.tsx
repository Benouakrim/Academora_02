import { motion } from 'framer-motion'
import { Check, Shield, Clock, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function RiskReversalSection() {
  const guarantees = [
    {
      icon: Check,
      title: "30-Day Money-Back Guarantee",
      description: "Try our premium features for 30 days. If you're not 100% satisfied, we'll refund your money. No questions asked.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Clock,
      title: "Cancel Anytime",
      description: "No contracts, no hidden fees. You're in complete control. Cancel your subscription at any time with a single click.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "No Credit Card Required",
      description: "Start with our free account today. No credit card needed to explore universities, run matches, or estimate financial aid.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Free Trial Access",
      description: "Try all premium features free for 14 days. Get full access to advanced analytics, advisor sessions, and more.",
      color: "from-orange-500 to-red-500"
    }
  ]

  const trust = [
    "SOC 2 Type II Certified",
    "GDPR & FERPA Compliant",
    "Bank-Level Encryption",
    "Zero Data Selling Policy"
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50"></div>

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
            We Stand Behind Our Product
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zero risk. We're so confident you'll love Academora, we guarantee it.
          </p>
        </motion.div>

        {/* Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {guarantees.map((guarantee, index) => {
            const Icon = guarantee.icon
            return (
              <motion.div
                key={guarantee.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${guarantee.color} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <CardTitle className="text-xl">{guarantee.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {guarantee.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-8 md:p-12 mb-12"
        >
          <h3 className="text-xl font-bold mb-8 text-center">
            Enterprise-Grade Security & Compliance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {trust.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold">{item}</p>
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
          <div>
            <p className="text-muted-foreground mb-2">Ready to take the first step?</p>
            <h3 className="text-2xl font-bold mb-6">
              Join 50,000+ students making smarter university decisions
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Today
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Universities
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            No credit card required. Takes less than 2 minutes to get started.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

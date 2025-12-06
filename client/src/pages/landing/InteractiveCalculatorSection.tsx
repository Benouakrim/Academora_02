import { motion } from 'framer-motion'
import { Calculator, Zap } from 'lucide-react'
import ROICalculator from './ROICalculator'

export default function InteractiveCalculatorSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <Calculator className="w-5 h-5" />
            <span className="text-sm font-semibold">Interactive Tool</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            See How Much You Could Save
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use our interactive calculator to estimate your actual net cost and potential scholarship opportunities
          </p>
        </motion.div>

        {/* Calculator & Info Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold leading-tight">
              Know Your Real University Costs Before Applying
            </h3>

            <p className="text-muted-foreground text-lg">
              Most students never see the full picture. Sticker prices hide thousands in financial aid, scholarships, and discounts you might qualify for.
            </p>

            {/* Key Points */}
            <div className="space-y-4">
              {[
                {
                  title: "Personalized Aid Estimates",
                  desc: "Based on your family income and profile"
                },
                {
                  title: "Scholarship Discovery",
                  desc: "Find awards matching your background"
                },
                {
                  title: "Real Student Data",
                  desc: "See what others actually paid"
                },
                {
                  title: "4-Year Projections",
                  desc: "Understand your total cost of attendance"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-6 border-t border-border/50 space-y-3"
            >
              <p className="font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                The Average Student Saves:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-primary">$40,000+</p>
                  <p className="text-xs text-muted-foreground">Per year in costs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">$160,000+</p>
                  <p className="text-xs text-muted-foreground">Over 4 years</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Calculator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ROICalculator />
          </motion.div>
        </div>

        {/* Trust Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center"
        >
          <p className="text-muted-foreground">
            Our calculator uses actual institutional data, FAFSA formulas, and historical trends.
            <br />
            <span className="text-sm">Get your personalized estimate in less than 2 minutes.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

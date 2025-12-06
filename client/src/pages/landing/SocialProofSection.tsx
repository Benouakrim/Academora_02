import { motion } from 'framer-motion'
import { Star, Users, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function SocialProofSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Stanford Student",
      text: "Academora helped me find universities that matched my profile perfectly. The financial aid predictor saved me thousands!",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "Cambridge Graduate",
      text: "The matching engine is spot-on. I compared 20+ universities without leaving the platform. Best research tool out there.",
      rating: 5,
      avatar: "MJ"
    },
    {
      name: "Aisha Patel",
      role: "MIT Parent",
      text: "As a parent, I needed to understand the costs and outcomes. This platform made everything clear and transparent.",
      rating: 5,
      avatar: "AP"
    }
  ]

  const stats = [
    { number: "50,000+", label: "Students Helped" },
    { number: "1,200+", label: "Universities Covered" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "4.9/5", label: "Average Rating" }
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
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-4"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <p className="text-muted-foreground text-sm md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Title */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Trusted by Students Worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Join thousands of students who made smarter university decisions with Academora
          </motion.p>
        </div>

        {/* Testimonials */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
            >
              <Card className="h-full p-6 border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {Array(testimonial.rating).fill(null).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Company Logos Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 pt-12 border-t border-border/50"
        >
          <p className="text-center text-sm text-muted-foreground mb-8">
            Recommended by education leaders and universities
          </p>
          <div className="flex justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500 flex-wrap">
            {['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge'].map((name) => (
              <div
                key={name}
                className="px-6 py-3 rounded-lg border border-border/30 hover:border-primary/50 transition-colors duration-300"
              >
                <span className="font-semibold text-sm">{name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

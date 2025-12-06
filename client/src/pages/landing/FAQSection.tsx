import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function FAQSection() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "Is Academora really free to use?",
          a: "Yes! Our core features including university search, matching algorithm, and financial aid estimator are completely free. We offer premium features for students who want advanced analytics and personalized coaching."
        },
        {
          q: "Do I need to create an account?",
          a: "You can browse universities without an account, but creating a free account lets you save universities, track your applications, and get personalized recommendations."
        },
        {
          q: "How accurate are the financial aid predictions?",
          a: "Our predictions are based on actual institutional data and historical trends. We achieve 94% accuracy by analyzing your family income, residency status, and academic profile. The more information you provide, the more accurate the predictions become."
        }
      ]
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          q: "Is my personal information safe?",
          a: "Absolutely. We use industry-standard encryption (SSL/TLS) for all data in transit and at rest. We're SOC 2 Type II certified and comply with GDPR and FERPA regulations. Your data is never sold to third parties."
        },
        {
          q: "How do you use my data?",
          a: "We use your profile data solely to provide better recommendations and improve our matching algorithm. You have full control and can delete your account and data anytime. Read our detailed Privacy Policy for more information."
        },
        {
          q: "Will universities see my profile?",
          a: "No. Universities only see information you explicitly choose to share, like when you submit an application through our platform. Your profile and browsing history remain completely private."
        }
      ]
    },
    {
      category: "Features & Tools",
      questions: [
        {
          q: "How does the AI matching algorithm work?",
          a: "Our algorithm analyzes over 200 data points including your GPA, test scores, extracurriculars, career interests, and financial constraints. It then compares your profile against thousands of universities to find schools where students like you have thrived."
        },
        {
          q: "Can I use Academora if I'm an international student?",
          a: "Yes! We have comprehensive data on over 1,200 universities across 50+ countries. Our platform specifically accounts for international student tuition, visa requirements, and scholarship opportunities."
        },
        {
          q: "Does this work for graduate school?",
          a: "Currently, Academora focuses on undergraduate universities. We're building graduate school tools and will launch them in Q2 2025."
        },
        {
          q: "Can my parents/counselor access my profile?",
          a: "Yes! You can invite family members or counselors to collaborate. They can see what you're viewing and offer advice without accessing your personal test scores unless you grant permission."
        }
      ]
    },
    {
      category: "Support & Guarantee",
      questions: [
        {
          q: "What if I'm not satisfied?",
          a: "We offer a 30-day satisfaction guarantee on all premium features. If you're not happy, we'll refund your money, no questions asked."
        },
        {
          q: "How do I contact customer support?",
          a: "You can reach our support team via email (support@academora.com), live chat (available 8am-8pm EST), or schedule a call with a counselor. Most inquiries are answered within 2 hours."
        },
        {
          q: "Is there a student advisor I can talk to?",
          a: "Yes! Premium members get access to one-on-one sessions with our education advisors who can help you interpret recommendations and create an application strategy."
        }
      ]
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
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Academora. Can't find your answer?{' '}
            <a href="mailto:support@academora.com" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
        </motion.div>

        {/* FAQs by Category */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {faqs.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold mb-6 text-primary flex items-center gap-3">
                <div className="w-1 h-8 rounded-full bg-primary"></div>
                {category.category}
              </h3>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {category.questions.map((faq, questionIndex) => (
                  <AccordionItem
                    key={`${categoryIndex}-${questionIndex}`}
                    value={`${categoryIndex}-${questionIndex}`}
                    className="border border-border/50 rounded-lg px-6 data-[state=open]:bg-primary/5 transition-colors duration-200"
                  >
                    <AccordionTrigger className="hover:no-underline py-4 font-semibold">
                      <span className="text-left">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 pt-0">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 pt-12 border-t border-border/50 text-center"
        >
          <p className="text-muted-foreground mb-2">Didn't find what you were looking for?</p>
          <a
            href="mailto:support@academora.com"
            className="text-primary hover:underline font-semibold"
          >
            Get in touch with our support team →
          </a>
        </motion.div>
      </div>
    </section>
  )
}

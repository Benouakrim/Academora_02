import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Scale, Calculator, TrendingUp, Globe, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const features = {
  match: [
    {
      title: "Smart Matching Engine",
      desc: "Our algorithm analyzes your GPA, test scores, and interests to find schools where you'll thrive.",
      icon: Target,
      color: "text-primary"
    },
    {
      title: "Global Database",
      desc: "Access detailed data on thousands of universities across the US, UK, Canada, and beyond.",
      icon: Globe,
      color: "text-blue-500"
    }
  ],
  compare: [
    {
      title: "Side-by-Side Analysis",
      desc: "Compare tuition, acceptance rates, and student life metrics in a unified dashboard.",
      icon: Scale,
      color: "text-secondary"
    },
    {
      title: "Real Student Reviews",
      desc: "Go beyond the brochure with authentic feedback on campus safety, housing, and social life.",
      icon: ShieldCheck,
      color: "text-green-500"
    }
  ],
  plan: [
    {
      title: "Financial Aid Predictor",
      desc: "Estimate your actual net price based on family income and residency status.",
      icon: Calculator,
      color: "text-accent"
    },
    {
      title: "ROI & Outcomes",
      desc: "Visualize potential career paths and salary expectations for different majors.",
      icon: TrendingUp,
      color: "text-amber-500"
    }
  ]
}

export default function FeatureShowcase() {
  return (
    <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50 border-y border-border/50">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need to decide</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed to simplify every step of your university journey.
          </p>
        </div>

        <Tabs defaultValue="match" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-auto p-1 bg-white dark:bg-black border shadow-sm rounded-full">
              <TabsTrigger value="match" className="rounded-full py-2.5">Match</TabsTrigger>
              <TabsTrigger value="compare" className="rounded-full py-2.5">Compare</TabsTrigger>
              <TabsTrigger value="plan" className="rounded-full py-2.5">Plan</TabsTrigger>
            </TabsList>
          </div>

          {Object.entries(features).map(([key, items]) => (
            <TabsContent key={key} value={key}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-none shadow-card hover:shadow-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className={`p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 ${item.color}`}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed">
                          {item.desc}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

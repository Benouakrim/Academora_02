import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Target, Scale, Calculator } from 'lucide-react'

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
      <div className="md:col-span-2 flex items-center justify-center md:justify-start">
        <div className="h-20 w-20 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="md:col-span-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export default function FeatureShowcase() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold">Explore the Platform</h2>
        <p className="mt-2 text-muted-foreground">Switch between features to see how AcademOra helps you decide.</p>
      </div>
      <Tabs defaultValue="match" className="w-full">
        <div className="flex items-center justify-center">
          <TabsList>
            <TabsTrigger value="match">Match</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-8">
          <TabsContent value="match">
            <FeatureCard
              title="Smart Matching"
              description="Our algorithm finds schools that fit your GPA and Budget."
              icon={<Target className="h-10 w-10" />}
            />
          </TabsContent>
          <TabsContent value="compare">
            <FeatureCard
              title="Compare Schools"
              description="Side-by-side analysis of tuition and ROI."
              icon={<Scale className="h-10 w-10" />}
            />
          </TabsContent>
          <TabsContent value="plan">
            <FeatureCard
              title="Plan Your Path"
              description="Financial aid predictions and a step-by-step roadmap."
              icon={<Calculator className="h-10 w-10" />}
            />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  )
}

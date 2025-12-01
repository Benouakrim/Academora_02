import { Calculator, GraduationCap, DollarSign, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UniversityDetail } from '@/hooks/useUniversityDetail'

type UniversityTabsProps = {
  university: UniversityDetail
  onOpenCalculator?: () => void
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
      <div className="p-2 rounded-md bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}

export default function UniversityTabs({ university, onOpenCalculator }: UniversityTabsProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `$${(value / 1000).toFixed(0)}k`
  }

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${(value * 100).toFixed(0)}%`
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {university.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {university.description || 'No description available.'}
              </p>
            </CardContent>
          </Card>

          {university.popularMajors && university.popularMajors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Popular Majors</CardTitle>
                <CardDescription>Most sought-after programs at this university</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {university.popularMajors.map((major, idx) => (
                    <Badge key={idx} variant="secondary">
                      {major}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {university.ranking && (
            <Card>
              <CardHeader>
                <CardTitle>Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">#{university.ranking}</span>
                  <span className="text-muted-foreground">National Ranking</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Admissions Tab */}
        <TabsContent value="admissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admissions Requirements</CardTitle>
              <CardDescription>Typical profile of admitted students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  icon={<GraduationCap className="h-5 w-5" />}
                  label="Acceptance Rate"
                  value={formatPercent(university.acceptanceRate)}
                />
                <StatCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Minimum GPA"
                  value={university.minGpa?.toFixed(2) || 'N/A'}
                />
                <StatCard
                  icon={<GraduationCap className="h-5 w-5" />}
                  label="Average SAT"
                  value={university.avgSatScore || 'N/A'}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tuition & Fees</CardTitle>
              <CardDescription>Annual cost breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  icon={<DollarSign className="h-5 w-5" />}
                  label="In-State Tuition"
                  value={formatCurrency(university.tuitionInState)}
                />
                <StatCard
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Out-of-State Tuition"
                  value={formatCurrency(university.tuitionOutState)}
                />
                <StatCard
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Cost of Living"
                  value={formatCurrency(university.costOfLiving)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculate Your Net Price
              </CardTitle>
              <CardDescription>
                Get a personalized estimate of financial aid and your actual out-of-pocket cost
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full sm:w-auto" onClick={onOpenCalculator}>
                <Calculator className="h-4 w-4 mr-2" />
                Start Financial Aid Calculator
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

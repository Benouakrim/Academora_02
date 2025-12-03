import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, DollarSign, Users, Briefcase, Lightbulb } from 'lucide-react'
import type { UniversityDetail } from '@/hooks/useUniversityDetail'
import ReviewList from '@/components/reviews/ReviewList'
import CareerHeatmap from '@/components/visualizations/CareerHeatmap'
import ScoreRangeChart from '@/components/university/ScoreRangeChart'
import StarRating from '@/components/reviews/StarRating'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Helper for formatting currency
const fmtMoney = (val: number | null) => val ? `$${val.toLocaleString()}` : 'N/A'
const fmtPct = (val: number | null) => val ? `${(val * 100).toFixed(1)}%` : 'N/A'

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-3 border-b last:border-0 border-border/50">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function UniversityTabs({ university }: { university: UniversityDetail }) {
  // Fetch micro-content for this university
  const { data: microContentData } = useQuery({
    queryKey: ['microContent', university.id],
    queryFn: async () => {
      const { data } = await api.get(`/micro-content/university/${university.id}`)
      return data.data as Array<{
        id: string
        category: string
        title: string
        content: string
        priority: number
      }>
    },
    enabled: !!university.id,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap justify-start">
          <TabsTrigger value="overview" className="h-10 px-6 rounded-md">Overview</TabsTrigger>
          <TabsTrigger value="admissions" className="h-10 px-6 rounded-md">Admissions</TabsTrigger>
          <TabsTrigger value="costs" className="h-10 px-6 rounded-md">Costs & Aid</TabsTrigger>
          <TabsTrigger value="outcomes" className="h-10 px-6 rounded-md">Outcomes</TabsTrigger>
          <TabsTrigger value="reviews" className="h-10 px-6 rounded-md">Reviews</TabsTrigger>
        </TabsList>

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{university.description || "No description available."}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Popular Majors</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {university.popularMajors.map(m => (
                  <Badge key={m} variant="secondary" className="px-3 py-1 text-sm">{m}</Badge>
                ))}
              </CardContent>
            </Card>

            {/* Campus Tips from MicroContent */}
            {microContentData && microContentData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" /> Campus Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {microContentData.map((tip) => (
                    <div key={tip.id} className="border-l-4 border-primary/30 pl-4 py-2">
                      <h4 className="font-semibold text-foreground mb-1">{tip.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
                      {tip.category && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {tip.category.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Student Body
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatRow label="Total Students" value={university.studentPopulation?.toLocaleString()} />
                <StatRow label="Student/Faculty Ratio" value={`1:${university.studentFacultyRatio || '?'}`} />
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Male ({fmtPct(university.percentMale)})</span>
                    <span>Female ({fmtPct(university.percentFemale)})</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                    <div className="bg-blue-500 h-full" style={{ width: `${(university.percentMale || 0.5) * 100}%` }} />
                    <div className="bg-pink-500 h-full" style={{ width: `${(university.percentFemale || 0.5) * 100}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- ADMISSIONS TAB --- */}
        <TabsContent value="admissions" className="grid grid-cols-1 gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Selectivity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="text-4xl font-black text-primary">{fmtPct(university.acceptanceRate)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Acceptance Rate</div>
                </div>
                <StatRow label="Application Deadline" value={university.applicationDeadline ? new Date(university.applicationDeadline).toLocaleDateString() : 'N/A'} />
                <StatRow label="Application Fee" value={university.applicationFee ? `$${university.applicationFee}` : 'N/A'} />
                <StatRow label="Common App" value={university.commonAppAccepted ? "Accepted" : "No"} />
                <StatRow label="Test Policy" value={university.testPolicy || 'N/A'} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatRow label="Average GPA" value={university.avgGpa || 'N/A'} />
                <StatRow label="Min GPA" value={university.minGpa || 'N/A'} />
                <StatRow label="Average SAT" value={university.avgSatScore || 'N/A'} />
                <StatRow label="Average ACT" value={university.avgActScore || 'N/A'} />
              </CardContent>
            </Card>
          </div>

          {/* Score Range Chart */}
          <ScoreRangeChart
            satMath25={university.satMath25}
            satMath75={university.satMath75}
            satVerbal25={university.satVerbal25}
            satVerbal75={university.satVerbal75}
            actComposite25={university.actComposite25}
            actComposite75={university.actComposite75}
          />
        </TabsContent>

        {/* --- COSTS TAB --- */}
        <TabsContent value="costs" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" /> Yearly Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatRow label="In-State Tuition" value={fmtMoney(university.tuitionInState)} />
              <StatRow label="Out-of-State" value={fmtMoney(university.tuitionOutState)} />
              <StatRow label="International" value={fmtMoney(university.tuitionInternational)} />
              <StatRow label="Room & Board" value={fmtMoney(university.roomAndBoard)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Financial Aid</CardTitle>
            </CardHeader>
            <CardContent>
              <StatRow label="Avg Net Price" value={fmtMoney(university.averageNetPrice)} />
              <StatRow label="Students w/ Aid" value={fmtPct(university.percentReceivingAid)} />
              <StatRow label="Avg Grant" value={fmtMoney(university.averageGrantAid)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- OUTCOMES TAB --- */}
        <TabsContent value="outcomes" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Employment & Graduation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatRow label="Graduation Rate" value={fmtPct(university.graduationRate)} />
                <StatRow label="Retention Rate" value={fmtPct(university.retentionRate)} />
                <StatRow label="Employment Rate (6mo)" value={fmtPct(university.employmentRate)} />
                <StatRow label="Starting Salary" value={fmtMoney(university.averageStartingSalary)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Career Support & Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-muted-foreground">Internship Support</span>
                    <div className="flex items-center gap-2">
                      {university.internshipSupport ? (
                        <>
                          <StarRating value={university.internshipSupport} readOnly size="sm" />
                          <span className="text-sm font-medium">({university.internshipSupport}/5)</span>
                        </>
                      ) : (
                        <span className="font-medium">N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-muted-foreground">Alumni Network</span>
                    <div className="flex items-center gap-2">
                      {university.alumniNetwork ? (
                        <>
                          <StarRating value={university.alumniNetwork} readOnly size="sm" />
                          <span className="text-sm font-medium">({university.alumniNetwork}/5)</span>
                        </>
                      ) : (
                        <span className="font-medium">N/A</span>
                      )}
                    </div>
                  </div>
                  <StatRow 
                    label="Post-Grad Work Visa" 
                    value={university.visaDurationMonths ? `${university.visaDurationMonths} months` : 'N/A'} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Legacy Feature Restored: Career Heatmap */}
            {university.averageStartingSalary && (
              <CareerHeatmap startingSalary={university.averageStartingSalary} />
            )}
          </div>
        </TabsContent>

        {/* --- REVIEWS TAB --- */}
        <TabsContent value="reviews">
          <ReviewList universityId={university.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

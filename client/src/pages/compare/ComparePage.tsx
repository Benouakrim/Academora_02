import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Plus, ArrowRight, BarChart3, Table2, CreditCard, Sparkles } from 'lucide-react'
import { useCompareStore, useCompareWithPredictions, useComparisonAnalysis } from '@/hooks/useCompare'
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ComparisonChart from '@/components/compare/ComparisonChart'
import { ProfileCompletenessBanner } from '@/components/compare/ProfileCompletenessBanner'
import { FinancialPredictions } from '@/components/compare/FinancialPredictions'
import { SmartRecommendations } from '@/components/compare/SmartRecommendations'
import { ComparisonTable } from '@/components/compare/ComparisonTable'
import { SaveComparisonDialog } from '@/components/compare/SaveComparisonDialog'

export default function ComparePage() {
  const { selectedSlugs, removeUniversity } = useCompareStore()
  const { data: comparisonData, isLoading } = useCompareWithPredictions()
  const { data: profileCompleteness, isLoading: loadingProfile } = useProfileCompleteness()
  
  // Get university IDs for analysis
  const universityIds = comparisonData?.universities?.map(u => u.id) || []
  const { data: analysis, isLoading: loadingAnalysis } = useComparisonAnalysis(universityIds)

  const [activeTab, setActiveTab] = useState<'overview' | 'table' | 'charts' | 'predictions'>('overview')

  if (selectedSlugs.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <ArrowRight className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Start Comparing</h1>
        <p className="text-xl text-muted-foreground max-w-md mb-8">
          You haven't selected any universities yet. Search for schools and click "Compare" to see them here.
        </p>
        <Link to="/search">
          <Button size="lg" className="bg-gradient-brand shadow-lg">
            Browse Universities
          </Button>
        </Link>
      </div>
    )
  }

  if (isLoading || loadingProfile) {
    return (
      <div className="container px-4 py-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const unis = comparisonData?.universities || []
  const predictions = comparisonData?.predictions || {}

  // Chart colors
  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']

  // --- Data Preparation for Charts ---
  
  // 1. Cost Chart (Bar)
  const costData = unis.map((u, i) => ({
    name: u.shortName || u.name,
    value: u.tuitionInternational || u.tuitionOutState || 0,
    fill: COLORS[i % COLORS.length]
  }))

  // 2. Scores Radar (Radar)
  const radarData = [
    { subject: 'Student Life', fullMark: 5 },
    { subject: 'Safety', fullMark: 5 },
    { subject: 'Party Scene', fullMark: 5 },
  ].map(metric => {
    const row: any = { subject: metric.subject }
    unis.forEach(u => {
      let val = 0
      if (metric.subject === 'Student Life') val = (u.studentLifeScore || 0) * 20
      if (metric.subject === 'Safety') val = (u.safetyRating || 0) * 20
      if (metric.subject === 'Party Scene') val = (u.partySceneRating || 0) * 20
      row[u.shortName || u.name] = val
    })
    return row
  })

  // 3. Scatter Plot Data (Safety vs Party Scene)
  const scatterData = unis.map((u, i) => ({
    name: u.shortName || u.name,
    x: u.partySceneRating || 0,
    y: u.safetyRating || 0,
    z: 200,
    fill: COLORS[i % COLORS.length]
  }))

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black pb-20">
      {/* Sticky Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-border sticky top-16 z-30 shadow-sm">
        <div className="container px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Comparison ({unis.length}/5)</h1>
          <div className="flex gap-3">
            {unis.length < 5 && (
              <Link to="/search">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Plus className="mr-2 h-4 w-4" /> Add University
                </Button>
              </Link>
            )}
            <SaveComparisonDialog universityIds={universityIds} />
            <Link to="/dashboard/saved-comparisons">
              <Button size="sm" variant="outline">
                View Saved
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 space-y-10">
        
        {/* Profile Completeness Banner */}
        {profileCompleteness && !loadingProfile && (
          <ProfileCompletenessBanner
            isComplete={profileCompleteness.isComplete}
            completionPercentage={profileCompleteness.completionPercentage}
            missingFields={profileCompleteness.missingFields}
          />
        )}

        {/* Smart Recommendations */}
        {analysis && !loadingAnalysis && analysis.recommendations && (
          <SmartRecommendations
            recommendations={analysis.recommendations}
            onSelectUniversity={(id) => {
              const uni = unis.find(u => u.id === id)
              if (uni) {
                document.getElementById(`university-${uni.slug}`)?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          />
        )}

        {/* Header Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {unis.map((u) => (
            <div
              key={u.id}
              id={`university-${u.slug}`}
              className="relative group bg-white dark:bg-neutral-900 border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => removeUniversity(u.slug)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 mb-4 p-2 bg-white rounded-xl border shadow-sm flex items-center justify-center">
                  {u.logoUrl ? (
                    <img src={u.logoUrl} alt={u.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-primary">U</span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{u.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{u.city}, {u.country}</p>
                <Link to={`/university/${u.slug}`} className="text-primary text-sm font-medium hover:underline">
                  View Full Profile
                </Link>
              </div>
            </div>
          ))}
          
          {/* Add Card Placeholder */}
          {unis.length < 5 && (
            <Link to="/search" className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors group">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <span className="font-medium text-muted-foreground">Add University</span>
            </Link>
          )}
        </div>

        {/* Financial Aid Predictions */}
        {comparisonData?.isProfileComplete && predictions && Object.keys(predictions).length > 0 && (
          <FinancialPredictions universities={unis} predictions={predictions} />
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table2 className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Costs</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ComparisonTable universities={unis} />
          </TabsContent>

          {/* Table Tab - Full Detail */}
          <TabsContent value="table">
            <ComparisonTable universities={unis} />
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            {unis.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ComparisonChart 
                  title="Annual Tuition (International/Out-of-State)" 
                  type="bar" 
                  data={costData} 
                  dataKeys={['value']}
                  unit="$"
                />
                {unis.length > 1 && (
                  <ComparisonChart 
                    title="Campus Life & Safety Scores" 
                    type="radar" 
                    data={radarData}
                    dataKeys={unis.map(u => u.shortName || u.name)}
                  />
                )}
                {unis.length >= 2 && (
                  <ComparisonChart 
                    title="Safety vs. Party Scene Analysis" 
                    type="scatter" 
                    data={scatterData}
                    dataKeys={[]}
                  />
                )}
              </div>
            )}
          </TabsContent>

          {/* Predictions Tab - Cost-focused */}
          <TabsContent value="predictions" className="space-y-6">
            {comparisonData?.isProfileComplete && predictions && Object.keys(predictions).length > 0 ? (
              <FinancialPredictions universities={unis} predictions={predictions} />
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Cost Predictions Available</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Complete your academic and financial profile to see personalized cost estimates for each university.
                </p>
                <Link to="/dashboard/profile?tab=financial">
                  <Button>Complete Profile</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


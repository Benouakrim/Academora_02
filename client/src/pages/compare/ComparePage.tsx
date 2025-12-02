import { Link } from 'react-router-dom'
import { X, Plus, ArrowRight, Check, AlertTriangle } from 'lucide-react'
import { useCompareStore, useCompareData } from '@/hooks/useCompare'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import ComparisonChart from '@/components/compare/ComparisonChart'

export default function ComparePage() {
  const { selectedSlugs, removeUniversity } = useCompareStore()
  const { data: universities, isLoading } = useCompareData()

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

  if (isLoading) {
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

  const unis = universities || []

  // --- Data Preparation for Charts ---
  
  // 1. Cost Chart (Bar)
  const costData = unis.map((u, i) => ({
    name: u.shortName || u.name,
    value: u.tuitionInternational || u.tuitionOutState || 0,
    fill: ['#3b82f6', '#8b5cf6', '#f59e0b'][i % 3]
  }))

  // 2. Scores Radar (Radar)
  // Transform data: [{ subject: 'Academic', MIT: 90, Stanford: 95 }, ...]
  const radarData = [
    { subject: 'Student Life', fullMark: 5 },
    { subject: 'Safety', fullMark: 5 },
    { subject: 'Party Scene', fullMark: 5 },
  ].map(metric => {
    const row: any = { subject: metric.subject }
    unis.forEach(u => {
      // Normalize 0-5 scores to 0-100 for chart
      let val = 0
      if (metric.subject === 'Student Life') val = (u.studentLifeScore || 0) * 20
      if (metric.subject === 'Safety') val = (u.safetyRating || 0) * 20
      if (metric.subject === 'Party Scene') val = (u.partySceneRating || 0) * 20
      row[u.shortName || u.name] = val
    })
    return row
  })

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black pb-20">
      <div className="bg-white dark:bg-neutral-900 border-b border-border sticky top-16 z-30 shadow-sm">
        <div className="container px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Comparison ({unis.length}/3)</h1>
          <div className="flex gap-3">
            {unis.length < 3 && (
              <Link to="/search">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Plus className="mr-2 h-4 w-4" /> Add University
                </Button>
              </Link>
            )}
            <Link to="/dashboard">
              <Button size="sm">Save Comparison</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 space-y-10">
        
        {/* Header Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {unis.map((u) => (
            <div key={u.id} className="relative group bg-white dark:bg-neutral-900 border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
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
          {unis.length < 3 && (
            <Link to="/search" className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors group">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <span className="font-medium text-muted-foreground">Add University</span>
            </Link>
          )}
        </div>

        {/* Visualizations */}
        {unis.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ComparisonChart 
              title="Annual Tuition (International/Out-of-State)" 
              type="bar" 
              data={costData} 
              dataKeys={['value']} // Single series per bar since data structure is flattened
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
          </div>
        )}

        {/* Detailed Table */}
        {unis.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border overflow-hidden shadow-sm">
            <div className="p-6 border-b bg-neutral-50 dark:bg-neutral-800/50">
              <h3 className="font-bold text-lg">Detailed Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {[
                    { label: 'Acceptance Rate', render: (u: any) => u.acceptanceRate ? <Badge variant={u.acceptanceRate < 0.2 ? "destructive" : "secondary"}>{(u.acceptanceRate * 100).toFixed(1)}%</Badge> : '—' },
                    { label: 'Average GPA', render: (u: any) => u.avgGpa || '—' },
                    { label: 'SAT Range (Math)', render: (u: any) => u.satMath25 ? `${u.satMath25}-${u.satMath75}` : '—' },
                    { label: 'Student Population', render: (u: any) => u.studentPopulation?.toLocaleString() || '—' },
                    { label: 'Intl. Students', render: (u: any) => u.percentInternational ? `${(u.percentInternational * 100).toFixed(0)}%` : '—' },
                    { label: 'Climate', render: (u: any) => u.climateZone || '—' },
                    { label: 'Setting', render: (u: any) => u.setting || '—' },
                    { label: 'Post-Grad Visa', render: (u: any) => u.visaDurationMonths ? <span className="text-green-600 font-medium flex items-center gap-1"><Check className="h-3 w-3" /> {u.visaDurationMonths} Months</span> : <span className="text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Unknown</span> },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4 w-1/4 font-medium text-muted-foreground">{row.label}</td>
                      {unis.map((u) => (
                        <td key={u.id} className="p-4 w-1/4 font-medium border-l">
                          {row.render(u)}
                        </td>
                      ))}
                      {/* Pad empty columns */}
                      {Array.from({ length: 3 - unis.length }).map((_, i) => <td key={i} className="p-4 w-1/4 border-l"></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

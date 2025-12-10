import { Link } from 'react-router-dom'
import { MapPin, Heart, Trophy, DollarSign, TrendingUp, GraduationCap, Eye, Plus, Check, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useCompareStore } from '@/hooks/useCompare'
import { useSearchStore } from '@/store/useSearchStore'
import MatchBreakdownPanel from '@/components/search/MatchBreakdownPanel'
import MatchRadarChart from '@/components/search/MatchRadarChart'
import type { UniversityMatchResult } from '@/hooks/useUniversitySearch'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Circular Progress Component for Match Score
function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 6)
  const strokeDashoffset = circumference - (value / 100) * circumference
  
  // Dynamic color based on score
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-500'
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 6}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 6}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${getColor(value)} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getColor(value)}`}>{value}</span>
        <span className="text-xs text-muted-foreground">Match</span>
      </div>
    </div>
  )
}

const getMatchLabel = (score: number): string => {
  if (score >= 90) return 'PERFECT MATCH';
  if (score >= 80) return 'EXCELLENT MATCH';
  if (score >= 70) return 'GREAT MATCH';
  if (score >= 60) return 'GOOD MATCH';
  if (score >= 50) return 'FAIR MATCH';
  return 'REACH SCHOOL';
};

const getMatchLabelColor = (score: number): string => {
  if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 80) return 'text-blue-600 dark:text-blue-400';
  if (score >= 70) return 'text-purple-600 dark:text-purple-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

export default function UniversityCard({ result }: { result: UniversityMatchResult }) {
  const university = result.university
  const { selectedSlugs, addUniversity, removeUniversity } = useCompareStore()
  const { viewMode } = useSearchStore()
  const isSelected = selectedSlugs.includes(university.slug)
  const isMatchMode = viewMode === 'MATCH'
  
  // Format tuition nicely
  const tuition = university.tuitionInternational || university.tuitionOutState
  const formattedTuition = tuition 
    ? `$${(tuition / 1000).toFixed(1)}k` 
    : 'N/A'

  const matchLabel = getMatchLabel(result.matchPercentage)
  const matchLabelColor = getMatchLabelColor(result.matchPercentage)

  return (
    <Card className={cn(
      "group h-full flex flex-col overflow-hidden border-border/50 bg-white dark:bg-neutral-900 transition-all duration-300",
      isMatchMode && result.matchPercentage >= 90 && "border-emerald-500/50 shadow-lg shadow-emerald-500/10",
      isMatchMode && result.matchPercentage >= 80 && result.matchPercentage < 90 && "border-blue-500/50 shadow-lg shadow-blue-500/10",
      !isMatchMode && "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    )}>
      {/* Hero Image Area */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {university.heroImageUrl ? (
          <img 
            src={university.heroImageUrl} 
            alt={university.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
            <GraduationCap className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Ranking Badge Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          {university.ranking && (
            <Badge variant="warning" className="shadow-md bg-amber-400/95 text-black border-0 backdrop-blur-sm">
              <Trophy className="h-3 w-3 mr-1" /> #{university.ranking}
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => { e.preventDefault(); /* Todo: Implement save */ }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-muted-foreground hover:text-red-500 transition-colors shadow-md"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Match Score - Overlapping bottom */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
          {isMatchMode ? (
            // Match Mode: Larger, more prominent
            <div className="flex flex-col items-center gap-1">
              <CircularProgress value={result.matchPercentage} size={100} />
              <Badge 
                variant="secondary" 
                className={cn("text-[10px] font-bold uppercase tracking-wide shadow-md", matchLabelColor)}
              >
                {matchLabel}
              </Badge>
            </div>
          ) : (
            // Browse Mode: Smaller, with tooltip
            <Tooltip>
              <TooltipTrigger>
                <CircularProgress value={result.matchPercentage} size={80} />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-64 whitespace-normal">
                <div className="space-y-2 py-1">
                  <p className="font-semibold mb-2 text-white">Score Breakdown</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span>Academic:</span>
                      <span className="font-medium">{result.scoreBreakdown.academic.score}% ({result.scoreBreakdown.academic.contribution} pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Financial:</span>
                      <span className="font-medium">{result.scoreBreakdown.financial.score}% ({result.scoreBreakdown.financial.contribution} pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Social:</span>
                      <span className="font-medium">{result.scoreBreakdown.social.score}% ({result.scoreBreakdown.social.contribution} pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{result.scoreBreakdown.location.score}% ({result.scoreBreakdown.location.contribution} pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Career:</span>
                      <span className="font-medium">{result.scoreBreakdown.future.score}% ({result.scoreBreakdown.future.contribution} pts)</span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Content Area */}
      <CardContent className={cn(
        "flex-1 flex flex-col",
        isMatchMode ? "p-6 pt-16" : "p-6 pt-14"
      )}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {university.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{university.city}, {university.country}</span>
            </div>
          </div>
          {/* Logo Thumbnail */}
          <div className="h-12 w-12 rounded-lg border bg-white dark:bg-neutral-800 p-1.5 shadow-sm shrink-0">
            {university.logoUrl ? (
              <img src={university.logoUrl} alt="logo" className="h-full w-full object-contain" />
            ) : (
              <div className="h-full w-full bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
                {university.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Match Mode: Expandable Breakdown */}
        {isMatchMode && (
          <div className="mb-4 space-y-3">
            {/* Radar Chart */}
            <MatchRadarChart result={result} />
            
            {/* Detailed Breakdown */}
            <Accordion type="single" collapsible className="border-0">
              <AccordionItem value="breakdown" className="border-0">
                <AccordionTrigger className="py-2 px-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg hover:no-underline border border-border/50">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Detailed Scoring Breakdown</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3 pb-0">
                  <MatchBreakdownPanel result={result} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Key Metrics with Icons */}
        <div className="space-y-3 py-4 my-auto border-y border-border/50">
          {/* Tuition */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-green-500/10">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium">Annual Tuition</span>
            </div>
            <span className="font-bold text-foreground">{formattedTuition}</span>
          </div>

          {/* Acceptance Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium">Acceptance Rate</span>
            </div>
            <span className="font-bold text-foreground">
              {university.acceptanceRate ? `${(university.acceptanceRate * 100).toFixed(0)}%` : '—'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link to={`/university/${university.slug}`} className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant={isSelected ? "secondary" : "default"}
            className={isSelected 
              ? "gap-2 bg-secondary/80 hover:bg-secondary" 
              : "gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 border-0 shadow-md"}
            onClick={(e) => {
              e.preventDefault()
              if (isSelected) {
                removeUniversity(university.slug)
                toast.success(`Removed ${university.name} from comparison`)
              } else {
                if (selectedSlugs.length >= 5) {
                  toast.error('Maximum 5 universities can be compared')
                  return
                }
                addUniversity(university.slug)
                toast.success(`Added ${university.name} to comparison`, {
                  action: {
                    label: 'View',
                    onClick: () => window.location.href = '/compare'
                  }
                })
              }
            }}
            disabled={!isSelected && selectedSlugs.length >= 5}
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Compare
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

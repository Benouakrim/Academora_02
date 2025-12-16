import { Link } from 'react-router-dom'
import { MapPin, Heart, Trophy, DollarSign, TrendingUp, GraduationCap, Eye, Plus, Check, Sparkles, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { useCompareStore } from '@/hooks/useCompare'
import { useSearchStore } from '@/store/useSearchStore'
import MatchBreakdownPanel from '@/components/search/MatchBreakdownPanel'
import MatchRadarChart from '@/components/search/MatchRadarChart'
import type { UniversityMatchResult } from '@/hooks/useUniversitySearch'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Circular Progress Component for Match Score - Modern Design
function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 8)
  const strokeDashoffset = circumference - (value / 100) * circumference
  
  // Dynamic gradient colors based on score
  const getGradientAndGlow = (score: number) => {
    if (score >= 90) return {
      gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 via-emerald-50/70 to-emerald-100/40',
      darkBg: 'dark:from-emerald-900/40 dark:via-emerald-900/20 dark:to-emerald-900/10',
      border: 'border-emerald-300 dark:border-emerald-500/50',
      glow: 'shadow-2xl shadow-emerald-500/60',
      text: 'text-emerald-700 dark:text-emerald-400',
      glowFilter: '#10b981'
    }
    if (score >= 80) return {
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 via-blue-50/70 to-blue-100/40',
      darkBg: 'dark:from-blue-900/40 dark:via-blue-900/20 dark:to-blue-900/10',
      border: 'border-blue-300 dark:border-blue-500/50',
      glow: 'shadow-2xl shadow-blue-500/60',
      text: 'text-blue-700 dark:text-blue-400',
      glowFilter: '#3b82f6'
    }
    if (score >= 70) return {
      gradient: 'from-purple-400 via-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 via-purple-50/70 to-purple-100/40',
      darkBg: 'dark:from-purple-900/40 dark:via-purple-900/20 dark:to-purple-900/10',
      border: 'border-purple-300 dark:border-purple-500/50',
      glow: 'shadow-2xl shadow-purple-500/60',
      text: 'text-purple-700 dark:text-purple-400',
      glowFilter: '#a855f7'
    }
    if (score >= 60) return {
      gradient: 'from-amber-400 via-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 via-amber-50/70 to-amber-100/40',
      darkBg: 'dark:from-amber-900/40 dark:via-amber-900/20 dark:to-amber-900/10',
      border: 'border-amber-300 dark:border-amber-500/50',
      glow: 'shadow-2xl shadow-amber-500/60',
      text: 'text-amber-700 dark:text-amber-400',
      glowFilter: '#f59e0b'
    }
    return {
      gradient: 'from-red-400 via-red-500 to-red-600',
      bgGradient: 'from-red-50 via-red-50/70 to-red-100/40',
      darkBg: 'dark:from-red-900/40 dark:via-red-900/20 dark:to-red-900/10',
      border: 'border-red-300 dark:border-red-500/50',
      glow: 'shadow-2xl shadow-red-500/60',
      text: 'text-red-700 dark:text-red-400',
      glowFilter: '#ef4444'
    }
  }

  const theme = getGradientAndGlow(value)
  const containerSize = size + 20

  return (
    <div 
      className="relative group transition-all duration-500" 
      style={{ width: containerSize, height: containerSize }}
    >
      {/* Outer glow layer */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-500 group-hover:opacity-50 bg-gradient-to-r",
          theme.gradient
        )} 
        style={{ width: containerSize, height: containerSize }} 
      />
      
      {/* Background container with glassmorphism */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full border-2 backdrop-blur-md transition-all duration-500",
          "bg-gradient-to-br",
          theme.bgGradient,
          theme.darkBg,
          theme.border,
          theme.glow
        )}
        style={{ width: containerSize, height: containerSize }}
      />
      
      {/* Circle indicator ring */}
      <div 
        className={cn(
          "absolute inset-2 rounded-full border border-white/40 dark:border-white/20 pointer-events-none",
          "transition-all duration-500"
        )}
        style={{ width: containerSize - 16, height: containerSize - 16 }}
      />

      {/* SVG Indicator */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ width: containerSize, height: containerSize }}
      >
        <svg 
          className="transform -rotate-90 drop-shadow-lg" 
          width={size} 
          height={size}
          style={{ filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.15))' }}
        >
          <defs>
            <linearGradient id={`gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.glowFilter} stopOpacity={0.4} />
              <stop offset="100%" stopColor={theme.glowFilter} stopOpacity={0.9} />
            </linearGradient>
          </defs>
          
          {/* Background circle - subtle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
            className="text-white/20 dark:text-white/10 transition-colors duration-300"
          />
          
          {/* Progress circle with gradient */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            stroke={`url(#gradient-${value})`}
            strokeWidth="5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${theme.glowFilter})`
            }}
          />
        </svg>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="text-center">
          <span className={cn('text-2xl font-bold transition-colors duration-300', theme.text)}>
            {value}
          </span>
          <span className={cn('text-xs font-semibold block mt-1 transition-colors duration-300', theme.text)}>Match</span>
        </div>
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
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)
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
      "group relative h-full flex flex-col overflow-visible border-border/50 bg-white dark:bg-neutral-900 transition-all duration-300",
      isMatchMode && result.matchPercentage >= 90 && "border-emerald-500/50 shadow-lg shadow-emerald-500/10",
      isMatchMode && result.matchPercentage >= 80 && result.matchPercentage < 90 && "border-blue-500/50 shadow-lg shadow-blue-500/10",
      !isMatchMode && "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    )}>
      {/* Hero Image Area */}
      <div className="relative h-48 overflow-visible bg-muted">
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

      {/* Match Score - Floating on top of both image and card */}
      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-50">
        {isMatchMode ? (
          // Match Mode: Larger, more prominent
          <div className="flex flex-col items-center gap-2">
            <CircularProgress value={result.matchPercentage} size={110} />
            <Badge 
              variant="secondary" 
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border-0",
                matchLabelColor
              )}
            >
              {matchLabel}
            </Badge>
          </div>
        ) : (
          // Browse Mode: Smaller, with tooltip
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <CircularProgress value={result.matchPercentage} size={90} />
              </div>
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
        isMatchMode ? "p-6 pt-20" : "p-6 pt-16"
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

        {/* Match Mode: Expandable Sections */}
        {isMatchMode && (
          <div className="mt-4 space-y-3">
            {/* Match Visualization - Expandable */}
            <Accordion type="single" collapsible className="border-0">
              <AccordionItem value="visualization" className="border-0">
                <AccordionTrigger className="py-2 px-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg hover:no-underline border border-border/50">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <span>Match Visualization</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3 pb-0">
                  <MatchRadarChart result={result} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Detailed Breakdown - Dialog Button */}
            <Button
              onClick={() => setBreakdownDialogOpen(true)}
              variant="outline"
              className="w-full py-2 px-3 h-auto justify-start bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-border/50 hover:border-border hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/40 dark:hover:to-blue-900/40 transition-all"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-left flex-1">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Detailed Scoring Breakdown</span>
              </div>
              <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 ml-2" />
            </Button>

            {/* Breakdown Dialog */}
            <Dialog open={breakdownDialogOpen} onOpenChange={setBreakdownDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Detailed Scoring Breakdown
                  </DialogTitle>
                </DialogHeader>
                <MatchBreakdownPanel result={result} />
              </DialogContent>
            </Dialog>
          </div>
        )}

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

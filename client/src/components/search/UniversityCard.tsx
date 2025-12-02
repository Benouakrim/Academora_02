import { Link } from 'react-router-dom'
import { MapPin, Heart, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCompareStore } from '@/hooks/useCompare'
import type { University } from '@/hooks/useUniversitySearch'

export default function UniversityCard({ university }: { university: University }) {
  const { selectedSlugs, addUniversity, removeUniversity } = useCompareStore()
  const isSelected = selectedSlugs.includes(university.slug)
  
  // Format tuition nicely
  const tuition = university.tuitionInternational || university.tuitionOutState
  const formattedTuition = tuition 
    ? `$${(tuition / 1000).toFixed(1)}k` 
    : 'N/A'

  return (
    <Card className="group h-full flex flex-col overflow-hidden border-border/50 bg-white dark:bg-neutral-900 hover:border-primary/50 transition-all duration-300 hover:shadow-primary-lg/10">
      {/* Hero Image Area */}
      <div className="relative h-40 overflow-hidden bg-muted">
        {university.heroImageUrl ? (
          <img 
            src={university.heroImageUrl} 
            alt={university.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
            <span className="text-muted-foreground text-sm font-medium">No Image</span>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          {university.ranking && (
            <Badge variant="warning" className="shadow-sm bg-yellow-400/90 text-black border-0 backdrop-blur-sm">
              <Trophy className="h-3 w-3 mr-1" /> #{university.ranking}
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => { e.preventDefault(); /* Todo: Implement save */ }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-muted-foreground hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Content Area */}
      <CardContent className="flex-1 p-5 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {university.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{university.city}, {university.country}</span>
            </div>
          </div>
          {/* Logo Thumbnail */}
          <div className="h-10 w-10 rounded-lg border bg-white p-1 shadow-sm shrink-0">
            {university.logoUrl ? (
              <img src={university.logoUrl} alt="logo" className="h-full w-full object-contain" />
            ) : (
              <div className="h-full w-full bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">U</div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 py-4 my-auto">
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tuition</div>
            <div className="font-semibold text-foreground">{formattedTuition}<span className="text-xs font-normal text-muted-foreground">/yr</span></div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Acceptance</div>
            <div className="font-semibold text-foreground">
              {university.acceptanceRate ? `${(university.acceptanceRate * 100).toFixed(0)}%` : '—'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-border/50">
          <Link to={`/university/${university.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">View Details</Button>
          </Link>
          <Button 
            size="sm" 
            variant={isSelected ? "secondary" : "default"}
            className={isSelected ? "opacity-70" : "bg-gradient-brand border-0"}
            onClick={() => isSelected ? removeUniversity(university.slug) : addUniversity(university.slug)}
          >
            {isSelected ? "Added" : "Compare"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

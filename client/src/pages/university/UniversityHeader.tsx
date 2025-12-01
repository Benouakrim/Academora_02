import { ExternalLink, Heart, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { UniversityDetail } from '@/hooks/useUniversityDetail'

type UniversityHeaderProps = {
  university: UniversityDetail
}

export default function UniversityHeader({ university }: UniversityHeaderProps) {
  const location = [university.city, university.state, university.country].filter(Boolean).join(', ')

  return (
    <div className="relative overflow-hidden">
      {/* Hero Image with Gradient Overlay */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary/20 to-secondary/20">
        {university.logoUrl && (
          <div className="absolute inset-0 opacity-10">
            <img
              src={university.logoUrl}
              alt={university.name}
              className="w-full h-full object-cover blur-sm"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-6">
          {/* Logo */}
          {university.logoUrl && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-background border-4 border-background shadow-lg overflow-hidden flex-shrink-0">
              <img
                src={university.logoUrl}
                alt={`${university.name} logo`}
                className="w-full h-full object-contain p-2"
              />
            </div>
          )}

          {/* Title and Actions */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{university.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </Badge>
              {university.ranking && (
                <Badge variant="secondary">Ranked #{university.ranking}</Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 self-start sm:self-end">
            <Button variant="outline" size="icon" aria-label="Save to list">
              <Heart className="h-4 w-4" />
            </Button>
            {university.websiteUrl && (
              <a href={university.websiteUrl} target="_blank" rel="noopener noreferrer">
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { MapPin, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { University } from '@/hooks/useUniversitySearch'

type UniversityCardProps = {
  university: University
}

export default function UniversityCard({ university }: UniversityCardProps) {
  const tuition = university.tuitionOutState || university.tuitionInState
  const location = [university.city, university.state, university.country].filter(Boolean).join(', ')

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative">
        {university.logoUrl ? (
          <img src={university.logoUrl} alt={university.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
          aria-label="Save university"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{university.name}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          {tuition !== null && tuition !== undefined ? (
            <Badge variant="secondary">${(tuition / 1000).toFixed(0)}k/yr</Badge>
          ) : (
            <Badge variant="outline">N/A</Badge>
          )}
          <Link to={`/university/${university.slug}`}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

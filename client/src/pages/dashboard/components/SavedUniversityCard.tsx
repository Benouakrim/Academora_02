import { Link } from 'react-router-dom'
import { Trash2, Pencil, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SavedUniversity } from '@/hooks/useSavedUniversities'

type Props = {
  data: SavedUniversity
  onRemove: (universityId: string) => void
  onEditNote: (universityId: string, currentNote: string | null) => void
}

export default function SavedUniversityCard({ data, onRemove, onEditNote }: Props) {
  const u = data.university
  const location = [u.city, u.state, u.country].filter(Boolean).join(', ')

  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        <div className="md:w-48 w-full h-32 md:h-auto bg-muted flex items-center justify-center overflow-hidden">
          {u.logoUrl ? (
            <img src={u.logoUrl} alt={u.name} className="w-full h-full object-contain p-2" />
          ) : (
            <span className="text-xs text-muted-foreground">No Image</span>
          )}
        </div>
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg truncate">{u.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{location}</span>
              </div>
              {data.notes && (
                <p className="mt-2 italic text-sm text-muted-foreground line-clamp-2">“{data.notes}”</p>
              )}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Link to={`/university/${u.slug}`}>
                <Button size="sm" variant="outline">View Profile</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => onEditNote(u.id, data.notes)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onRemove(u.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

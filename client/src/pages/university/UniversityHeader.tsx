import { ExternalLink, MapPin, Trophy, Building2, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSavedUniversities } from '@/hooks/useSavedUniversities'
import { useAuth } from '@clerk/clerk-react'
import type { UniversityDetail } from '@/hooks/useUniversityDetail'

export default function UniversityHeader({ university }: { university: UniversityDetail }) {
  const location = [university.city, university.state, university.country].filter(Boolean).join(', ')
  const { isSignedIn } = useAuth()
  const qc = useQueryClient()
  const { data: savedUniversities = [] } = useSavedUniversities()
  const isSaved = savedUniversities.some(s => s.university.id === university.id)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveUniversity = async () => {
    try {
      setIsSaving(true)
      await api.post(`/user/saved/${university.id}`)
      await qc.invalidateQueries({ queryKey: ['saved-universities'] })
      toast.success(isSaved ? 'Removed from saved universities' : 'Added to saved universities')
    } catch (error) {
      toast.error('Failed to save university')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img
          src={university.heroImageUrl || '/placeholder-campus.jpg'}
          alt={university.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row items-end gap-6">
            {/* Logo Card */}
            <div className="h-32 w-32 rounded-xl bg-white shadow-xl p-4 flex items-center justify-center -mb-4 md:mb-0 relative z-10">
              {university.logoUrl ? (
                <img src={university.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            {/* Text Info */}
            <div className="flex-1 text-white mb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {university.ranking && (
                  <Badge variant="secondary" className="bg-amber-400 text-black hover:bg-amber-500">
                    <Trophy className="h-3 w-3 mr-1" /> #{university.ranking} National
                  </Badge>
                )}
                {university.type && <Badge variant="outline" className="border-white/40 text-white bg-black/20">{university.type}</Badge>}
                {university.setting && <Badge variant="outline" className="border-white/40 text-white bg-black/20">{university.setting}</Badge>}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-shadow-sm">
                {university.name}
              </h1>
              <div className="flex items-center gap-2 text-white/90 text-lg">
                <MapPin className="h-5 w-5" />
                {location}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-2">
              {university.websiteUrl && (
                <a href={university.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">
                    Visit Website <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              )}
              {isSignedIn && (
                <Button 
                  variant={isSaved ? 'default' : 'secondary'}
                  onClick={handleSaveUniversity}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

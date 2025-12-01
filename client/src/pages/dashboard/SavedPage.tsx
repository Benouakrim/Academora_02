import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSavedUniversities } from '@/hooks/useSavedUniversities'
import SavedUniversityCard from './components/SavedUniversityCard'
import EditNoteDialog from './components/EditNoteDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function SavedPage() {
  const { data: saved, isLoading, remove, updateNote } = useSavedUniversities()
  const [activeId, setActiveId] = useState<string | null>(null)

  const current = saved?.find((s) => s.university.id === activeId) || null

  const onSaveNote = async (text: string) => {
    if (!activeId) return
    await updateNote(activeId, text)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-4">Saved Universities</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : saved && saved.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {saved.map((s) => (
            <SavedUniversityCard
              key={s.id}
              data={s}
              onRemove={remove}
              onEditNote={(id) => setActiveId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">You haven't saved any universities yet.</p>
          <Link to="/search">
            <Button>Find Universities</Button>
          </Link>
        </div>
      )}

      <EditNoteDialog
        isOpen={Boolean(activeId)}
        onClose={() => setActiveId(null)}
        initialNote={current?.notes ?? ''}
        onSave={onSaveNote}
      />
    </div>
  )
}

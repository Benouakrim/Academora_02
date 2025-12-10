import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSavedUniversities } from '@/hooks/useSavedUniversities'
import SavedUniversityCard from './components/SavedUniversityCard'
import EditNoteDialog from './components/EditNoteDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Bookmark, Search, Trash2, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

type SortOption = 'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest'
type FilterOption = 'all'

export default function SavedPage() {
  const { data: saved, isLoading, remove, updateNote } = useSavedUniversities()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const current = saved?.find((s) => s.university.id === activeId) || null
  
  // Filter by search
  const searchFiltered = useMemo(() => {
    return saved?.filter(s => 
      s.university.name.toLowerCase().includes(search.toLowerCase()) || 
      s.university.city?.toLowerCase().includes(search.toLowerCase())
    ) || []
  }, [saved, search])

  // Sort filtered results
  const sortedData = useMemo(() => {
    const data = [...searchFiltered]
    
    switch (sortBy) {
      case 'name-asc':
        return data.sort((a, b) => a.university.name.localeCompare(b.university.name))
      case 'name-desc':
        return data.sort((a, b) => b.university.name.localeCompare(a.university.name))
      case 'date-newest':
        return data.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime())
      case 'date-oldest':
        return data.sort((a, b) => new Date((a as any).createdAt || 0).getTime() - new Date((b as any).createdAt || 0).getTime())
      default:
        return data
    }
  }, [searchFiltered, sortBy])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === sortedData.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sortedData.map(s => s.id)))
    }
  }, [sortedData, selectedIds.size])

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true)
      
      // Delete each selected item
      await Promise.all(
        Array.from(selectedIds).map(id => remove(id))
      )
      
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
      toast.success(`${selectedIds.size} universities removed`)
    } catch (error) {
      toast.error('Failed to remove universities')
    } finally {
      setIsDeleting(false)
    }
  }

  const onSaveNote = async (text: string) => {
    if (!activeId) return
    await updateNote(activeId, text)
  }

  const hasSelection = selectedIds.size > 0
  const isAllSelected = sortedData.length > 0 && selectedIds.size === sortedData.length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bookmark className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Saved Universities</h1>
            <p className="text-muted-foreground text-sm">{sortedData.length} universities saved</p>
          </div>
        </div>
      </div>

      {/* Search, Sort, Filter Bar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or city..." 
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="date-newest">Newest First</SelectItem>
              <SelectItem value="date-oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          {hasSelection && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 flex-1">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded cursor-pointer"
                />
                <span className="text-sm text-amber-900 dark:text-amber-100 flex-1">
                  {selectedIds.size} selected
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : sortedData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedData.map((s) => (
              <div key={s.id} className="relative">
                {/* Checkbox for bulk delete */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="h-5 w-5 rounded cursor-pointer"
                  />
                </div>
                <SavedUniversityCard
                  data={s}
                  onRemove={remove}
                  onEditNote={(id) => setActiveId(id)}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-muted/10">
          <Bookmark className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No universities found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {search ? "Try adjusting your search filter." : "Start exploring to add universities to your collection."}
          </p>
          {!search && (
            <Link to="/search">
              <Button className="bg-gradient-brand">Explore Universities</Button>
            </Link>
          )}
        </div>
      )}

      <EditNoteDialog
        isOpen={Boolean(activeId)}
        onClose={() => setActiveId(null)}
        initialNote={current?.notes ?? ''}
        onSave={onSaveNote}
      />

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} universities?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. These universities will be removed from your saved list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

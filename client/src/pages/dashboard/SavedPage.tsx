import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSavedUniversities } from '@/hooks/useSavedUniversities'
import { useSavedArticles } from '@/hooks/useSavedArticles'
import SavedUniversityCard from './components/SavedUniversityCard'
import EditNoteDialog from './components/EditNoteDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Bookmark, Search, Trash2, ChevronDown, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

type SortOption = 'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest'
type FilterOption = 'all'
type TabType = 'universities' | 'articles'

export default function SavedPage() {
  const { data: saved, isLoading, remove, updateNote } = useSavedUniversities()
  const { data: savedArticles, isLoading: isLoadingArticles, remove: removeArticle, updateNote: updateArticleNote } = useSavedArticles()
  const [activeTab, setActiveTab] = useState<TabType>('universities')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const current = saved?.find((s) => s.university.id === activeId) || null
  const currentArticle = savedArticles?.find((a) => a.article.id === activeId) || null
  
  // Filter universities by search
  const searchFilteredUnis = useMemo(() => {
    return saved?.filter(s => 
      s.university.name.toLowerCase().includes(search.toLowerCase()) || 
      s.university.city?.toLowerCase().includes(search.toLowerCase())
    ) || []
  }, [saved, search])

  // Filter articles by search
  const searchFilteredArticles = useMemo(() => {
    return savedArticles?.filter(a =>
      a.article.title.toLowerCase().includes(search.toLowerCase()) ||
      a.article.excerpt?.toLowerCase().includes(search.toLowerCase())
    ) || []
  }, [savedArticles, search])

  // Sort filtered results
  const sortedUniversities = useMemo(() => {
    const data = [...searchFilteredUnis]
    
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
  }, [searchFilteredUnis, sortBy])

  // Sort articles
  const sortedArticles = useMemo(() => {
    const data = [...searchFilteredArticles]
    
    switch (sortBy) {
      case 'name-asc':
        return data.sort((a, b) => a.article.title.localeCompare(b.article.title))
      case 'name-desc':
        return data.sort((a, b) => b.article.title.localeCompare(a.article.title))
      case 'date-newest':
        return data.sort((a, b) => new Date(b.article.createdAt || 0).getTime() - new Date(a.article.createdAt || 0).getTime())
      case 'date-oldest':
        return data.sort((a, b) => new Date(a.article.createdAt || 0).getTime() - new Date(b.article.createdAt || 0).getTime())
      default:
        return data
    }
  }, [searchFilteredArticles, sortBy])

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
    const itemsToSelect = activeTab === 'universities' ? sortedUniversities : sortedArticles
    if (selectedIds.size === itemsToSelect.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(itemsToSelect.map(s => s.id)))
    }
  }, [activeTab, sortedUniversities, sortedArticles, selectedIds.size])

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true)
      
      if (activeTab === 'universities') {
        // Delete universities
        await Promise.all(
          Array.from(selectedIds).map(id => remove(id))
        )
        toast.success(`${selectedIds.size} universities removed`)
      } else {
        // Delete articles
        await Promise.all(
          Array.from(selectedIds).map(id => removeArticle(id))
        )
        toast.success(`${selectedIds.size} articles removed`)
      }
      
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
    } catch (error) {
      toast.error('Failed to remove items')
    } finally {
      setIsDeleting(false)
    }
  }

  const onSaveNote = async (text: string) => {
    if (!activeId) return
    if (activeTab === 'universities') {
      await updateNote(activeId, text)
    } else {
      await updateArticleNote(activeId, text)
    }
  }

  const hasSelection = selectedIds.size > 0
  const itemsToCheck = activeTab === 'universities' ? sortedUniversities : sortedArticles
  const isAllSelected = itemsToCheck.length > 0 && selectedIds.size === itemsToCheck.length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as TabType)
        setSelectedIds(new Set())
        setSearch('')
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bookmark className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {activeTab === 'universities' ? 'Saved Universities' : 'Saved Articles'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {activeTab === 'universities' 
                  ? `${sortedUniversities.length} universities saved`
                  : `${sortedArticles.length} articles saved`
                }
              </p>
            </div>
          </div>
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="universities" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Universities
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-2">
              <FileText className="h-4 w-4" />
              Articles
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="universities" className="space-y-6">
          {/* Search, Sort, Filter Bar */}
          <div className="flex flex-col gap-3">
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
          ) : sortedUniversities.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedUniversities.map((s) => (
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
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          {/* Search, Sort, Filter Bar for Articles */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search articles by title..." 
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
                  <SelectItem value="name-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Title (Z-A)</SelectItem>
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

          {isLoadingArticles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : sortedArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedArticles.map((a) => (
                  <div key={a.id} className="relative">
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(a.id)}
                        onChange={() => toggleSelect(a.id)}
                        className="h-5 w-5 rounded cursor-pointer"
                      />
                    </div>
                    <Link to={`/articles/${a.article.slug}`}>
                      <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full cursor-pointer">
                        {a.article.featuredImage && (
                          <img 
                            src={a.article.featuredImage} 
                            alt={a.article.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-2 mb-2">{a.article.title}</h3>
                          {a.article.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{a.article.excerpt}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(a.article.createdAt).toLocaleDateString()}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                removeArticle(a.article.id)
                                toast.success('Article removed from saved')
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-muted/10">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No articles found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {search ? "Try adjusting your search filter." : "Start saving articles while reading to build your collection."}
              </p>
              {!search && (
                <Link to="/blog">
                  <Button className="bg-gradient-brand">Explore Articles</Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EditNoteDialog
        isOpen={Boolean(activeId)}
        onClose={() => setActiveId(null)}
        initialNote={activeTab === 'universities' ? (current?.notes ?? '') : (currentArticle?.notes ?? '')}
        onSave={onSaveNote}
        title={activeTab === 'universities' ? 'Edit University Notes' : 'Edit Article Notes'}
      />

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size} {activeTab === 'universities' ? 'universities' : 'articles'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. These items will be removed from your saved list.
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

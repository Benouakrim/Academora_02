import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Save, Eye, Image as ImageIcon, Settings, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RichTextEditor from '@/components/editor/RichTextEditor'
import ImageUpload from '@/components/common/ImageUpload'
import PerformancePanel from '@/components/editor/prediction/PerformancePanel'
import CompetitorComparisonPanel from '@/components/editor/prediction/CompetitorComparisonPanel'
import TitleSimulatorPanel from '@/components/editor/prediction/TitleSimulatorPanel'
import ROICalculatorPanel from '@/components/editor/prediction/ROICalculatorPanel'
import { useArticlePrediction } from '@/hooks/useArticlePrediction'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

type FormData = {
  title: string
  slug: string
  excerpt: string
  categoryId: string
  content: string
  status: 'DRAFT' | 'PUBLISHED' | 'PENDING' | 'REJECTED' | 'ARCHIVED'
  featuredImage: string
  metaTitle?: string
  metaDescription?: string
  focusKeyword?: string
  ogImage?: string
  canonicalUrl?: string
}

export default function ArticleEditorPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAutoSlugging, setIsAutoSlugging] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [prediction, setPrediction] = useState<any>(null)
  const predictionMutation = useArticlePrediction()

  // Fetch prediction history on load (new)
  const { data: predictionHistory = [] } = useQuery({
    queryKey: ['prediction-history', id],
    enabled: isEdit,
    queryFn: async () => {
      const res = await api.get(`/predictions/${id}/history`)
      // API returns { ok: true, data: [...] }
      return Array.isArray(res.data) ? res.data : (res.data?.data || [])
    }
  })

  // Set latest prediction from history on load
  useEffect(() => {
    if (predictionHistory && Array.isArray(predictionHistory) && predictionHistory.length > 0) {
      setPrediction(predictionHistory[predictionHistory.length - 1])
    }
  }, [predictionHistory])

  // Fetch Taxonomies
  const { data: taxonomies } = useQuery({
    queryKey: ['taxonomies'],
    queryFn: async () => {
      const res = await api.get('/articles/taxonomies')
      return res.data
    }
  })

  // Fetch Article if Editing
  const { data: article, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['article', id],
    enabled: isEdit,
    queryFn: async () => {
      // In real app, use ID lookup. Using slug/id agnostic here
      // For now assuming we might need to adjust endpoint to getById if slug isn't ID
      const res = await api.get(`/articles/${id}`) 
      return res.data
    }
  })

  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'DRAFT',
      featuredImage: '',
      categoryId: '',
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      ogImage: '',
      canonicalUrl: ''
    }
  })

  // Populate form on edit
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content,
        status: article.status,
        featuredImage: article.featuredImage || '',
        categoryId: article.categoryId || '',
        metaTitle: article.metaTitle || '',
        metaDescription: article.metaDescription || '',
        focusKeyword: article.focusKeyword || '',
        ogImage: article.ogImage || '',
        canonicalUrl: article.canonicalUrl || ''
      })
      setIsAutoSlugging(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article])

  // Auto-generate slug from title
  const titleValue = form.watch('title')
  useEffect(() => {
    if (!isEdit && isAutoSlugging) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      form.setValue('slug', slug)
    }
  }, [titleValue, isEdit, isAutoSlugging, form])

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEdit) {
        await api.put(`/articles/${id}`, data)
      } else {
        await api.post('/articles', data)
      }
    },
    onSuccess: () => {
      toast.success(`Article ${isEdit ? 'updated' : 'created'} successfully`)
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setLastSaved(new Date())
      form.reset(form.getValues()) // Mark as not dirty
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to save article')
    }
  })

  // Autosave draft every 30 seconds
  useEffect(() => {
    if (!isEdit || form.watch('status') !== 'DRAFT') return;

    const interval = setInterval(() => {
      if (form.formState.isDirty) {
        const data = form.getValues();
        mutation.mutate(data);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isEdit, form, mutation]);

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
    if (data.status === 'PUBLISHED') {
      navigate('/admin/articles')
    }
  }

  const handlePreview = () => {
    const slugToPreview = form.watch('slug') || article?.slug
    if (!slugToPreview) {
      toast.error('Please add a slug before previewing')
      return
    }
    window.open(`/blog/${slugToPreview}`, '_blank', 'noopener,noreferrer')
  }

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!form.formState.isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  if (isEdit && isLoadingArticle) return <div>Loading editor...</div>

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" onClick={handlePreview}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">{isEdit ? 'Edit Article' : 'New Article'}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{form.watch('status') === 'PUBLISHED' ? 'Live' : 'Draft'}</span>
              {lastSaved && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Saved {new Date(lastSaved).toLocaleTimeString()}
                  </div>
                </>
              )}
              {form.formState.isDirty && (
                <Badge variant="outline" className="text-xs">Unsaved changes</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => window.open(`/blog/${form.watch('slug')}`, '_blank')}>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <div className="h-6 w-px bg-border" />
          <Select 
            value={form.watch('status')} 
            onValueChange={(v) => form.setValue('status', v as FormData['status'])}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={mutation.isPending} className="bg-gradient-brand border-0">
            <Save className="w-4 h-4 mr-2" /> {mutation.isPending ? 'Saving...' : 'Save Article'}
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-3 py-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Input 
              {...form.register('title', { required: true })}
              placeholder="Article Title" 
              className="text-3xl font-bold border-none px-0 shadow-none h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50" 
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">/blog/</span>
              <Input 
                {...form.register('slug', { required: true })}
                className="h-6 py-0 px-1 font-mono text-sm bg-transparent border-transparent hover:border-border focus-visible:border-primary w-full"
                onFocus={() => setIsAutoSlugging(false)}
              />
            </div>
          </div>

          <Controller
            control={form.control}
            name="content"
            rules={{ required: true }}
            render={({ field }) => (
              <RichTextEditor 
                content={field.value || ''} 
                onChange={field.onChange} 
                placeholder="Write something amazing..."
                mode="admin"
                showStats={true}
              />
            )}
          />
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Performance Panel */}
          <PerformancePanel 
            prediction={prediction}
            predictionHistory={predictionHistory || []}
            onAnalyze={() => {
              const content = form.watch('content')
              const title = form.watch('title')
              const tags = form.watch('focusKeyword')?.split(',').map(t => t.trim()).filter(Boolean) || []
              predictionMutation.mutate({
                content: content || '',
                title,
                tags,
                category: form.watch('categoryId'),
                articleId: id
              }, {
                onSuccess: (res: any) => {
                  setPrediction(res)
                }
              })
            }}
          />

          {/* Competitor Comparison Panel */}
          {prediction && (
            <CompetitorComparisonPanel 
              prediction={prediction}
              articleKeyword={form.watch('focusKeyword') || 'your topic'}
            />
          )}

          {/* Title Simulator Panel */}
          <TitleSimulatorPanel 
            currentTitle={form.watch('title')}
            focusKeyword={form.watch('focusKeyword')}
          />

          {/* ROI Calculator Panel */}
          <ROICalculatorPanel prediction={prediction} />

          {/* Featured Image */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Featured Image
            </label>
            <Controller
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <ImageUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
          </div>

          {/* Tabs for Organize and SEO */}
          <Tabs defaultValue="organize" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="organize">Organize</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Organize Tab */}
            <TabsContent value="organize" className="space-y-4">
              <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <Controller
                    control={form.control}
                    name="categoryId"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {taxonomies?.categories.map((c: { id: string; name: string }) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Excerpt</label>
                  <Textarea 
                    {...form.register('excerpt')}
                    placeholder="Short summary for SEO and cards..."
                    className="resize-none h-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.watch('excerpt')?.length || 0} / 160 characters
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4">
              <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4" />
                  <h3 className="font-semibold text-sm">SEO Settings</h3>
                </div>

                {/* Meta Title */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Meta Title</label>
                  <Input
                    {...form.register('metaTitle')}
                    placeholder={form.watch('title')}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.watch('metaTitle')?.length || 0} / 60 characters
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Meta Description</label>
                  <Textarea
                    {...form.register('metaDescription')}
                    placeholder="Brief summary for search engines"
                    className="resize-none h-20"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.watch('metaDescription')?.length || 0} / 160 characters
                  </p>
                </div>

                {/* Focus Keyword */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Focus Keyword</label>
                  <Input
                    {...form.register('focusKeyword')}
                    placeholder="e.g., college admissions"
                  />
                  <p className="text-xs text-muted-foreground">
                    The main keyword you want to rank for in search engines.
                  </p>
                </div>

                {/* OG Image */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">OG Image URL</label>
                  <Input
                    {...form.register('ogImage')}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for social media previews. Leave blank to use featured image.
                  </p>
                </div>

                {/* Canonical URL */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Canonical URL</label>
                  <Input
                    {...form.register('canonicalUrl')}
                    placeholder="https://example.com/article-slug"
                  />
                  <p className="text-xs text-muted-foreground">
                    Specify the preferred version of the page. Leave blank for auto-generation.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </form>
    </FormProvider>
  )
}

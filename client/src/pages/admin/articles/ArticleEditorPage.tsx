import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Save, Eye, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RichTextEditor from '@/components/editor/RichTextEditor'
import ImageUpload from '@/components/common/ImageUpload'
import { api } from '@/lib/api'

type FormData = {
  title: string
  slug: string
  excerpt: string
  categoryId: string
  content: string
  status: 'DRAFT' | 'PUBLISHED'
  featuredImage: string
}

export default function ArticleEditorPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAutoSlugging, setIsAutoSlugging] = useState(true)

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
      categoryId: ''
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
        categoryId: article.categoryId || ''
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
      navigate('/admin/articles')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to save article')
    }
  })

  const onSubmit = (data: FormData) => mutation.mutate(data)

  if (isEdit && isLoadingArticle) return <div>Loading editor...</div>

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">{isEdit ? 'Edit Article' : 'New Article'}</h1>
            <span className="text-xs text-muted-foreground">{form.watch('status') === 'PUBLISHED' ? 'Live' : 'Draft'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => window.open(`/blog/${form.watch('slug')}`, '_blank')}>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <div className="h-6 w-px bg-border" />
          <Select 
            value={form.watch('status')} 
            onValueChange={(v) => form.setValue('status', v as 'DRAFT' | 'PUBLISHED')}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={mutation.isPending} className="bg-gradient-brand border-0">
            <Save className="w-4 h-4 mr-2" /> {mutation.isPending ? 'Saving...' : 'Save Article'}
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
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
              />
            )}
          />
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
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

          {/* Taxonomy */}
          <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold">Organize</h3>
            
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
                className="resize-none h-32"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

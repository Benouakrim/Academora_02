import { useState } from 'react'
import ImageUpload from '@/components/common/ImageUpload'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

export default function UserArticleEditor() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  
  // Fetch Categories for dropdown
  const { data: taxonomies } = useQuery({
    queryKey: ['taxonomies'],
    queryFn: async () => {
      const res = await api.get('/articles/taxonomies')
      return res.data
    }
  })

  // Submit Mutation (draft or pending)
  const { mutate, isPending } = useMutation({
    mutationFn: async (status: 'DRAFT' | 'PENDING') => {
      // Basic validation
      if (!title || !content || !categoryId) throw new Error('Please fill all fields')

      // Auto-generate excerpt from content (first 150 chars)
      const excerpt = content.replace(/<[^>]+>/g, '').slice(0, 150) + '...'
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

      await api.post('/articles', {
        title,
        slug: `${slug}-${Date.now()}`,
        content,
        excerpt,
        categoryId,
        featuredImage,
        status
      })
    },
    onSuccess: (_, status) => {
      toast.success(status === 'PENDING' ? 'Submitted for review' : 'Draft saved')
      navigate('/blog')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err.message || 'Failed to submit article'
      toast.error(msg)
    }
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Write an Article</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="secondary" onClick={() => mutate('DRAFT')} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={() => mutate('PENDING')} disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <ImageUpload value={featuredImage} onChange={setFeaturedImage} className="mb-6" />
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input 
                placeholder="Enter a catchy title..." 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="text-lg font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {taxonomies?.categories?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <RichTextEditor 
            content={content} 
            onChange={setContent} 
            mode="user"
            showStats={true}
          />
        </div>
      </div>
    </div>
  )
}

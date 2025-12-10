import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CheckCircle2, XCircle, Eye, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  status: string
  slug?: string
  createdAt: string
  author: {
    firstName: string | null
    lastName: string | null
    email: string
  }
  category: {
    name: string
  }
}

export default function PendingArticlesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [reviewMode, setReviewMode] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionStatus, setRejectionStatus] = useState<'REJECTED' | 'NEEDS_REVISION'>('REJECTED')

  // Fetch pending articles
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['pending-articles'],
    queryFn: async () => {
      const res = await api.get('/articles/pending/list')
      return res.data.data as Article[]
    },
  })

  // Approve article mutation
  const approveMutation = useMutation({
    mutationFn: async (articleId: string) => {
      await api.post(`/articles/${articleId}/approve`)
    },
    onSuccess: () => {
      toast.success('Article approved successfully')
      setSelectedArticle(null)
      setReviewMode(null)
      setRejectionReason('')
      queryClient.invalidateQueries({ queryKey: ['pending-articles'] })
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
    },
    onError: (error: unknown) => {
      type ApiError = { response?: { data?: { message?: string } } }
      const message = (error as ApiError)?.response?.data?.message || 'Failed to approve article'
      toast.error(message)
    },
  })

  // Reject article mutation
  const rejectMutation = useMutation({
    mutationFn: async (articleId: string) => {
      await api.post(`/articles/${articleId}/reject`, {
        reason: rejectionReason || 'No reason provided',
        rejectionStatus,
      })
    },
    onSuccess: () => {
      toast.success('Article rejected successfully')
      setSelectedArticle(null)
      setReviewMode(null)
      setRejectionReason('')
      setRejectionStatus('REJECTED')
      queryClient.invalidateQueries({ queryKey: ['pending-articles'] })
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
    },
    onError: (error: unknown) => {
      type ApiError = { response?: { data?: { message?: string } } }
      const message = (error as ApiError)?.response?.data?.message || 'Failed to reject article'
      toast.error(message)
    },
  })

  const handleApprove = (article: Article) => {
    setSelectedArticle(article)
    setReviewMode('approve')
  }

  const handleReject = (article: Article) => {
    setSelectedArticle(article)
    setReviewMode('reject')
  }

  const handleConfirmApprove = () => {
    if (!selectedArticle) return
    approveMutation.mutate(selectedArticle.id)
  }

  const handleConfirmReject = () => {
    if (!selectedArticle) return
    rejectMutation.mutate(selectedArticle.id)
  }

  const handlePreview = (articleId: string, slug?: string) => {
    window.open(`/blog/${slug || articleId}`, '_blank')
  }

  const handleEdit = (articleId: string) => {
    navigate(`/admin/articles/${articleId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/articles')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Pending Articles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve/reject user submissions
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {articles.length} Pending
        </Badge>
      </div>

      {/* Articles List */}
      {isLoading ? (
        <div className="text-center py-12">Loading pending articles...</div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No pending articles to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>
                        By {article.author.firstName} {article.author.lastName}
                      </span>
                      <span>•</span>
                      <span>{article.author.email}</span>
                      <span>•</span>
                      <Badge variant="outline">{article.category.name}</Badge>
                      <span>•</span>
                      <span>{format(new Date(article.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Excerpt */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.excerpt || article.content.substring(0, 200)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(article.id, article.slug)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(article.id)}
                  >
                    Edit
                  </Button>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(article)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(article)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      {selectedArticle && reviewMode === 'approve' && (
        <Dialog open={true} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Article</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve "{selectedArticle.title}"?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium mb-2">Article Details</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Title: {selectedArticle.title}</p>
                  <p>Author: {selectedArticle.author.firstName} {selectedArticle.author.lastName}</p>
                  <p>Category: {selectedArticle.category.name}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedArticle(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleConfirmApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      {selectedArticle && reviewMode === 'reject' && (
        <Dialog open={true} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Article</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting "{selectedArticle.title}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium mb-2">Article Details</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Title: {selectedArticle.title}</p>
                  <p>Author: {selectedArticle.author.firstName} {selectedArticle.author.lastName}</p>
                  <p>Email: {selectedArticle.author.email}</p>
                </div>
              </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Decision Type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={rejectionStatus === 'NEEDS_REVISION' ? 'secondary' : 'outline'}
                      onClick={() => setRejectionStatus('NEEDS_REVISION')}
                    >
                      Needs Revision
                    </Button>
                    <Button
                      type="button"
                      variant={rejectionStatus === 'REJECTED' ? 'secondary' : 'outline'}
                      onClick={() => setRejectionStatus('REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose "Needs Revision" for minor fixes, or "Reject" for major issues (counts toward rejection limit).
                  </p>
                </div>

              <div>
                <label className="text-sm font-medium">Rejection Reason</label>
                <Textarea
                  placeholder="Explain why this article is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This message will be sent to the author
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedArticle(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={rejectMutation.isPending || !rejectionReason}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

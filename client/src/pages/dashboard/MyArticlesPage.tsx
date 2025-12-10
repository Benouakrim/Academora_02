import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle2, Clock, XCircle, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Article {
  id: string
  title: string
  excerpt: string
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'NEEDS_REVISION'
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  rejectionReason: string | null
  rejectionCount?: number
  scheduledForDeletion?: string | null
  slug?: string
  category?: {
    name: string
  }
}

export default function MyArticlesPage() {
  const navigate = useNavigate()

  // Fetch user's articles
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['my-articles'],
    queryFn: async () => {
      const res = await api.get('/articles/mine/list')
      return (res.data.data || []) as Article[]
    },
  })

  // Group articles by status
  const draftArticles = articles.filter((a) => a.status === 'DRAFT')
  const pendingArticles = articles.filter((a) => a.status === 'PENDING')
  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED')
  const rejectedArticles = articles.filter((a) => a.status === 'REJECTED')
  const needsRevisionArticles = articles.filter((a) => a.status === 'NEEDS_REVISION')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'PUBLISHED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'NEEDS_REVISION':
        return <AlertCircle className="w-4 h-4 text-amber-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING':
        return 'bg-blue-100 text-blue-800'
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'NEEDS_REVISION':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const ArticleCard = ({ article }: { article: Article }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(article.status)}
              <CardTitle className="text-lg line-clamp-2 flex-1">
                {article.title}
              </CardTitle>
            </div>
            <Badge className={getStatusColor(article.status)}>
              {article.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="line-clamp-2 mb-2">{article.excerpt}</p>
          <div className="flex items-center gap-3 text-xs">
            {article.category && (
              <>
                <span>{article.category.name}</span>
                <span>•</span>
              </>
            )}
            <span>Updated {format(new Date(article.updatedAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Rejection Reason Alert */}
        {article.status === 'REJECTED' && article.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900 mb-1">
                  Rejection Reason
                </p>
                <p className="text-sm text-red-700">{article.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {article.status === 'NEEDS_REVISION' && article.rejectionReason && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Requested changes
                </p>
                <p className="text-sm text-amber-700">{article.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Info Messages */}
        {article.status === 'DRAFT' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              This article is a draft. Submit it for review to get it published.
            </p>
          </div>
        )}

        {article.status === 'PENDING' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              This article is under review. Our team will approve or reject it soon.
            </p>
          </div>
        )}

        {article.status === 'PUBLISHED' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              🎉 Congratulations! This article has been published.
            </p>
          </div>
        )}

        {article.status === 'REJECTED' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800 mb-2">
              You can edit and resubmit this article for another review.
            </p>
          </div>
        )}

        {article.status === 'NEEDS_REVISION' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800 mb-2">
              Minor revisions requested. Update the article and resubmit for review.
            </p>
          </div>
        )}

        {(article.rejectionCount ?? 0) >= 3 && article.scheduledForDeletion && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <p className="text-sm text-destructive mb-2">
              This article reached the rejection limit and is scheduled for deletion on{' '}
              {new Date(article.scheduledForDeletion).toLocaleString()}.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => navigate(`/articles/${article.id}`)}
            className="flex-1"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {(article.status === 'DRAFT' || article.status === 'REJECTED' || article.status === 'NEEDS_REVISION') && (
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                if ((article.rejectionCount ?? 0) >= 3) {
                  toast.error('This article reached the rejection limit and cannot be resubmitted')
                  return
                }
                navigate(`/articles/${article.id}`)
                toast.info('Submit for review from the editor')
              }}
              className="flex-1"
            >
              Submit for Review
            </Button>
          )}
          {article.status === 'PUBLISHED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/blog/${article.slug || article.id}`, '_blank')}
              className="flex-1"
            >
              View Published
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return <div className="text-center py-12">Loading your articles...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Articles</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track the status of all your articles
        </p>
      </div>

      {/* Stats Cards */}
      {articles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{draftArticles.length}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{pendingArticles.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{publishedArticles.length}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{needsRevisionArticles.length}</p>
                <p className="text-xs text-muted-foreground">Needs Revision</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{rejectedArticles.length}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      {articles.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">
              All ({articles.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft ({draftArticles.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingArticles.length})
            </TabsTrigger>
            <TabsTrigger value="published">
              Published ({publishedArticles.length})
            </TabsTrigger>
            <TabsTrigger value="revision">
              Needs Revision ({needsRevisionArticles.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedArticles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {articles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No articles yet</p>
                  <Button onClick={() => navigate('/articles/new')}>
                    Write Your First Article
                  </Button>
                </CardContent>
              </Card>
            ) : (
              articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4 mt-6">
            {draftArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No draft articles</p>
                </CardContent>
              </Card>
            ) : (
              draftArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No articles under review
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </TabsContent>

          <TabsContent value="published" className="space-y-4 mt-6">
            {publishedArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No published articles yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              publishedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </TabsContent>

          <TabsContent value="revision" className="space-y-4 mt-6">
            {needsRevisionArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No articles need revision
                  </p>
                </CardContent>
              </Card>
            ) : (
              needsRevisionArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No rejected articles
                  </p>
                </CardContent>
              </Card>
            ) : (
              rejectedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't written any articles yet</p>
            <Button onClick={() => navigate('/articles/new')} size="lg">
              Write Your First Article
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


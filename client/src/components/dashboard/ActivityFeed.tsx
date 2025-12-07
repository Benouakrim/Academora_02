import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { FileText, Star as StarIcon, Bookmark, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type DashboardData = {
  recent: {
    saved: Array<{ id: string; university: { id: string; name: string; slug: string; logoUrl?: string | null } }>
    reviews: Array<{ id: string; university: { name: string }; rating: number; createdAt: string }>
    articles: Array<{ id: string; title: string; slug: string; status: string; createdAt: string }>
  }
  stats: {
    savedCount: number
    reviewCount: number
    articleCount: number
  }
}

export default function ActivityFeed({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saved Universities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saved Universities</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.savedCount}</div>
            <div className="mt-4 space-y-3">
              {data.recent.saved.map((item) => (
                <Link key={item.id} to={`/university/${item.university.slug}`} className="flex items-center gap-3 group">
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                    {item.university.logoUrl ? (
                      <img src={item.university.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs">U</span>
                    )}
                  </div>
                  <span className="text-sm font-medium group-hover:text-primary truncate">
                    {item.university.name}
                  </span>
                </Link>
              ))}
              {data.recent.saved.length === 0 && <p className="text-xs text-muted-foreground">No saved universities yet.</p>}
            </div>
            <Link to="/dashboard/saved">
              <Button variant="link" className="px-0 mt-2 h-auto text-xs">View All <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Reviews</CardTitle>
            <StarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.reviewCount}</div>
            <div className="mt-4 space-y-3">
              {data.recent.reviews.map((review) => (
                <div key={review.id} className="flex flex-col gap-1">
                  <span className="text-sm font-medium truncate">{review.university.name}</span>
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(review.createdAt), 'MMM d')}</span>
                  </div>
                </div>
              ))}
              {data.recent.reviews.length === 0 && <p className="text-xs text-muted-foreground">No reviews written yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.articleCount}</div>
            <div className="mt-4 space-y-3">
              {data.recent.articles.map((article) => (
                <Link key={article.id} to={`/blog/${article.slug}`} className="block group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate group-hover:text-primary max-w-[70%]">
                      {article.title}
                    </span>
                    <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[10px] px-1 py-0 h-5">
                      {article.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(article.createdAt), 'MMM d, yyyy')}
                  </p>
                </Link>
              ))})
              {data.recent.articles.length === 0 && <p className="text-xs text-muted-foreground">No articles published yet.</p>}
            </div>
            <Link to="/articles/new">
              <Button variant="link" className="px-0 mt-2 h-auto text-xs">Write New Article <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

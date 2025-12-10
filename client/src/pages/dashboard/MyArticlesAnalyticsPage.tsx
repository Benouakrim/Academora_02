import { useState } from 'react';
import { TrendingUp, Eye, Heart, MessageSquare, Share2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useMyAnalyticsOverview,
  useMyArticlesAnalytics,
  useMyViewsTrend,
  useMyBestArticle,
  useMyAudienceInsights,
  type DateRange,
} from '@/hooks/useUserAnalytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

const dateRangePresets = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
};

function getDateRange(preset: keyof typeof dateRangePresets): DateRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRangePresets[preset].days);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change !== undefined && (
          <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function MyArticlesAnalyticsPage() {
  const [datePreset, setDatePreset] = useState<keyof typeof dateRangePresets>('30d');
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'engagement' | 'date'>('views');
  const [page, setPage] = useState(1);

  const dateRange = getDateRange(datePreset);
  const { data: overview, isLoading: isOverviewLoading } = useMyAnalyticsOverview(dateRange);
  const { data: articlesData, isLoading: isArticlesLoading } = useMyArticlesAnalytics(
    dateRange,
    page,
    10,
    sortBy
  );
  const { data: trendData, isLoading: isTrendLoading } = useMyViewsTrend(dateRange);
  const { data: bestArticle, isLoading: isBestLoading } = useMyBestArticle();
  const { data: audienceData, isLoading: isAudienceLoading } = useMyAudienceInsights(dateRange);

  const articles = articlesData?.data || [];
  const meta = articlesData?.meta;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Article Analytics</h1>
          <p className="text-muted-foreground">
            Track the performance of your published articles
          </p>
        </div>
        <Select value={datePreset} onValueChange={(v) => setDatePreset(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(dateRangePresets).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Views"
          value={overview?.totalViews || 0}
          change={overview?.viewsChange}
          icon={Eye}
          loading={isOverviewLoading}
        />
        <MetricCard
          title="Total Likes"
          value={overview?.totalLikes || 0}
          change={overview?.likesChange}
          icon={Heart}
          loading={isOverviewLoading}
        />
        <MetricCard
          title="Comments"
          value={overview?.totalComments || 0}
          icon={MessageSquare}
          loading={isOverviewLoading}
        />
        <MetricCard
          title="Shares"
          value={overview?.totalShares || 0}
          icon={Share2}
          loading={isOverviewLoading}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${(overview?.avgEngagementRate || 0).toFixed(2)}%`}
          icon={BarChart3}
          loading={isOverviewLoading}
        />
      </div>

      {/* Articles Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.publishedArticles || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overview?.draftArticles || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overview?.pendingArticles || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalArticles || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Views Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Views Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isTrendLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : trendData && trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Views']}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Best Article */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Best Performing Article</CardTitle>
          </CardHeader>
          <CardContent>
            {isBestLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : bestArticle ? (
              <div className="space-y-3">
                <a
                  href={`/blog/${bestArticle.slug}`}
                  className="font-medium text-sm hover:underline line-clamp-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bestArticle.title}
                </a>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-bold">{bestArticle.viewCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Likes</span>
                    <span className="font-bold">{bestArticle.likeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comments</span>
                    <span className="font-bold">{bestArticle._count.comments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engagement</span>
                    <span className="font-bold text-green-600">
                      {bestArticle.engagement.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No published articles yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Articles</CardTitle>
              <CardDescription>Detailed performance metrics for each article</CardDescription>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="date">Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isArticlesLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : articles.length > 0 ? (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Likes</TableHead>
                    <TableHead className="text-right">Comments</TableHead>
                    <TableHead className="text-right">Engagement</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <a
                          href={`/blog/${article.slug}`}
                          className="font-medium hover:underline max-w-[300px] line-clamp-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {article.title}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        {article.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{article.likes}</TableCell>
                      <TableCell className="text-right">{article.comments}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={article.engagement > 5 ? 'text-green-600' : 'text-orange-600'}
                        >
                          {article.engagement.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            article.status === 'PUBLISHED'
                              ? 'default'
                              : article.status === 'DRAFT'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {article.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="text-sm px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                      disabled={page === meta.totalPages}
                      className="text-sm px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No articles to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audience Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isAudienceLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : audienceData?.devices ? (
              <div className="space-y-2">
                {audienceData.devices.map((device) => (
                  <div key={device.device} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground capitalize">
                      {device.device}
                    </span>
                    <span className="text-sm font-medium">
                      {device.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {isAudienceLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : audienceData?.countries ? (
              <div className="space-y-2">
                {audienceData.countries.slice(0, 5).map((country) => (
                  <div key={country.country} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{country.country}</span>
                    <span className="text-sm font-medium">{country.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {isAudienceLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : audienceData?.referrers ? (
              <div className="space-y-2">
                {audienceData.referrers.map((referrer) => (
                  <div key={referrer.source} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{referrer.source}</span>
                    <span className="text-sm font-medium">{referrer.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

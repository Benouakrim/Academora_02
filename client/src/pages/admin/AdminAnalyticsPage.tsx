import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  FileText, 
  Building2, 
  FolderKanban,
  Monitor,
  Smartphone,
  Tablet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Search,
  Globe,
  MousePointerClick
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useAdminAnalyticsDashboard, 
  usePageViewsTimeSeries,
  useEngagementSummary,
  useSearchAnalytics,
  type DateRange 
} from '@/hooks/useAdminAnalytics';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Date range presets
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

// Stat card component
function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  loading 
}: { 
  title: string; 
  value: number | string; 
  change?: number; 
  icon: React.ElementType; 
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16 mt-1" />
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
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {change !== undefined && (
          <p className={`text-xs flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Device breakdown chart
function DeviceBreakdownChart({ data, loading }: { data?: { mobile: { count: number; percentage: number }; desktop: { count: number; percentage: number }; tablet: { count: number; percentage: number } }; loading?: boolean }) {
  if (loading || !data) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  const chartData = [
    { name: 'Desktop', value: data.desktop.count, percentage: data.desktop.percentage },
    { name: 'Mobile', value: data.mobile.count, percentage: data.mobile.percentage },
    { name: 'Tablet', value: data.tablet.count, percentage: data.tablet.percentage },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
  const ICONS = [Monitor, Smartphone, Tablet];

  return (
    <div className="flex items-center gap-8">
      <ResponsiveContainer width="50%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-3">
        {chartData.map((item, index) => {
          const IconComponent = ICONS[index];
          return (
            <div key={item.name} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index] }} 
              />
              <IconComponent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-sm text-muted-foreground">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Top performers list
function TopPerformersList({ 
  title, 
  items, 
  loading, 
  type 
}: { 
  title: string; 
  items?: Array<{ id: string; name: string; slug?: string; views: number; engagement?: number }>;
  loading?: boolean;
  type: 'article' | 'university' | 'group';
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  const getLink = (slug?: string) => {
    if (!slug) return '#';
    switch (type) {
      case 'article': return `/blog/${slug}`;
      case 'university': return `/university/${slug}`;
      case 'group': return `/groups/${slug}`;
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-6">
              #{index + 1}
            </span>
            <a 
              href={getLink(item.slug)} 
              className="text-sm font-medium hover:underline line-clamp-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.name}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {item.views.toLocaleString()} views
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// Page views chart
function PageViewsChart({ data, loading }: { data?: Array<{ date: string; value: number }>; loading?: boolean }) {
  if (loading || !data) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }} 
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          formatter={(value: number) => [value.toLocaleString(), 'Page Views']}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Realtime card
function RealtimeCard({ data, loading }: { data?: { activeUsers: number; pageViewsLast30Min: number; topActivePages: Array<{ page: string; count: number }> }; loading?: boolean }) {
  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Real-time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{data.activeUsers}</div>
        <p className="text-xs text-muted-foreground">active users now</p>
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">
            {data.pageViewsLast30Min} page views in last 30 min
          </p>
          {data.topActivePages.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Top pages:</p>
              {data.topActivePages.slice(0, 3).map((page) => (
                <div key={page.page} className="text-xs text-muted-foreground flex justify-between">
                  <span className="capitalize">{page.page}</span>
                  <span>{page.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminAnalyticsPage() {
  const [datePreset, setDatePreset] = useState<keyof typeof dateRangePresets>('30d');
  const dateRange = getDateRange(datePreset);

  const { data: dashboardData, isLoading: isDashboardLoading } = useAdminAnalyticsDashboard(dateRange);
  const { data: pageViewsData, isLoading: isPageViewsLoading } = usePageViewsTimeSeries(dateRange);
  const { data: engagementData, isLoading: isEngagementLoading } = useEngagementSummary(dateRange);
  const { data: searchData, isLoading: isSearchLoading } = useSearchAnalytics(dateRange);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your platform's performance
          </p>
        </div>
        <Select value={datePreset} onValueChange={(v) => setDatePreset(v as keyof typeof dateRangePresets)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(dateRangePresets).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Page Views"
          value={dashboardData?.overview.totalPageViews || 0}
          change={dashboardData?.overview.pageViewsChange}
          icon={Eye}
          loading={isDashboardLoading}
        />
        <StatCard
          title="Unique Visitors"
          value={dashboardData?.overview.uniqueVisitors || 0}
          change={dashboardData?.overview.visitorsChange}
          icon={Users}
          loading={isDashboardLoading}
        />
        <StatCard
          title="Avg. Session Duration"
          value={`${Math.round(dashboardData?.overview.avgSessionDuration || 0)}s`}
          icon={Clock}
          loading={isDashboardLoading}
        />
        <StatCard
          title="Total Users"
          value={dashboardData?.contentStats.totalUsers || 0}
          icon={Users}
          loading={isDashboardLoading}
        />
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Published Articles"
          value={dashboardData?.contentStats.publishedArticles || 0}
          icon={FileText}
          loading={isDashboardLoading}
        />
        <StatCard
          title="Pending Articles"
          value={dashboardData?.contentStats.pendingArticles || 0}
          icon={FileText}
          loading={isDashboardLoading}
        />
        <StatCard
          title="Universities"
          value={dashboardData?.contentStats.totalUniversities || 0}
          icon={Building2}
          loading={isDashboardLoading}
        />
        <StatCard
          title="Groups"
          value={dashboardData?.contentStats.totalGroups || 0}
          icon={FolderKanban}
          loading={isDashboardLoading}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Page Views Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Page Views Over Time
            </CardTitle>
            <CardDescription>
              Daily page views for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageViewsChart data={pageViewsData} loading={isPageViewsLoading} />
          </CardContent>
        </Card>

        {/* Realtime + Device Breakdown */}
        <div className="space-y-6">
          <RealtimeCard data={dashboardData?.realtimeData} loading={isDashboardLoading} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <DeviceBreakdownChart data={dashboardData?.deviceBreakdown} loading={isDashboardLoading} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Performers */}
      <Tabs defaultValue="articles">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Top Performers</h2>
          <TabsList>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="universities">Universities</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
        </div>

        <Card>
          <CardContent className="pt-6">
            <TabsContent value="articles" className="m-0">
              <TopPerformersList
                title="Top Articles"
                items={dashboardData?.topPerformers.articles}
                loading={isDashboardLoading}
                type="article"
              />
            </TabsContent>
            <TabsContent value="universities" className="m-0">
              <TopPerformersList
                title="Top Universities"
                items={dashboardData?.topPerformers.universities}
                loading={isDashboardLoading}
                type="university"
              />
            </TabsContent>
            <TabsContent value="groups" className="m-0">
              <TopPerformersList
                title="Top Groups"
                items={dashboardData?.topPerformers.groups}
                loading={isDashboardLoading}
                type="group"
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Engagement & Search */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Engagement Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5" />
              Engagement Summary
            </CardTitle>
            <CardDescription>
              User interactions during the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEngagementLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{(engagementData?.comments || 0).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{(engagementData?.likes || 0).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{(engagementData?.saves || 0).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Saves</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{(engagementData?.reviews || 0).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Analytics
            </CardTitle>
            <CardDescription>
              Top search queries and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSearchLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Searches</span>
                  <span className="text-lg font-bold">{(searchData?.totalSearches || 0).toLocaleString()}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Top Queries</h4>
                  <div className="space-y-2">
                    {searchData?.topQueries.slice(0, 5).map((query, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground truncate max-w-[200px]">
                          "{query.query}"
                        </span>
                        <Badge variant="outline">{query.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                {searchData?.zeroResultQueries && searchData.zeroResultQueries.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-orange-600">Zero Result Queries</h4>
                    <div className="space-y-1">
                      {searchData.zeroResultQueries.slice(0, 3).map((query, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          "{query.query}" ({query.count})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

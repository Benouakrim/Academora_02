import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

type MicroContentCategory = 'application_tips' | 'deadlines' | 'fun_facts' | 'campus_life' | 'academics' | 'other';

type MicroContentItem = {
  id: string;
  category: MicroContentCategory;
  title: string;
  content: string;
  priority: number;
  createdAt: string;
  university: {
    id: string;
    name: string;
    slug: string;
  };
};

type UniversitiesResponse = {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    _count?: {
      microContent?: number;
    };
  }>;
};

export default function AdminMicroContentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: universities, isLoading: universitiesLoading } = useQuery<UniversitiesResponse>({
    queryKey: ['universities-list'],
    queryFn: async () => {
      const res = await api.get('/universities?limit=1000');
      return res.data;
    },
  });

  const { data: allMicroContent, isLoading: contentLoading } = useQuery<MicroContentItem[]>({
    queryKey: ['all-micro-content'],
    queryFn: async () => {
      // We'll need to fetch all universities' micro-content
      // For now, we'll show universities that have micro-content
      const univs = universities?.data || [];
      const promises = univs.map(async (univ) => {
        try {
          const res = await api.get(`/micro-content/university/${univ.id}`);
          return res.data.data || [];
        } catch {
          return [];
        }
      });
      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: !!universities,
  });

  const filteredContent = (allMicroContent || []).filter((item) => {
    if (!item.university) return false;
    
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.university.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUniversity =
      selectedUniversity === 'all' || item.university.id === selectedUniversity;

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesUniversity && matchesCategory;
  });

  const isLoading = universitiesLoading || contentLoading;

  const getCategoryColor = (category: MicroContentCategory) => {
    const colors = {
      application_tips: 'bg-blue-100 text-blue-800',
      deadlines: 'bg-red-100 text-red-800',
      fun_facts: 'bg-purple-100 text-purple-800',
      campus_life: 'bg-green-100 text-green-800',
      academics: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const uniqueCategories = Array.from(
    new Set(allMicroContent?.map((item) => item.category) || [])
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Micro-Content Management</h2>
        <p className="text-gray-600 text-sm mt-1">
          View and manage all micro-content across universities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-3xl">{allMicroContent?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Universities</CardDescription>
            <CardTitle className="text-3xl">
              {new Set(allMicroContent?.map((item) => item.university?.id).filter(Boolean)).size}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Categories</CardDescription>
            <CardTitle className="text-3xl">{uniqueCategories.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Filtered Results</CardDescription>
            <CardTitle className="text-3xl">{filteredContent.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* University Filter */}
            <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
              <SelectTrigger>
                <SelectValue placeholder="All Universities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities?.data.map((univ) => (
                  <SelectItem key={univ.id} value={univ.id}>
                    {univ.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No micro-content found</h3>
            <p>
              {allMicroContent?.length === 0
                ? 'No micro-content has been created yet. Edit a university to add content.'
                : 'Try adjusting your filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredContent.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                      </div>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      {item.university && (
                        <Link
                          to={`/admin/universities/${item.university.id}`}
                          className="flex items-center gap-2 hover:text-primary-600 transition-colors"
                        >
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{item.university.name}</span>
                        </Link>
                      )}
                      {item.university && <span>•</span>}
                      <span>Priority: {item.priority}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Managing Micro-Content</h4>
          <p className="text-sm text-blue-800">
            To add, edit, or delete micro-content for a specific university, go to the{' '}
            <Link to="/admin/universities" className="underline font-medium">
              Universities page
            </Link>{' '}
            and select the university you want to manage. This page provides an overview of all micro-content across the platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

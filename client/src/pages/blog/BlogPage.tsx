import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { api } from '@/lib/api';
import ArticleCard from '@/components/blog/ArticleCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const categoryParam = searchParams.get('category');

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/articles/categories');
      return res.data as { id: string; name: string; slug: string; _count: { articles: number } }[];
    }
  });

  // Fetch Articles
  const { data, isLoading } = useQuery({
    queryKey: ['articles', debouncedSearch, categoryParam],
    queryFn: async () => {
      const params: Record<string, any> = { page: 1, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryParam) params.category = categoryParam;
      const res = await api.get('/articles', { params });
      return res.data as { data: any[]; meta: any };
    }
  });

  const handleCategoryClick = (slug: string | null) => {
    setSearchParams(prev => {
      if (slug) prev.set('category', slug); else prev.delete('category');
      return prev;
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSearchParams(prev => {
      if (e.target.value) prev.set('q', e.target.value); else prev.delete('q');
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <SEO title="AcademOra Blog" description="Expert advice, university guides, and student stories." />
      {/* Header */}
      <div className="bg-background border-b py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">AcademOra Insights</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Expert advice, university guides, and student stories to help you navigate your academic journey.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <Button
            variant={!categoryParam ? 'default' : 'outline'}
            onClick={() => handleCategoryClick(null)}
            size="sm"
            className="rounded-full"
          >
            All Posts
          </Button>
          {categories?.map(cat => (
            <Button
              key={cat.id}
              variant={categoryParam === cat.slug ? 'default' : 'outline'}
              onClick={() => handleCategoryClick(cat.slug)}
              size="sm"
              className="rounded-full"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] rounded-xl border bg-card p-4 space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {data?.data.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No articles found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.data.map((article: any) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

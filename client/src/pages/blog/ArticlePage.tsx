import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import CommentSection from '@/components/blog/CommentSection';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const res = await api.get(`/articles/${slug}`);
      return res.data as any;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
        <Link to="/blog"><Button>Return to Blog</Button></Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${article.title} - AcademOra`}
        description={article.excerpt || ''}
        image={article.featuredImage || undefined}
      />
      <article className="min-h-screen pb-20">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
            <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
            </Link>

            <div className="flex gap-2 mb-4">
              {article.category && <Badge>{article.category.name}</Badge>}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={article.author.avatarUrl || undefined} />
                  <AvatarFallback>{(article.author.firstName?.[0] || 'A') + (article.author.lastName?.[0] || '')}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">
                  {article.author.firstName} {article.author.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {article.publishedAt ? format(new Date(article.publishedAt), 'MMMM d, yyyy') : 'Draft'}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-4 py-12">
          {article.featuredImage && (
            <div className="mb-10 rounded-xl overflow-hidden shadow-sm border">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-auto object-cover max-h-[500px]"
                loading="lazy"
              />
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
        <CommentSection articleId={article.id} />
      </article>
    </>
  );
}

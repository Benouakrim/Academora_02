import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, Eye, Share2, Bookmark, Edit, Trash2, Heart, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import CommentSection from '@/components/blog/CommentSection';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import { marked } from 'marked';
import { hydrateInteractiveBlocks } from '@/cms';

marked.setOptions({ gfm: true, breaks: true });
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Analytics tracking
  const { trackPageView, trackEvent } = useAnalyticsTracking();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const res = await api.get(`/articles/${slug}`);
      return res.data as any;
    },
    enabled: !!slug
  });

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin' || 
                  user?.primaryEmailAddress?.emailAddress === 'admin@academora.com';

  // Track article view
  useEffect(() => {
    if (article?.id && slug) {
      trackPageView({
        entityType: 'article',
        entityId: article.id,
        title: article.title,
        metadata: {
          slug,
          authorId: article.authorId,
          universityId: article.universityId,
          category: article.category
        }
      });
    }
  }, [article?.id, slug, trackPageView]);

  // Check if article is liked by user
  useEffect(() => {
    if (article?.id && user) {
      api.get(`/articles/${article.id}/like/status`)
        .then(res => setIsLiked(res.data.isLiked))
        .catch(() => {});
    }
  }, [article?.id, user]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await api.delete(`/articles/${article.id}/like`);
      } else {
        await api.post(`/articles/${article.id}/like`);
      }
    },
    onSuccess: () => {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      queryClient.invalidateQueries({ queryKey: ['article', slug] });
      toast.success(newLikedState ? 'Article liked!' : 'Article unliked');
      
      // Track engagement event
      trackEvent({
        eventType: 'like',
        entityType: 'article',
        entityId: article.id,
        metadata: { liked: newLikedState }
      });
    },
    onError: () => {
      toast.error('Failed to update like');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/articles/${article.id}`);
    },
    onSuccess: () => {
      toast.success('Article deleted successfully');
      navigate('/blog');
    },
    onError: () => {
      toast.error('Failed to delete article');
    }
  });

  const handleShare = async () => {
    // Track share event
    trackEvent({
      eventType: 'share',
      entityType: 'article',
      entityId: article.id,
      metadata: { url: window.location.href }
    });
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const estimateReadTime = (html: string) => {
    const words = html.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  // Prepare hooks before any conditional returns
  const readTime = article && article.content ? estimateReadTime(article.content) : 0;
  const renderedContent = useMemo(() => {
    if (!article || !article.content) return '';
    const raw = article.content || '';
    const looksLikeHtml = /<\w+[^>]*>/i.test(raw.trim());
    return looksLikeHtml ? raw : marked.parse(raw, { breaks: true });
  }, [article]);

  // Hydrate interactive CMS blocks (quiz, checklist, etc.) once content is rendered
  useEffect(() => {
    if (!renderedContent || !contentRef.current) return;
    // Run after paint to ensure DOM nodes exist
    const id = window.setTimeout(() => {
      try {
        hydrateInteractiveBlocks(contentRef.current as HTMLElement);
      } catch (err) {
        console.warn('Hydration of interactive blocks failed', err);
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [renderedContent]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Article Not Found</h2>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
        </div>
        <Link to="/blog">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={article.metaTitle || `${article.title} - AcademOra`}
        description={article.metaDescription || article.excerpt || ''}
        image={article.ogImage || article.featuredImage || undefined}
      />
      <article className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Admin Controls Bar */}
        {isAdmin && (
          <div className="bg-primary/10 border-b border-primary/20 backdrop-blur-sm sticky top-0 z-30">
            <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Admin Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="gap-2"
                  onClick={() => navigate(`/admin/articles/${article.id}`)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Article
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-2"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {article.featuredImage && (
            <div className="absolute inset-0 z-0">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover blur-sm opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95" />
            </div>
          )}
          
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 md:py-16">
            <Link to="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Articles
            </Link>

            <div className="space-y-6">
              {article.category && (
                <div className="flex gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                    {article.category.name}
                  </Badge>
                </div>
              )}

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight max-w-3xl">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground border-t border-border/40">
                {article.author && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={article.author.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {(article.author.firstName?.[0] || 'A') + (article.author.lastName?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground text-sm">
                        {article.author.firstName} {article.author.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">Author</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, yyyy') : 'Draft'}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {readTime} min read
                </div>

                {article.likeCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4" />
                    {article.likeCount} {article.likeCount === 1 ? 'like' : 'likes'}
                  </div>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeMutation.mutate()}
                      disabled={likeMutation.isPending}
                      className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSaved(!isSaved)}
                    className="gap-2"
                  >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 py-16">
          {article.featuredImage && (
            <div className="mb-16 rounded-2xl overflow-hidden shadow-lg border border-border/20 bg-muted/30">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-auto object-cover max-h-[600px]"
                loading="lazy"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Article Content */}
            <div className="lg:col-span-3">
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:text-foreground prose-headings:font-bold prose-headings:scroll-mt-20
                  prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-8
                  prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-7
                  prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-6
                  prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-5
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-em:text-foreground prose-em:italic
                  prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-primary prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:my-6
                  prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-md prose-img:my-6
                  prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4
                  prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4
                  prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:mb-2
                  prose-hr:border-border/40 prose-hr:my-8
                  prose-table:border-collapse prose-table:w-full prose-table:my-6
                  prose-thead:bg-muted
                  prose-th:border prose-th:border-border prose-th:p-3 prose-th:text-left prose-th:font-semibold
                  prose-td:border prose-td:border-border prose-td:p-3
                  prose-tr:border-b prose-tr:border-border
                "
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Quick Stats */}
                <div className="bg-muted/40 rounded-xl p-4 border border-border/20 backdrop-blur-sm">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Views
                      </div>
                      <span className="font-semibold text-foreground">{article.viewCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Likes
                      </div>
                      <span className="font-semibold text-foreground">{article.likeCount || 0}</span>
                    </div>
                    {article._count?.comments !== undefined && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Comments
                        </div>
                        <span className="font-semibold text-foreground">{article._count.comments}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-primary/5 rounded-xl p-4 border border-border/20 backdrop-blur-sm space-y-2">
                  {user && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`w-full gap-2 justify-center ${isLiked ? 'border-red-500 text-red-500' : ''}`}
                      onClick={() => likeMutation.mutate()}
                      disabled={likeMutation.isPending}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like Article'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="w-full gap-2 justify-center" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    Share Article
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-2 justify-center" onClick={() => setIsSaved(!isSaved)}>
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-border/40">
          <div className="mx-auto max-w-4xl px-4 py-16">
            <CommentSection articleId={article.id} />
          </div>
        </div>
      </article>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article
              "{article.title}" and remove all associated data including comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Article'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

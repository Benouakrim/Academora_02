import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type ArticleProps = {
  article: {
    slug: string;
    title: string;
    excerpt: string | null;
    featuredImage: string | null;
    publishedAt: string | null;
    category: { name: string } | null;
    author: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    };
  };
};

export default function ArticleCard({ article }: ArticleProps) {
  const authorName = [article.author.firstName, article.author.lastName].filter(Boolean).join(' ') || 'Unknown';
  const date = article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, yyyy') : 'Draft';

  return (
    <Link to={`/blog/${article.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/50 bg-card transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
          )}
        </div>
        <CardHeader className="p-5 pb-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            {article.category && (
              <Badge variant="secondary" className="font-normal text-xs">
                {article.category.name}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">{date}</span>
          </div>
          <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <p className="line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
        </CardContent>
        <CardFooter className="p-5 pt-0 mt-auto flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={article.author.avatarUrl || undefined} />
            <AvatarFallback>{authorName[0] || 'A'}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground/80">{authorName}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}

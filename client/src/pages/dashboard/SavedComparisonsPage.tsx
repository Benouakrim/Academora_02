import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSavedComparisons, useDeleteComparison, useCompareStore, type SavedComparison } from '@/hooks/useCompare';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { FolderOpen, Trash2, ArrowRight, Calendar, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SavedComparisonsPage() {
  const { data: comparisons, isLoading } = useSavedComparisons();
  const { mutate: deleteComparison } = useDeleteComparison();
  const navigate = useNavigate();
  const { addUniversity, clear } = useCompareStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleLoadComparison = (comparison: SavedComparison) => {
    // Clear current comparison
    clear();
    
    // Load the saved universities by their slugs
    const slugs = comparison.universities?.map(u => u.slug) || [];
    slugs.forEach((slug: string) => addUniversity(slug));
    
    // Navigate to compare page
    navigate('/compare');
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteComparison(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Saved Comparisons</h1>
            <p className="text-muted-foreground text-sm">
              Access your saved university comparisons
            </p>
          </div>
        </div>
        
        <Link to="/compare">
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            New Comparison
          </Button>
        </Link>
      </div>

      {comparisons && comparisons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparisons.map((comparison) => (
            <Card
              key={comparison.id}
              className="hover:shadow-lg transition-shadow group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 mb-2">
                      {comparison.name}
                    </CardTitle>
                    {comparison.description && (
                      <CardDescription className="line-clamp-2">
                        {comparison.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(comparison.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* University Logos */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Universities:
                  </span>
                  <Badge variant="secondary">
                    {comparison.universities?.length || 0}
                  </Badge>
                </div>

                {comparison.universities && comparison.universities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {comparison.universities.map((uni) => (
                      <div
                        key={uni.id}
                        className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-xs"
                      >
                        {uni.logoUrl && (
                          <img
                            src={uni.logoUrl}
                            alt={uni.name}
                            className="w-4 h-4 object-contain"
                          />
                        )}
                        <span className="line-clamp-1 max-w-[120px]">
                          {uni.shortName || uni.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleLoadComparison(comparison)}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Load & Compare
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(comparison.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-muted/10">
          <FolderOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Saved Comparisons</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Start comparing universities and save your comparisons to access them later.
          </p>
          <Link to="/compare">
            <Button className="bg-gradient-brand">
              <BarChart3 className="mr-2 h-4 w-4" />
              Start Comparing
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comparison?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your saved comparison.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

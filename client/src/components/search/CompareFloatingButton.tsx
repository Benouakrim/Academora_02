import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, X } from 'lucide-react';
import { useCompareStore } from '@/hooks/useCompare';

export default function CompareFloatingButton() {
  const { selectedSlugs, clear } = useCompareStore();

  if (selectedSlugs.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-border p-4 flex items-center gap-3 min-w-[280px]">
        <div className="flex items-center gap-2 flex-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Compare Selection</p>
            <p className="text-xs text-muted-foreground">
              {selectedSlugs.length} universit{selectedSlugs.length === 1 ? 'y' : 'ies'} selected
            </p>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {selectedSlugs.length}/5
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={clear}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
          <Link to="/compare">
            <Button size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Compare
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

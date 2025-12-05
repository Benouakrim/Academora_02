import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus, Check, GraduationCap, MapPin, Trophy } from 'lucide-react';
import { useCompareStore } from '@/hooks/useCompare';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface University {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  logoUrl?: string;
  ranking?: number;
  tuitionInternational?: number;
  tuitionOutState?: number;
}

interface UniversityQuickAddProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UniversityQuickAdd({ open, onOpenChange }: UniversityQuickAddProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { selectedSlugs, addUniversity } = useCompareStore();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch universities based on search
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['universities-quick-search', debouncedSearch],
    queryFn: async () => {
      const response = await api.get<{ universities: University[] }>('/universities', {
        params: {
          query: debouncedSearch || undefined,
          limit: 20,
        },
      });
      return response.data.universities;
    },
    enabled: open, // Only fetch when modal is open
  });

  const handleAdd = (slug: string, name: string) => {
    if (selectedSlugs.length >= 5) {
      toast.error('Maximum 5 universities can be compared');
      return;
    }
    
    if (selectedSlugs.includes(slug)) {
      toast.info('University already in comparison');
      return;
    }

    addUniversity(slug);
    toast.success(`Added ${name} to comparison`);
  };

  const handleClose = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add University to Compare</DialogTitle>
          <DialogDescription>
            Search and add universities to your comparison (max 5 total)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by university name, city, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : universities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {debouncedSearch ? 'No universities found' : 'Start typing to search universities'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {universities.map((uni) => {
                  const isSelected = selectedSlugs.includes(uni.slug);
                  const isMaxReached = selectedSlugs.length >= 5;

                  return (
                    <div
                      key={uni.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all",
                        isSelected && "bg-primary/5 border-primary/50",
                        !isSelected && "bg-card hover:bg-muted/50 border-border"
                      )}
                    >
                      {/* Logo */}
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg border bg-white dark:bg-neutral-900 p-2 flex items-center justify-center">
                        {uni.logoUrl ? (
                          <img 
                            src={uni.logoUrl} 
                            alt={uni.name} 
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <GraduationCap className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">{uni.name}</h4>
                          {uni.ranking && (
                            <Badge variant="secondary" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              #{uni.ranking}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{uni.city}, {uni.country}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        size="sm"
                        variant={isSelected ? "outline" : "default"}
                        onClick={() => handleAdd(uni.slug, uni.name)}
                        disabled={isSelected || isMaxReached}
                        className="flex-shrink-0"
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <span>
            {selectedSlugs.length} of 5 universities selected
          </span>
          {selectedSlugs.length >= 5 && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">
              Maximum reached
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

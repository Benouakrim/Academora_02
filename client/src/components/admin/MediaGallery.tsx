import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { mediaApi } from '@/api/mediaApi';

const ITEMS_PER_PAGE = 20;

export default function MediaGallery() {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'UPLOAD' | 'EXTERNAL'>('all');

  // Fetch all media
  const { data: allVideos = [], isLoading } = useQuery({
    queryKey: ['admin', 'videos', 'all'],
    queryFn: () => mediaApi.getAllVideos(false)
  });

  // Filter and paginate with memoization
  const { displayedItems, filteredCount, totalPages } = useMemo(() => {
    let filtered = allVideos;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(video => video.type === filterType);
    }

    const filteredCount = filtered.length;
    const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);

    // Paginate
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const displayedItems = filtered.slice(startIdx, endIdx);

    return { displayedItems, filteredCount, totalPages };
  }, [allVideos, searchQuery, filterType, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: 'all' | 'UPLOAD' | 'EXTERNAL') => {
    setFilterType(newFilter);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        {/* Search and View Mode */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('all')}
          >
            <Filter className="h-4 w-4 mr-2" />
            All
          </Button>
          <Button
            variant={filterType === 'UPLOAD' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('UPLOAD')}
          >
            <VideoIcon className="h-4 w-4 mr-2" />
            Uploaded
          </Button>
          <Button
            variant={filterType === 'EXTERNAL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('EXTERNAL')}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            External
          </Button>
        </div>

        {/* Results info */}
        <p className="text-sm text-muted-foreground">
          Showing {displayedItems.length} of {filteredCount} items
        </p>
      </div>

      {/* Gallery */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No media found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          layout
        >
          {displayedItems.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-all"
            >
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {video.type === 'UPLOAD' ? (
                    <VideoIcon className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <h3 className="text-white font-medium text-sm line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-white/80 text-xs">
                  {video.type === 'UPLOAD' ? 'Uploaded' : 'External'}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div className="space-y-2" layout>
          {displayedItems.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {video.type === 'UPLOAD' ? (
                      <VideoIcon className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {video.description}
                  </p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>
                    {video.type === 'UPLOAD' ? 'Uploaded' : 'External'}
                  </span>
                  <span>
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  {!video.isActive && <span className="text-destructive">Hidden</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <Button
                key={idx + 1}
                variant={currentPage === idx + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(idx + 1)}
                className="w-10"
              >
                {idx + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

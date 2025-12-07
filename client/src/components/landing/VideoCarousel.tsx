import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlayCircle, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import VideoPlayer from '@/components/common/VideoPlayer';
import { mediaApi, type Video } from '@/api/mediaApi';
import { toast } from 'sonner';

export default function VideoCarousel() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const allVideos = await mediaApi.getAllVideos(true); // Only active videos
        setVideos(allVideos);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        toast.error('Failed to load videos');
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentIndex];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Watch Our Demo</h2>
          <p className="text-xl text-muted-foreground">
            See AcademOra in action and discover how we help students find their perfect university
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Video Section - Left */}
          <motion.div
            key={`video-${currentIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-video rounded-lg overflow-hidden border border-border shadow-lg"
          >
            <VideoPlayer
              url={currentVideo.url}
              type={currentVideo.type}
              thumbnailUrl={currentVideo.thumbnailUrl}
              controls
              autoplay
            />
          </motion.div>

          {/* Info Card - Right */}
          <motion.div
            key={`info-${currentIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">{currentVideo.title}</h3>
              {currentVideo.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentVideo.description}
                </p>
              )}
            </div>

            {/* Video Metadata */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm">
                <PlayCircle className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  Video {currentIndex + 1} of {videos.length}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  {new Date(currentVideo.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrev}
                disabled={videos.length <= 1}
                className="flex-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleNext}
                disabled={videos.length <= 1}
                className="flex-1"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Video Thumbnails */}
            {videos.length > 1 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">More videos</p>
                <div className="grid grid-cols-3 gap-2">
                  {videos.map((video, idx) => (
                    <motion.button
                      key={video.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentIndex
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <PlayCircle className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {idx === currentIndex && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <PlayCircle className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Progress Indicator */}
        {videos.length > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {videos.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30 w-2'
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

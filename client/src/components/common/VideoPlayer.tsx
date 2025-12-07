import React from 'react';

interface VideoPlayerProps {
  url: string;
  type: 'UPLOAD' | 'EXTERNAL';
  thumbnailUrl?: string;
  className?: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
}

/**
 * Extract video ID from YouTube/Vimeo URLs
 */
const getVideoEmbedUrl = (url: string): { embedUrl: string; platform: 'youtube' | 'vimeo' | 'unknown' } => {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
        platform: 'youtube'
      };
    }
  }

  // Vimeo pattern
  const vimeoPattern = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platform: 'vimeo'
    };
  }

  return { embedUrl: url, platform: 'unknown' };
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  type,
  thumbnailUrl,
  className = '',
  autoplay = false,
  controls = true,
  muted = false
}) => {
  // For uploaded videos (Cloudinary)
  if (type === 'UPLOAD') {
    return (
      <div className={`relative w-full ${className}`}>
        <video
          src={url}
          poster={thumbnailUrl}
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
          className="w-full h-full rounded-lg"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // For external videos (YouTube/Vimeo)
  if (type === 'EXTERNAL') {
    const { embedUrl } = getVideoEmbedUrl(url);
    
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      controls: controls ? '1' : '0',
      muted: muted ? '1' : '0',
      rel: '0', // Don't show related videos (YouTube)
      modestbranding: '1' // Minimal YouTube branding
    });

    return (
      <div className={`relative w-full aspect-video ${className}`}>
        <iframe
          src={`${embedUrl}?${params.toString()}`}
          className="absolute inset-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video player"
        />
      </div>
    );
  }

  return null;
};

export default VideoPlayer;

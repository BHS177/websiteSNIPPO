
import React, { useState } from 'react';
import { VideoClip } from '@/types/video';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface VideoThumbnailProps {
  clip: VideoClip;
  aspectRatio?: 'square' | '16:9' | '4:3';
  showControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  clip,
  aspectRatio = '16:9',
  showControls = false,
  autoPlay = false,
  loop = true,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const aspectRatioClass = {
    'square': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
  }[aspectRatio];

  const togglePlay = () => {
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoElement) return;
    
    videoElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoRef = (element: HTMLVideoElement) => {
    setVideoElement(element);
    
    if (element) {
      element.addEventListener('play', () => setIsPlaying(true));
      element.addEventListener('pause', () => setIsPlaying(false));
      element.addEventListener('ended', () => {
        if (!loop) {
          setIsPlaying(false);
        }
      });
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-md ${aspectRatioClass} ${className}`}>
      {clip.type === 'video' && clip.url ? (
        <React.Fragment>
          <video
            ref={handleVideoRef}
            src={clip.startTime !== undefined && clip.endTime !== undefined 
              ? `${clip.url}#t=${clip.startTime},${clip.endTime}` 
              : clip.url}
            className="w-full h-full object-cover"
            autoPlay={autoPlay}
            loop={loop}
            muted={isMuted}
            playsInline
            crossOrigin="anonymous"
          />
          
          {showControls && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 rounded-full bg-black/60 hover:bg-black/80"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 rounded-full bg-black/60 hover:bg-black/80"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </React.Fragment>
      ) : clip.url ? (
        <img
          src={clip.url}
          alt={clip.name}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-muted">
          <span className="text-muted-foreground">{clip.name}</span>
        </div>
      )}
    </div>
  );
};

export default VideoThumbnail;

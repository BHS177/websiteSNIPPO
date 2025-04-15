
import React, { useState, useEffect, useRef } from 'react';
import { VideoClip } from '@/types/video';
import { Loader } from 'lucide-react';

interface VideoTransitionSystemProps {
  clips: VideoClip[];
  currentClipIndex: number;
  isPlaying: boolean;
  onClipEnd?: () => void;
  transitionDuration?: number;
  preloadCount?: number;
}

const VideoTransitionSystem: React.FC<VideoTransitionSystemProps> = ({
  clips,
  currentClipIndex,
  isPlaying,
  onClipEnd,
  transitionDuration = 0, // Force transition duration to 0
  preloadCount = 2
}) => {
  const [loadedVideos, setLoadedVideos] = useState<{[key: number]: boolean}>({});
  const videoRefs = useRef<{[key: number]: HTMLVideoElement | null}>({});
  const [isCurrentVideoLoaded, setIsCurrentVideoLoaded] = useState(false);
  
  // Preload videos in advance to prevent loading delays
  useEffect(() => {
    const videoElements: {[key: number]: HTMLVideoElement} = {};
    
    // Preload current and next videos
    for (let i = currentClipIndex; i < currentClipIndex + preloadCount && i < clips.length; i++) {
      if (clips[i]?.type === 'video' && clips[i]?.url && !videoElements[i]) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.src = clips[i].url;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        
        // Remove any rate adjustments that could cause stuttering
        video.playbackRate = 1.0;
        
        videoElements[i] = video;
        
        const handleVideoLoaded = () => {
          setLoadedVideos(prev => ({
            ...prev,
            [i]: true
          }));
          
          if (i === currentClipIndex) {
            setIsCurrentVideoLoaded(true);
          }
        };
        
        // Listen for both events to ensure video is fully loaded
        video.addEventListener('loadeddata', handleVideoLoaded);
        video.addEventListener('canplaythrough', handleVideoLoaded);
        
        video.addEventListener('error', (e) => {
          console.error(`Error preloading video ${i}:`, e);
          // Retry loading after error
          setTimeout(() => {
            video.load();
          }, 500);
        });
        
        // Force load
        video.load();
      }
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      Object.values(videoElements).forEach(video => {
        video.pause();
        video.removeAttribute('src');
        video.load();
      });
    };
  }, [clips, currentClipIndex, preloadCount]);
  
  // Handle current video playback
  useEffect(() => {
    const currentVideo = videoRefs.current[currentClipIndex];
    
    if (currentVideo) {
      // Reset video to beginning when needed
      if (currentVideo.readyState > 0) {
        currentVideo.currentTime = 0;
      }
      
      // Handle play/pause
      if (isPlaying) {
        // Use a timeout to ensure DOM is ready
        setTimeout(() => {
          const playPromise = currentVideo.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn("Auto-play prevented:", error);
            });
          }
        }, 50);
      } else {
        currentVideo.pause();
      }
      
      // Video ended event handler
      const handleVideoEnd = () => {
        if (onClipEnd) {
          onClipEnd();
        }
      };
      
      // Time update handler to check for end conditions
      const handleTimeUpdate = () => {
        const clipEndTime = clips[currentClipIndex]?.endTime;
        const videoDuration = currentVideo.duration;
        
        // Handle custom end time or full duration
        if (clipEndTime !== undefined) {
          // Trigger end slightly before actual end to prevent freeze frame
          if (currentVideo.currentTime >= clipEndTime - 0.05) {
            if (onClipEnd) {
              currentVideo.pause();
              onClipEnd();
            }
          }
        } else if (videoDuration) {
          // Same for full duration - trigger slightly earlier
          if (currentVideo.currentTime >= videoDuration - 0.05) {
            if (onClipEnd) {
              currentVideo.pause();
              onClipEnd();
            }
          }
        }
      };
      
      currentVideo.addEventListener('ended', handleVideoEnd);
      currentVideo.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        currentVideo.removeEventListener('ended', handleVideoEnd);
        currentVideo.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [currentClipIndex, isPlaying, onClipEnd, clips]);
  
  // Handle video reference setup
  const handleVideoRef = (element: HTMLVideoElement | null, index: number) => {
    videoRefs.current[index] = element;
    
    if (element) {
      element.playsInline = true;
      element.muted = true;
      element.preload = 'auto';
      
      // Ensure consistent playback rate
      element.playbackRate = 1.0;
      
      // Reset to beginning when possible
      if (element.readyState > 0) {
        try {
          element.currentTime = 0;
        } catch (err) {
          console.warn('Error setting video time:', err);
        }
      }
      
      // Force load
      element.load();
    }
  };
  
  const currentClip = clips[currentClipIndex];
  
  const isVideoLoaded = currentClip?.type !== 'video' || loadedVideos[currentClipIndex];
  
  if (!currentClip) {
    return <div className="w-full h-full bg-black"></div>;
  }
  
  // Avoid timestamp markers in video URLs that can cause freezes
  const getVideoSource = (clip: VideoClip) => {
    if (!clip.url) return '';
    
    // Use plain URL without timestamps to avoid browser-specific fragment handling issues
    return clip.url;
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        {currentClip.type === 'video' && currentClip.url ? (
          <video
            ref={(el) => handleVideoRef(el, currentClipIndex)}
            src={getVideoSource(currentClip)}
            className="w-full h-full object-cover"
            muted
            playsInline
            loop={false}
            crossOrigin="anonymous"
            onLoadedData={() => setIsCurrentVideoLoaded(true)}
            onError={(e) => {
              console.error("Video error:", e);
              setIsCurrentVideoLoaded(false);
            }}
          />
        ) : currentClip.url ? (
          <img
            src={currentClip.url}
            alt={currentClip.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-900">
            <span className="text-white">{currentClip.name}</span>
          </div>
        )}
      </div>
      
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
};

export default VideoTransitionSystem;

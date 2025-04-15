
import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CrividoPlayerControllerProps {
  isPlaying: boolean;
  togglePlay: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goToNextClip: () => void;
  goToPreviousClip: () => void;
  muted: boolean;
  toggleMute: () => void;
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  enterFullscreen: () => void;
}

const CrividoPlayerController: React.FC<CrividoPlayerControllerProps> = ({
  isPlaying,
  togglePlay,
  canGoNext,
  canGoPrevious,
  goToNextClip,
  goToPreviousClip,
  muted,
  toggleMute,
  duration,
  currentTime,
  onSeek,
  enterFullscreen
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [seekValue, setSeekValue] = useState(0);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update seek value when currentTime changes
  useEffect(() => {
    setSeekValue((currentTime / duration) * 100 || 0);
  }, [currentTime, duration]);
  
  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (isPlaying && !isHovering) {
      const timer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setControlsVisible(true);
    }
  }, [isPlaying, isHovering]);
  
  // Handle seeking
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSeekValue(value);
  };
  
  const handleSeekComplete = () => {
    const seekTime = (seekValue / 100) * duration;
    onSeek(seekTime);
  };
  
  return (
    <motion.div 
      className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: controlsVisible ? 1 : 0, y: controlsVisible ? 0 : 10 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        {/* Progress bar */}
        <div className="relative w-full h-1.5 bg-gray-700 rounded-full mb-3 cursor-pointer">
          <div 
            className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            style={{ width: `${seekValue}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={seekValue}
            onChange={handleSeekChange}
            onMouseUp={handleSeekComplete}
            onTouchEnd={handleSeekComplete}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/90 hover:text-white hover:bg-white/10" 
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/90 hover:text-white hover:bg-white/10"
              onClick={goToPreviousClip}
              disabled={!canGoPrevious}
            >
              <SkipBack size={18} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/90 hover:text-white hover:bg-white/10"
              onClick={goToNextClip}
              disabled={!canGoNext}
            >
              <SkipForward size={18} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/90 hover:text-white hover:bg-white/10"
              onClick={toggleMute}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            
            <span className="text-xs text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/90 hover:text-white hover:bg-white/10"
            onClick={enterFullscreen}
          >
            <Maximize size={18} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CrividoPlayerController;

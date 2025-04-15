
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, FilePlus } from "lucide-react";
import { VideoClip, ClipSegment } from '@/types/video';

interface VideoSegmenterProps {
  selectedClip: VideoClip | null;
  onCreateSegment: (segment: Partial<ClipSegment>) => void;
  onClose: () => void;
}

const VideoSegmenter: React.FC<VideoSegmenterProps> = ({
  selectedClip,
  onCreateSegment,
  onClose
}) => {
  const [startTime, setStartTime] = React.useState<number>(0);
  const [endTime, setEndTime] = React.useState<number>(0);
  const [previewTime, setPreviewTime] = React.useState<number>(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (selectedClip) {
      setStartTime(selectedClip.startTime || 0);
      setEndTime(selectedClip.endTime || (selectedClip.duration || 0));
    }
  }, [selectedClip]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setPreviewTime(videoRef.current.currentTime);
    }
  };

  const handleSetStartTime = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setStartTime(time);
      if (time >= endTime) {
        setEndTime(time + 1);
      }
    }
  };

  const handleSetEndTime = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setEndTime(time);
      if (time <= startTime) {
        setStartTime(Math.max(0, time - 1));
      }
    }
  };

  const handleCreateSegment = () => {
    if (!selectedClip) return;
    
    onCreateSegment({
      startTime,
      endTime,
      originalClipId: selectedClip.id,
      name: `${selectedClip.name} (${startTime.toFixed(1)}s-${endTime.toFixed(1)}s)`
    });
    
    onClose();
  };

  if (!selectedClip || !selectedClip.url) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Create Video Segment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-black relative rounded-md overflow-hidden">
          <video
            ref={videoRef}
            src={selectedClip.url}
            className="w-full h-full"
            controls
            onTimeUpdate={handleTimeUpdate}
            crossOrigin="anonymous"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white text-xs">
            Current: {previewTime.toFixed(2)}s | Segment: {startTime.toFixed(2)}s - {endTime.toFixed(2)}s
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            onClick={handleSetStartTime}
            className="w-full"
          >
            <Scissors className="h-4 w-4 mr-2" />
            Set Start ({startTime.toFixed(2)}s)
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSetEndTime}
            className="w-full"
          >
            <Scissors className="h-4 w-4 mr-2" />
            Set End ({endTime.toFixed(2)}s)
          </Button>
        </div>
        
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateSegment}>
            <FilePlus className="h-4 w-4 mr-2" />
            Create Segment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoSegmenter;

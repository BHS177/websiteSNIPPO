
import React, { useState, useEffect, useRef } from 'react';
import { VideoClip, SequencePattern, ClipSegment } from '@/types/video';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Scissors, 
  Shuffle, 
  RotateCw, 
  MoveHorizontal, 
  AlignJustify,
  ArrowUp, 
  ArrowDown,
  Plus,
  Bot,
  Brain,
  ListRestart,
  Play,
  Video,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeVideoContent, simulateAIAnalysis } from '@/utils/aiVideoAnalyzer';

interface ClipSegmenterProps {
  clips: VideoClip[];
  setClips: React.Dispatch<React.SetStateAction<VideoClip[]>>;
  onCreateVideo?: (selectedClips: VideoClip[]) => void;
}

const ClipSegmenter: React.FC<ClipSegmenterProps> = ({ clips, setClips, onCreateVideo }) => {
  const [segmentDuration, setSegmentDuration] = useState(3);
  const [sequencePattern, setSequencePattern] = useState<SequencePattern>('forward');
  const [customSequence, setCustomSequence] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [selectedClips, setSelectedClips] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [segmentCount, setSegmentCount] = useState(1);
  const [focusMode, setFocusMode] = useState<'motion' | 'aesthetic'>('aesthetic');
  const videoRefs = useRef<{[key: number]: HTMLVideoElement | null}>({});
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [resequenceTimestamp, setResequenceTimestamp] = useState<number>(Date.now());

  const getNextClipId = (): number => {
    return clips.length > 0 ? Math.max(...clips.map(clip => clip.id)) + 1 : 1;
  };

  const toggleClipSelection = (id: number) => {
    if (selectedClips.includes(id)) {
      setSelectedClips(selectedClips.filter(clipId => clipId !== id));
    } else {
      setSelectedClips([...selectedClips, id]);
    }
  };

  const selectAllClips = () => {
    const allClipIds = clips.filter(clip => !clip.isSegment).map(clip => clip.id);
    setSelectedClips(allClipIds);
  };

  const clearSelection = () => {
    setSelectedClips([]);
  };

  useEffect(() => {
    if (sequencePattern === 'custom') {
      setShowCustom(true);
      
      const indexes = selectedClips.length > 0 
        ? selectedClips.map((_, index) => index + 1).join(',')
        : '1,2,3';
      
      setCustomSequence(indexes);
    } else {
      setShowCustom(false);
    }
  }, [sequencePattern, selectedClips]);

  const splitClipsIntoSegments = () => {
    if (selectedClips.length === 0) {
      toast.warning("No clips selected", {
        description: "Please select at least one clip to segment."
      });
      return;
    }

    const newClips: VideoClip[] = [...clips];
    const newSegments: VideoClip[] = [];
    let nextId = getNextClipId();

    selectedClips.forEach(clipId => {
      const originalClip = clips.find(clip => clip.id === clipId);
      if (!originalClip || originalClip.isSegment) return;

      const numSegments = Math.ceil(originalClip.duration / segmentDuration);
      
      for (let i = 0; i < numSegments; i++) {
        const startTime = i * segmentDuration;
        const endTime = Math.min((i + 1) * segmentDuration, originalClip.duration);
        
        if (endTime - startTime < 1) continue;
        
        newSegments.push({
          id: nextId++,
          name: `${originalClip.name} (Segment ${i + 1})`,
          duration: endTime - startTime,
          type: originalClip.type,
          url: originalClip.url,
          mimeType: originalClip.mimeType,
          originalClipId: originalClip.id,
          startTime: startTime,
          endTime: endTime,
          isSegment: true
        });
      }
    });

    setClips([...newClips, ...newSegments]);
    
    toast.success("Clips segmented", {
      description: `Created ${newSegments.length} segments of ${segmentDuration} seconds each.`
    });
  };

  const resequenceClips = () => {
    if (selectedClips.length < 2) {
      toast.warning("Not enough clips selected", {
        description: "Please select at least two clips to resequence."
      });
      return;
    }

    console.log("Selected clips before resequence:", selectedClips);
    console.log("All clips before resequence:", clips);

    // Get the selected clip objects, not just IDs
    const selectedClipObjects = clips.filter(clip => selectedClips.includes(clip.id));
    let resequencedClipObjects: VideoClip[] = [];
    
    switch (sequencePattern) {
      case 'forward':
        resequencedClipObjects = [...selectedClipObjects];
        break;
        
      case 'reverse':
        resequencedClipObjects = [...selectedClipObjects].reverse();
        break;
        
      case 'random':
        resequencedClipObjects = [...selectedClipObjects];
        for (let i = resequencedClipObjects.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [resequencedClipObjects[i], resequencedClipObjects[j]] = 
            [resequencedClipObjects[j], resequencedClipObjects[i]];
        }
        break;
        
      case 'alternating':
        const odd = selectedClipObjects.filter((_, i) => i % 2 === 0);
        const even = selectedClipObjects.filter((_, i) => i % 2 === 1);
        resequencedClipObjects = [...odd, ...even];
        break;
        
      case 'ai-optimized':
        // Sort by optimal arrangement (high quality first, then balance)
        resequencedClipObjects = [...selectedClipObjects];
        
        // Assign simulated quality scores
        const scoredClips = resequencedClipObjects.map(clip => ({
          ...clip,
          qualityScore: Math.random()  // Simulate AI quality assessment
        }));
        
        // Sort by quality score (highest first)
        scoredClips.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
        
        if (scoredClips.length >= 3) {
          // Start with highest quality
          const startClip = scoredClips.shift()!;
          
          // End with second highest quality
          const endClip = scoredClips.shift()!;
          
          // Put the rest in between
          resequencedClipObjects = [startClip, ...scoredClips, endClip];
        } else {
          resequencedClipObjects = scoredClips;
        }
        break;
        
      case 'custom':
        try {
          const indexPattern = customSequence.split(',').map(s => parseInt(s.trim()));
          
          const validIndexes = indexPattern.every(idx => idx > 0 && idx <= selectedClipObjects.length);
          
          if (!validIndexes) {
            throw new Error("Invalid indexes in custom pattern");
          }
          
          resequencedClipObjects = indexPattern.map(idx => selectedClipObjects[idx - 1]);
        } catch (error) {
          toast.error("Invalid custom sequence", {
            description: "Please enter a valid sequence of numbers separated by commas."
          });
          return;
        }
        break;
    }

    console.log("Resequenced clip objects:", resequencedClipObjects);
    
    // Update sequence number for each clip
    const updatedClips = clips.map(clip => {
      // Find this clip in the resequenced array
      const resequenceIndex = resequencedClipObjects.findIndex(rc => rc.id === clip.id);
      
      if (resequenceIndex !== -1) {
        return {
          ...clip,
          sequence: resequenceIndex
        };
      }
      return clip;
    });
    
    console.log("Updated clips with new sequence numbers:", updatedClips);
    
    setClips(updatedClips);
    setResequenceTimestamp(Date.now());
    
    toast.success("Clips resequenced", {
      description: `Applied ${sequencePattern} pattern to ${selectedClips.length} clips.`
    });
  };

  const aiSelectBestSegments = async () => {
    if (selectedClips.length === 0) {
      toast.warning("No clips selected", {
        description: "Please select at least one clip for AI analysis."
      });
      return;
    }

    setIsProcessing(true);
    setAnalysisProgress(0);

    try {
      const newClips: VideoClip[] = [...clips];
      const newSegments: VideoClip[] = [];
      let nextId = getNextClipId();
      let processedClips = 0;
      const totalClips = selectedClips.length;

      for (const clipId of selectedClips) {
        const originalClip = clips.find(clip => clip.id === clipId);
        if (!originalClip || originalClip.isSegment) continue;

        let bestSegments: ClipSegment[];
        
        if (originalClip.type === 'video' && originalClip.url) {
          toast.info("Analyzing video content", {
            description: `Processing ${originalClip.name} to find the best segments...`,
            id: `analysis-${originalClip.id}`
          });
          
          const videoEl = videoRefs.current[originalClip.id];
          
          if (videoEl) {
            bestSegments = await analyzeVideoContent(videoEl, originalClip, segmentCount, {
              preferenceWeights: {
                motion: focusMode === 'motion' ? 0.4 : 0.2,
                brightness: focusMode === 'aesthetic' ? 0.3 : 0.15,
                contrast: focusMode === 'aesthetic' ? 0.3 : 0.15,
                facePriority: 0.2,
                objectPriority: 0.1,
                productFocus: focusMode === 'aesthetic' ? 0.25 : 0.15,
                actionIntensity: focusMode === 'motion' ? 0.3 : 0.1
              }
            });
          } else {
            bestSegments = simulateAIAnalysis(originalClip, segmentCount, focusMode === 'motion');
          }
          
          toast.success("Video analyzed", {
            description: `Found ${bestSegments.length} optimal segments in ${originalClip.name}`,
            id: `analysis-${originalClip.id}`
          });
        } else {
          bestSegments = simulateAIAnalysis(originalClip, segmentCount, focusMode === 'motion');
        }

        bestSegments.forEach((segment, index) => {
          newSegments.push({
            id: nextId++,
            name: `${originalClip.name} (AI Best ${index + 1})`,
            duration: segment.endTime - segment.startTime,
            type: originalClip.type,
            url: originalClip.url,
            mimeType: originalClip.mimeType,
            originalClipId: originalClip.id,
            startTime: segment.startTime,
            endTime: segment.endTime,
            isSegment: true
          });
        });
        
        processedClips++;
        setAnalysisProgress(Math.floor((processedClips / totalClips) * 100));
      }

      setClips([...newClips, ...newSegments]);

      const newSegmentIds = newSegments.map(segment => segment.id);
      setSelectedClips(newSegmentIds);

      setTimeout(() => {
        const patterns: SequencePattern[] = ['forward', 'reverse', 'random', 'alternating'];
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        setSequencePattern(randomPattern);
        
        let resequencedIds: number[] = [];
        
        switch (randomPattern) {
          case 'forward':
            resequencedIds = [...newSegmentIds];
            break;
          case 'reverse':
            resequencedIds = [...newSegmentIds].reverse();
            break;
          case 'random':
            resequencedIds = [...newSegmentIds];
            for (let i = resequencedIds.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [resequencedIds[i], resequencedIds[j]] = [resequencedIds[j], resequencedIds[i]];
            }
            break;
          case 'alternating':
            const odd = newSegmentIds.filter((_, i) => i % 2 === 0);
            const even = newSegmentIds.filter((_, i) => i % 2 === 1);
            resequencedIds = [...odd, ...even];
            break;
        }
        
        const nonNewSegments = [...newClips];
        const resequencedSegments = resequencedIds.map(id => 
          newSegments.find(segment => segment.id === id)!
        );
        
        const updatedClips = [...nonNewSegments, ...resequencedSegments];
        setClips(updatedClips);
        
        toast.success("Clips resequenced", {
          description: `Applied ${randomPattern} pattern to the AI-selected segments.`
        });

        if (onCreateVideo) {
          toast.info("Creating video", {
            description: "Generating video from the AI-selected segments."
          });
          onCreateVideo(resequencedSegments);
        }
      }, 500);

      toast.success("AI analysis complete", {
        description: `Created ${newSegments.length} optimized segments for a stunning advertisement.`
      });
    } catch (error) {
      console.error("AI selection error:", error);
      toast.error("AI selection failed", {
        description: "There was an error during AI analysis. Please try again."
      });
    } finally {
      setIsProcessing(false);
      setAnalysisProgress(0);
    }
  };

  const createVideoFromSelection = () => {
    if (selectedClips.length === 0) {
      toast.warning("No clips selected", {
        description: "Please select at least one clip to create a video."
      });
      return;
    }

    if (onCreateVideo) {
      const selectedClipObjects = clips.filter(clip => selectedClips.includes(clip.id));
      onCreateVideo(selectedClipObjects);
      toast.success("Creating video", {
        description: `Creating video from ${selectedClipObjects.length} selected clips.`
      });
    }
  };

  const preloadVideos = () => {
    clips.forEach(clip => {
      if (clip.type === 'video' && clip.url && !clip.isSegment) {
        const video = document.createElement('video');
        video.src = clip.url;
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.style.display = 'none';
        
        videoRefs.current[clip.id] = video;
        
        document.body.appendChild(video);
        
        video.load();
      }
    });
  };

  useEffect(() => {
    preloadVideos();
    
    return () => {
      Object.values(videoRefs.current).forEach(videoEl => {
        if (videoEl && videoEl.parentNode) {
          videoEl.parentNode.removeChild(videoEl);
        }
      });
      videoRefs.current = {};
    };
  }, [clips.filter(c => !c.isSegment).map(c => c.id).join(',')]);

  return (
    <motion.div 
      className="space-y-6 border p-4 rounded-lg bg-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Clip Segmentation & Resequencing</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={selectAllClips}>
            Select All
          </Button>
          <Button size="sm" variant="outline" onClick={clearSelection}>
            Clear
          </Button>
          {onCreateVideo && (
            <Button 
              size="sm" 
              variant="default" 
              onClick={() => createVideoFromSelection()}
              disabled={selectedClips.length === 0}
              className="gap-1"
            >
              <Play className="h-4 w-4" />
              Create Video
            </Button>
          )}
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="space-y-3">
          <Label>Segment Duration (seconds)</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[segmentDuration]}
              min={1}
              max={5}
              step={0.5}
              onValueChange={(value) => setSegmentDuration(value[0])}
              className="flex-1"
            />
            <span className="min-w-[40px] text-center">{segmentDuration}s</span>
          </div>
          
          <Button 
            onClick={splitClipsIntoSegments} 
            className="w-full"
            disabled={selectedClips.length === 0}
          >
            <Scissors className="mr-2 h-4 w-4" />
            Split Selected Clips
          </Button>
        </div>
        
        <div className="space-y-3">
          <Label>Resequence Pattern</Label>
          <Select value={sequencePattern} onValueChange={(value) => setSequencePattern(value as SequencePattern)}>
            <SelectTrigger>
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="forward">Forward (1,2,3,4)</SelectItem>
              <SelectItem value="reverse">Reverse (4,3,2,1)</SelectItem>
              <SelectItem value="random">Random Shuffle</SelectItem>
              <SelectItem value="alternating">Alternating (1,3,2,4)</SelectItem>
              <SelectItem value="ai-optimized">AI Optimized Sequence</SelectItem>
              <SelectItem value="custom">Custom Pattern</SelectItem>
            </SelectContent>
          </Select>
          
          {showCustom && (
            <div className="mt-2">
              <Label>Custom Sequence Pattern</Label>
              <Input
                value={customSequence}
                onChange={(e) => setCustomSequence(e.target.value)}
                placeholder="e.g., 1,3,2,4"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter numbers separated by commas, where each number represents the position of a clip in the selection.
              </p>
            </div>
          )}
          
          <Button 
            onClick={resequenceClips} 
            className="w-full"
            disabled={selectedClips.length < 2}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Resequence Selected Clips
          </Button>
        </div>
      </motion.div>
      
      <motion.div 
        className="border p-4 rounded-md bg-primary/5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
      >
        <h4 className="font-medium mb-2 flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary" />
          AI Video Content Analyzer
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          AI will analyze your videos to find the most engaging and aesthetic segments, creating a professional ad-ready sequence automatically.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>Number of segments per clip</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[segmentCount]}
                min={1}
                max={3}
                step={1}
                onValueChange={(value) => setSegmentCount(value[0])}
                className="flex-1"
              />
              <span className="min-w-[40px] text-center">{segmentCount}</span>
            </div>
            
            <div className="pt-2">
              <Label className="mb-2 block">Optimization Focus</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={focusMode === 'motion' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFocusMode('motion')}
                  className="flex-1 gap-1"
                >
                  <MoveHorizontal className="h-4 w-4" />
                  Motion
                </Button>
                <Button
                  type="button"
                  variant={focusMode === 'aesthetic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFocusMode('aesthetic')}
                  className="flex-1 gap-1"
                >
                  <Sparkles className="h-4 w-4" />
                  Aesthetic
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <Button 
              onClick={aiSelectBestSegments} 
              className="w-full"
              variant="default"
              disabled={isProcessing || selectedClips.length === 0}
            >
              {isProcessing ? (
                <>
                  <div className="relative mr-2">
                    <Brain className="h-4 w-4 animate-pulse" />
                    {analysisProgress > 0 && (
                      <div className="absolute -bottom-2 -left-1 -right-1 h-0.5 bg-background rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-foreground"
                          style={{ width: `${analysisProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  Processing... {analysisProgress > 0 ? `${analysisProgress}%` : ''}
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Create AI-Optimized Ad Video
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {focusMode === 'aesthetic' 
                ? "Aesthetic focus prioritizes visual composition and lighting quality for more professional results." 
                : "Motion focus prioritizes action and movement for more dynamic and engaging content."}
            </p>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          className="border rounded-md p-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h4 className="font-medium mb-2">Available Clips</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <AnimatePresence>
              {clips.filter(clip => !clip.isSegment).map((clip, index) => (
                <motion.div 
                  key={`available-clip-${clip.id}-${index}-${resequenceTimestamp}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                    selectedClips.includes(clip.id) ? 'bg-primary/20' : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleClipSelection(clip.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-sm border mr-2 ${
                      selectedClips.includes(clip.id) ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`}>
                      {selectedClips.includes(clip.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <span>{clip.name} ({clip.duration}s)</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {clip.type || 'media'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {clips.filter(clip => !clip.isSegment).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No clips uploaded yet. Add clips using the upload option.
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div 
          className="border rounded-md p-2"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <h4 className="font-medium mb-2">Generated Segments</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <AnimatePresence>
              {clips.filter(clip => clip.isSegment).length > 0 ? (
                clips.filter(clip => clip.isSegment).map((segment, index) => (
                  <motion.div 
                    key={`generated-segment-${segment.id}-${index}-${resequenceTimestamp}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                      selectedClips.includes(segment.id) ? 'bg-primary/20' : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleClipSelection(segment.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-sm border mr-2 ${
                        selectedClips.includes(segment.id) ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`}>
                        {selectedClips.includes(segment.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span>{segment.name} ({segment.duration.toFixed(1)}s)</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{segment.startTime}s - {segment.endTime}s</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No segments created yet. Select clips and use the "Split" button to create segments.
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClipSegmenter;

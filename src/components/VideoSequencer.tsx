import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from "sonner";
import { VideoClip, TextOverlay } from '@/types/video';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoUploader from './VideoUploader';
import ClipSegmenter from './ClipSegmenter';
import FuturisticButton from './FuturisticButton';
import { Button } from "@/components/ui/button";
import MediaClipCard from './video-sequencer/MediaClipCard';
import MediaControls from './video-sequencer/MediaControls';
import SegmentCard from './video-sequencer/SegmentCard';
import { generateSequence } from '@/utils/sequencePatterns';
import { processClipsForAdvertisement } from '@/utils/videoProcessing';
import { useProductDescription } from '@/hooks/use-product-description';
import { 
  analyzeClipsCollection, 
  createOptimizedSequence, 
  generateSeamlessCaptions 
} from '@/utils/aiVideoAnalysis';

interface VideoSequencerProps {
  clips: VideoClip[];
  setClips: React.Dispatch<React.SetStateAction<VideoClip[]>>;
  onCreateVideo?: (selectedClips: VideoClip[]) => void;
}

interface ProcessedClip {
  element: HTMLVideoElement | HTMLImageElement;
  duration: number;
  width: number;
  height: number;
  originalClip: VideoClip;
}

const VideoSequencer: React.FC<VideoSequencerProps> = ({ clips, setClips, onCreateVideo }) => {
  const [activeTab, setActiveTab] = useState<string>("clips");
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [resequenceMode, setResequenceMode] = useState<boolean>(false);
  const [optimizationType, setOptimizationType] = useState<'ai-optimized' | 'advertisement'>('advertisement');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [captions, setCaptions] = useState<Record<number, string>>({});
  const [useCaptions, setUseCaptions] = useState<boolean>(true);
  const [useAdvancedTransitions, setUseAdvancedTransitions] = useState<boolean>(true);
  const [captionPositions, setCaptionPositions] = useState<Record<number, TextOverlay['position']>>({});
  const [useSeamlessCaptions, setUseSeamlessCaptions] = useState<boolean>(true);
  const [useAIOptimization, setUseAIOptimization] = useState<boolean>(true);
  
  const { analyzeAllClips } = useProductDescription();

  // Add refs for audio management
  const audioElements = useRef<Record<number, HTMLAudioElement>>({});
  const cleanupTimeout = useRef<NodeJS.Timeout>();
  
  // Cleanup function for audio resources
  const cleanupAudioResources = useCallback(() => {
    Object.values(audioElements.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.load();
      }
    });
    audioElements.current = {};
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources();
      if (cleanupTimeout.current) {
        clearTimeout(cleanupTimeout.current);
      }
    };
  }, [cleanupAudioResources]);
  
  const { mediaClips, segmentClips } = useMemo(() => {
    const uniqueClips = new Map<number, VideoClip>();
    const uniqueSegments = new Map<number, VideoClip>();
    
    clips.forEach(clip => {
      const id = clip.id;
      
      if (clip.isSegment) {
        uniqueSegments.set(id, { ...clip });
      } else {
        uniqueClips.set(id, { ...clip });
      }
    });
    
    console.log(`Found ${uniqueClips.size} media clips and ${uniqueSegments.size} segments`);
    
    // Ensure clips are sorted by sequence number, with undefined sequences going to the end
    const sortBySequence = (a: VideoClip, b: VideoClip) => {
      const seqA = typeof a.sequence === 'number' ? a.sequence : Number.MAX_SAFE_INTEGER;
      const seqB = typeof b.sequence === 'number' ? b.sequence : Number.MAX_SAFE_INTEGER;
      return seqA - seqB;
    };
    
    return {
      mediaClips: Array.from(uniqueClips.values()).sort(sortBySequence),
      segmentClips: Array.from(uniqueSegments.values()).sort(sortBySequence)
    };
  }, [clips]);

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
    console.log(`Refreshing view with ${clips.length} total clips`);
  }, [clips, activeTab]);

  useEffect(() => {
    const initialCaptions: Record<number, string> = {};
    const initialPositions: Record<number, TextOverlay['position']> = {};
    
    clips.forEach(clip => {
      if (clip.textOverlay?.text) {
        initialCaptions[clip.id] = clip.textOverlay.text;
        initialPositions[clip.id] = 'center';
      }
    });
    
    setCaptions(initialCaptions);
    setCaptionPositions(initialPositions);
  }, []);

  useEffect(() => {
    const handleCaptionsExtracted = () => {
      console.log("Captions extracted event detected");
      setRefreshKey(prev => prev + 1);
      
      try {
        const savedCaptions = localStorage.getItem('generatedCaptions');
        if (savedCaptions) {
          const parsedCaptions = JSON.parse(savedCaptions);
          setCaptions(prev => ({...prev, ...parsedCaptions}));
          
          setClips(prevClips => {
            return prevClips.map((clip, index) => {
              const clipNumber = index + 1;
              const captionText = parsedCaptions[clipNumber] || parsedCaptions[clip.id];
              
              if (captionText) {
                const position: TextOverlay['position'] = 'center';
                
                return {
                  ...clip,
                  textOverlay: {
                    text: captionText,
                    position: position,
                    style: {
                      id: 'default-style',
                      name: 'Default Style',
                      fontFamily: 'Arial',
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                      textAlign: 'center',
                      padding: 10,
                      borderRadius: 4,
                      background: 'rgba(0,0,0,0.5)',
                      margin: 0
                    }
                  }
                };
              }
              return clip;
            });
          });
        }
      } catch (error) {
        console.error("Error applying captions from event:", error);
      }
    };
    
    window.addEventListener('chatgpt-captions-extracted', handleCaptionsExtracted);
    
    return () => {
      window.removeEventListener('chatgpt-captions-extracted', handleCaptionsExtracted);
    };
  }, [setClips]);

  const getNextClipId = useCallback(() => {
    return clips.length > 0 ? Math.max(...clips.map(clip => clip.id)) + 1 : 1;
  }, [clips]);

  // Handle clip removal with audio cleanup
  const removeClip = useCallback((id: number) => {
    // Clean up audio for the removed clip
    if (audioElements.current[id]) {
      audioElements.current[id].pause();
      audioElements.current[id].src = '';
      delete audioElements.current[id];
    }
    
    const updatedClips = clips.filter(
      clip => clip.id !== id && clip.originalClipId !== id
    );
    
    const updatedCaptions = { ...captions };
    delete updatedCaptions[id];
    setCaptions(updatedCaptions);
    
    const updatedPositions = { ...captionPositions };
    delete updatedPositions[id];
    setCaptionPositions(updatedPositions);
    
    // Clean up localStorage captions
    try {
      const savedCaptions = localStorage.getItem('generatedCaptions');
      if (savedCaptions) {
        const parsedCaptions = JSON.parse(savedCaptions);
        delete parsedCaptions[id];
        localStorage.setItem('generatedCaptions', JSON.stringify(parsedCaptions));
      }
      
      const savedPositions = localStorage.getItem('captionPositions');
      if (savedPositions) {
        const parsedPositions = JSON.parse(savedPositions);
        delete parsedPositions[id];
        localStorage.setItem('captionPositions', JSON.stringify(parsedPositions));
      }
    } catch (error) {
      console.error("Error cleaning up localStorage captions:", error);
    }
    
    setClips(updatedClips);
    toast("The media item has been removed from your collection");
  }, [clips, captions, captionPositions, setClips]);
  
  // Handle clip updates with audio management
  const updateClip = useCallback((id: number, field: keyof VideoClip, value: any) => {
    // If updating duration or source, clean up existing audio
    if (field === 'duration' || field === 'url') {
      if (audioElements.current[id]) {
        audioElements.current[id].pause();
        audioElements.current[id].src = '';
        delete audioElements.current[id];
      }
    }
    
    setClips(clips.map(clip => 
      clip.id === id ? { ...clip, [field]: value } : clip
    ));
  }, [clips, setClips]);
  
  const handleUpload = useCallback((newClip: VideoClip) => {
    setClips(prevClips => [...prevClips, newClip]);
  }, [setClips]);
  
  const moveClipUp = useCallback((clipId: number) => {
    setClips(prevClips => {
      const clipIndex = prevClips.findIndex(clip => clip.id === clipId);
      if (clipIndex <= 0) return prevClips;
      
      const newClips = [...prevClips];
      [newClips[clipIndex], newClips[clipIndex - 1]] = [newClips[clipIndex - 1], newClips[clipIndex]];
      
      return newClips.map((clip, index) => ({
        ...clip,
        sequence: index
      }));
    });
    
    toast.success("Media moved up in sequence");
  }, [setClips]);
  
  const moveClipDown = useCallback((clipId: number) => {
    setClips(prevClips => {
      const clipIndex = prevClips.findIndex(clip => clip.id === clipId);
      if (clipIndex === -1 || clipIndex >= prevClips.length - 1) return prevClips;
      
      const newClips = [...prevClips];
      [newClips[clipIndex], newClips[clipIndex + 1]] = [newClips[clipIndex + 1], newClips[clipIndex]];
      
      return newClips.map((clip, index) => ({
        ...clip,
        sequence: index
      }));
    });
    
    toast.success("Media moved down in sequence");
  }, [setClips]);
  
  const toggleResequenceMode = useCallback(() => {
    setResequenceMode(prev => !prev);
    
    if (resequenceMode) {
      setClips(prevClips => {
        return prevClips.map((clip, index) => ({
          ...clip,
          sequence: index
        }));
      });
      
      toast.success("Media sequence saved");
    }
  }, [resequenceMode, setClips]);

  const handleCaptionChange = useCallback((clipId: number, captionText: string) => {
    setCaptions(prev => ({
      ...prev,
      [clipId]: captionText
    }));
  }, []);

  const handlePositionChange = useCallback((clipId: number, position: TextOverlay['position']) => {
    setCaptionPositions(prev => ({
      ...prev,
      [clipId]: 'center'
    }));
  }, []);

  const handleOptimizeClips = useCallback(() => {
    if (mediaClips.length === 0) {
      toast.warning("No clips available", {
        description: "Please upload media clips first to use AI optimization."
      });
      return;
    }

    setIsOptimizing(true);
    
    toast.info("Creating AI-optimized video", {
      description: "Analyzing clips for best segments, optimal sequence, and seamless captions..."
    });

    window.requestAnimationFrame(() => {
      try {
        const clipsToOptimize = JSON.parse(JSON.stringify(clips));

        const analysisResults = analyzeClipsCollection(clipsToOptimize);
        
        const optimizedClips = createOptimizedSequence(clipsToOptimize, analysisResults);
        
        if (useCaptions && useSeamlessCaptions) {
          const description = localStorage.getItem('productDescription') || '';
          const { captions: seamlessCaptions } = generateSeamlessCaptions(optimizedClips, description);
          
          const positions: Record<number, TextOverlay['position']> = {};
          Object.keys(seamlessCaptions).forEach(id => {
            positions[parseInt(id)] = 'center';
          });
          
          setCaptions(seamlessCaptions);
          setCaptionPositions(positions);
          
          const clipsWithCaptions = optimizedClips.map(clip => {
            if (seamlessCaptions[clip.id]) {
              return {
                ...clip,
                textOverlay: {
                  text: seamlessCaptions[clip.id],
                  position: 'center' as TextOverlay['position'],
                  style: {
                    id: 'default-style',
                    name: 'Default Style',
                    fontFamily: 'Arial',
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    padding: 10,
                    borderRadius: 4,
                    background: 'rgba(0,0,0,0.5)',
                    margin: 0
                  }
                }
              };
            }
            return clip;
          });
          
          setClips(clipsWithCaptions);
          
          toast.success('AI-optimized sequence created', {
            description: 'Video clips have been analyzed, resequenced, and captioned for maximum engagement'
          });
        } else {
          setClips(optimizedClips);
          
          toast.success('AI-optimized sequence created', {
            description: 'Clips have been analyzed and sequenced for optimal visual flow'
          });
        }
      } catch (error) {
        console.error("Optimization error:", error);
        toast.error("Error during optimization", {
          description: "Could not optimize the sequence. Using original clips."
        });
      } finally {
        setRefreshKey(prev => prev + 1);
        setIsOptimizing(false);
      }
    });
  }, [mediaClips, clips, useCaptions, useSeamlessCaptions, setClips]);

  const handleCreateVideo = useCallback((selectedClips: VideoClip[]) => {
    if (!selectedClips || selectedClips.length === 0) {
      toast.warning("No clips selected", {
        description: "Please select at least one clip to create a video."
      });
      return;
    }
    
    const sortedClips = [...selectedClips].sort((a, b) => 
      (a.sequence !== undefined && b.sequence !== undefined) 
        ? a.sequence - b.sequence 
        : 0
    );
    
    if (sortedClips.length === 0) {
      toast.error("Error creating video", {
        description: "No valid clips available for video creation."
      });
      return;
    }
    
    let processedClips = sortedClips;
    
    if (useAIOptimization) {
      const analysisResults = analyzeClipsCollection(sortedClips);
      processedClips = createOptimizedSequence(sortedClips, analysisResults);
    }
    
    if (useCaptions) {
      if (useSeamlessCaptions) {
        const description = localStorage.getItem('productDescription') || '';
        const { captions: seamlessCaptions } = generateSeamlessCaptions(processedClips, description);
        
        const positions: Record<number, TextOverlay['position']> = {};
        Object.keys(seamlessCaptions).forEach(id => {
          positions[parseInt(id)] = 'center';
        });

        // Save captions to state and localStorage
        setCaptions(seamlessCaptions);
        localStorage.setItem('generatedCaptions', JSON.stringify(seamlessCaptions));
        
        processedClips = processedClips.map(clip => {
          if (seamlessCaptions[clip.id]) {
            return {
              ...clip,
              textOverlay: {
                text: seamlessCaptions[clip.id],
                position: 'center' as TextOverlay['position'],
                style: {
                  id: 'default-style',
                  name: 'Default Style',
                  fontFamily: 'Arial',
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  padding: 10,
                  borderRadius: 4,
                  background: 'rgba(0,0,0,0.5)',
                  margin: 0
                },
                animation: 'fade-in',
                startTime: 0.5,
                endTime: clip.duration ? clip.duration - 0.3 : undefined
              }
            };
          }
          return clip;
        });
      } else {
        const centeredCaptionPositions: Record<number, TextOverlay['position']> = {};
        Object.keys(captions).forEach(id => {
          centeredCaptionPositions[parseInt(id)] = 'center';
        });
        
        // Save current captions to localStorage before processing
        localStorage.setItem('generatedCaptions', JSON.stringify(captions));
        
        processedClips = processClipsForAdvertisement(
          processedClips,
          3,
          useAdvancedTransitions ? 'fade' : 'crossfade',
          captions,
          centeredCaptionPositions
        );
      }
      
      processedClips = processedClips.map(clip => ({
        ...clip,
        captionEnabled: clip.textOverlay ? true : undefined,
        renderSettings: clip.textOverlay ? {
          ...(clip.renderSettings || {}),
          showCaptions: true,
          captionRenderMode: 'overlay',
          captionPriority: 'high',
        } : undefined
      }));
    }
    
    // Save the processed clips with their captions
    setClips(processedClips);
    
    if (onCreateVideo) {
      onCreateVideo(processedClips);
      
      toast.success("Creating optimized video", {
        description: `Processing ${processedClips.length} clips with ${useCaptions ? 'AI captions' : 'no captions'} and ${useAdvancedTransitions ? 'smooth transitions' : 'standard transitions'}`
      });
    }
  }, [
    onCreateVideo, 
    captions, 
    useCaptions, 
    captionPositions, 
    useAdvancedTransitions,
    useAIOptimization,
    useSeamlessCaptions,
    setCaptions,
    setClips
  ]);

  const handleAdvancedClick = useCallback(() => {
    setActiveTab("segmenter");
  }, [setActiveTab]);

  const handleTabChange = useCallback((value: string) => {
    if (resequenceMode) {
      toggleResequenceMode();
    }
    
    setActiveTab(value);
  }, [resequenceMode, toggleResequenceMode]);

  const nextId = getNextClipId();

  // Remove caption clearing on page load
  useEffect(() => {
    // Only remove hasNewAiCaptions flag
    localStorage.removeItem('hasNewAiCaptions');
  }, []);

  const handleCaptionSelect = useCallback((caption: string, clipIndex: number) => {
    if (clipIndex >= clips.length) {
      toast.error("No clip available for this caption");
      return;
    }

    const clip = clips[clipIndex];
    const updatedCaptions = { ...captions };
    updatedCaptions[clip.id] = caption;
    setCaptions(updatedCaptions);

    // Update clip with new caption
    const updatedClip = {
      ...clip,
      textOverlay: {
        text: caption,
        position: 'center' as TextOverlay['position'],
        style: {
          id: 'default-style',
          name: 'Default Style',
          fontFamily: 'Montserrat, Poppins, Open Sans, Arial',
          fontSize: 36,
          fontWeight: 'bold',
          color: '#FFFFFF',
          textAlign: 'center',
          padding: 10,
          borderRadius: 4,
          background: 'rgba(0,0,0,0.5)',
          margin: 0
        }
      }
    };

    const updatedClips = clips.map(c => 
      c.id === clip.id ? updatedClip : c
    );

    setClips(updatedClips);
    
    // Save to localStorage for persistence
    localStorage.setItem('generatedCaptions', JSON.stringify(updatedCaptions));
    toast.success("Caption applied successfully");
  }, [clips, captions, setClips]);

  const processVideoClip = async (clip: VideoClip): Promise<ProcessedClip> => {
    if (clip.type === 'video') {
      const video = document.createElement('video');
      video.src = clip.url || '';
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      
      // Optimize for high-quality playback
      video.preload = 'auto';
      video.style.transform = 'translateZ(0)';
      video.style.backfaceVisibility = 'hidden';
      
      // Set optimal playback settings
      video.playbackRate = 1.0;
      video.defaultPlaybackRate = 1.0;
      video.preservesPitch = false;
      
      // Wait for video to be fully loaded
      await new Promise<void>((resolve, reject) => {
        const loadTimeout = setTimeout(() => reject(new Error('Video load timeout')), 60000);
        
        const checkBuffer = () => {
          if (video.readyState === 4) { // HAVE_ENOUGH_DATA
            clearTimeout(loadTimeout);
            resolve();
          } else {
            setTimeout(checkBuffer, 100);
          }
        };
        
        video.addEventListener('loadedmetadata', () => {
          video.currentTime = 0;
          checkBuffer();
        });
        
        video.addEventListener('error', (e) => {
          clearTimeout(loadTimeout);
          reject(new Error(`Video load error: ${e}`));
        });
        
        video.load();
      });
      
      return {
        element: video,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        originalClip: clip
      };
    }
    
    // ... existing image handling code ...
  };

  const renderSequence = async (clips: ProcessedClip[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    let currentTime = 0;
    let currentClipIndex = 0;
    let isRendering = true;
    let lastFrameTime = performance.now();
    let nextClipBuffer: ProcessedClip | null = null;
    
    const render = async () => {
      if (!isRendering) return;
      
      const now = performance.now();
      const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.033); // Cap at ~30fps to prevent timing issues
      lastFrameTime = now;
      
      const currentClip = clips[currentClipIndex];
      
      if (currentClip) {
        // Pre-buffer next clip
        if (!nextClipBuffer && currentClipIndex < clips.length - 1) {
          const nextClip = clips[currentClipIndex + 1];
          if (nextClip.element instanceof HTMLVideoElement) {
            nextClip.element.currentTime = 0;
            await nextClip.element.play().catch(console.error);
            nextClip.element.pause();
            nextClipBuffer = nextClip;
          }
        }
        
        // Handle video clips
        if (currentClip.element instanceof HTMLVideoElement) {
          const video = currentClip.element;
          
          // Ensure video is playing and in sync
          if (video.paused || video.ended) {
            try {
              video.currentTime = currentTime % video.duration;
              await video.play();
            } catch (error) {
              console.error('Error playing video:', error);
            }
          }
          
          // Only render if video has enough data
          if (video.readyState >= 3) {
            ctx.drawImage(
              video,
              0,
              0,
              canvas.width,
              canvas.height
            );
          }
          
          currentTime += deltaTime;
          
          // Handle clip transition
          if (currentTime >= video.duration) {
            // Clean transition to next clip
            video.pause();
            video.currentTime = 0;
            
            currentClipIndex++;
            currentTime = 0;
            nextClipBuffer = null;
            
            // Start next clip immediately if available
            if (currentClipIndex < clips.length) {
              const nextClip = clips[currentClipIndex];
              if (nextClip.element instanceof HTMLVideoElement) {
                nextClip.element.currentTime = 0;
                await nextClip.element.play().catch(console.error);
              }
            }
          }
        } else {
          // Handle image clips
          ctx.drawImage(
            currentClip.element,
            0,
            0,
            canvas.width,
            canvas.height
          );
          
          currentTime += deltaTime;
          if (currentTime >= (currentClip.originalClip.duration || 5)) {
            currentClipIndex++;
            currentTime = 0;
            nextClipBuffer = null;
          }
        }
      }
      
      if (currentClipIndex < clips.length) {
        requestAnimationFrame(render);
      } else {
        isRendering = false;
      }
    };
    
    requestAnimationFrame(render);
    
    return new Promise<void>((resolve) => {
      const checkCompletion = () => {
        if (!isRendering) {
          resolve();
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4">
          <TabsTrigger value="clips">Media Gallery</TabsTrigger>
          <TabsTrigger value="segmenter">Advanced Editing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clips" className="space-y-6">
          <VideoUploader onUpload={handleUpload} nextId={nextId} />
          
          {mediaClips.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  Your Media ({mediaClips.length})
                </h3>
                
                <MediaControls
                  resequenceMode={resequenceMode}
                  useCaptions={useCaptions}
                  useAdvancedTransitions={useAdvancedTransitions}
                  isOptimizing={isOptimizing}
                  onResequenceToggle={toggleResequenceMode}
                  onCaptionsToggle={setUseCaptions}
                  onTransitionsToggle={setUseAdvancedTransitions}
                  onOptimize={handleOptimizeClips}
                  onAdvancedClick={handleAdvancedClick}
                  onCaptionSelect={handleCaptionSelect}
                />
              </div>
              
              <div key={`media-grid-${refreshKey}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaClips.map((clip, index) => (
                  <MediaClipCard
                    key={`clip-${clip.id}-${index}-${refreshKey}`}
                    clip={clip}
                    index={index}
                    totalClips={mediaClips.length}
                    resequenceMode={resequenceMode}
                    captions={captions}
                    captionPositions={captionPositions}
                    onRemove={removeClip}
                    onMoveUp={moveClipUp}
                    onMoveDown={moveClipDown}
                    onUpdateClip={updateClip}
                    onCaptionChange={handleCaptionChange}
                    onPositionChange={handlePositionChange}
                  />
                ))}
              </div>
              
              {segmentClips.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Segments ({segmentClips.length})</h3>
                  <div key={`segment-grid-${refreshKey}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {segmentClips.map((segment, index) => (
                      <SegmentCard
                        key={`segment-${segment.id}-${index}-${refreshKey}`}
                        segment={segment}
                        captions={captions}
                        captionPositions={captionPositions}
                        onRemove={removeClip}
                        onUpdateClip={updateClip}
                        onCaptionChange={handleCaptionChange}
                        onPositionChange={handlePositionChange}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-center">
                <FuturisticButton
                  onClick={() => handleCreateVideo(mediaClips)}
                  className="px-6 py-3 text-lg"
                  glowColor="rgba(126, 34, 206, 0.7)"
                  hoverScale={1.05}
                >
                  Create AI-Optimized Video ({mediaClips.length} clips)
                </FuturisticButton>
              </div>
            </>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                No media uploaded yet. Upload videos or images to get started!
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="segmenter">
          <ClipSegmenter 
            clips={clips} 
            setClips={setClips} 
            onCreateVideo={handleCreateVideo}
          />
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setActiveTab("clips")}
            >
              Back to Media Gallery
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoSequencer;

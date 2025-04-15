import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import VideoSequencer from './VideoSequencer';
import AIVideoEditor from './AIVideoEditor';
import FinalVideoPlayer from './FinalVideoPlayer';
import { VideoClip, VideoVariation } from '@/types/video';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Video, ArrowRight, LucideIcon, Share2, ChevronUp, Download, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ShareOptionsMenu from './ShareOptionsMenu';
import { processClipsForAdvertisement } from '@/utils/videoProcessing';
import { ErrorFallback } from '@/components/ErrorFallback';

const VideoCreativeFactory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [variations, setVariations] = useState<VideoVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<VideoVariation | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [customTheme, setCustomTheme] = useState<string>("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const [videoGenerated, setVideoGenerated] = useState<boolean>(false);
  const [tabChanged, setTabChanged] = useState<boolean>(false);
  
  const [processedClips, setProcessedClips] = useState<VideoClip[]>([]);
  
  useEffect(() => {
    console.log(`Current clips in VideoCreativeFactory: ${clips.length}`);
    
    if (clips.length > 0) {
      const optimizedClips = processClipsForAdvertisement(
        clips.filter(clip => !clip.isSegment),
        3,
        'fade'
      );
      setProcessedClips(optimizedClips);
      console.log(`Optimized ${optimizedClips.length} clips for smooth playback`);
    } else {
      setProcessedClips([]);
    }
  }, [clips]);
  
  useEffect(() => {
    return () => {
      if (finalVideoUrl && finalVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(finalVideoUrl);
      }
    };
  }, [finalVideoUrl]);
  
  const handleStartEditing = (selectedClips: VideoClip[]) => {
    if (selectedClips.length === 0) {
      toast.warning("No clips selected", {
        description: "Please select clips to create a video."
      });
      return;
    }
    
    console.log(`Starting editing with ${selectedClips.length} clips`);
    
    try {
      // Process clips safely
      const processedVideos = processClipsForAdvertisement(selectedClips, 3, 'fade');
      
      // Validate processed clips
      if (!processedVideos || processedVideos.length === 0) {
        console.error("No clips were processed successfully");
        toast.error("Failed to process video clips", {
          description: "Please try again with different clips."
        });
        return;
      }
      
      console.log(`Processed ${processedVideos.length} clips ready for editing`);
      
      // Set state before tab change
      setClips(processedVideos);
      setProcessedClips(processedVideos);
      
      // Safer tab transition with timeout
      setTimeout(() => {
        try {
          setTabChanged(true);
          setTimeout(() => {
            setActiveTab("edit");
            setTabChanged(false);
            
            // Verify the transition was successful
            setTimeout(() => {
              if (document.visibilityState === 'hidden' || !document.body) {
                console.error("Document may not be visible after tab change");
              } else {
                console.log("Successfully transitioned to edit tab");
              }
            }, 500);
          }, 300);
        } catch (error) {
          console.error("Error during tab transition:", error);
          toast.error("Navigation error", {
            description: "Please try refreshing the page."
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error in handleStartEditing:", error);
      toast.error("Failed to prepare editing session", {
        description: "An unexpected error occurred. Please try again."
      });
    }
  };
  
  const handleGenerateVideo = (generatedUrl: string, theme?: string) => {
    if (finalVideoUrl && finalVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(finalVideoUrl);
    }
    
    console.log(`Video generated with URL: ${generatedUrl}`);
    
    if (generatedUrl && generatedUrl.startsWith('blob:')) {
      setFinalVideoUrl(generatedUrl);
      if (theme) {
        setCustomTheme(theme);
      }
      
      setVideoGenerated(true);
      setTabChanged(true);
      setTimeout(() => {
        setActiveTab("preview");
        setTabChanged(false);
      }, 300);
      
      toast.success("Video created!", {
        description: "Your advertisement video has been generated successfully. Switching to preview."
      });
    } else {
      toast.error("Video generation failed", {
        description: "There was an error generating your video. Please try again."
      });
    }
  };
  
  const hasValidVideo = () => {
    return Boolean(finalVideoUrl) && videoGenerated;
  };

  const handleTabChange = (value: string) => {
    if (value === activeTab) return;
    
    if (value === "preview" && !hasValidVideo()) {
      toast.warning("No video available", {
        description: "Generate a video first in the Edit tab."
      });
      return;
    }
    
    setTabChanged(true);
    
    setTimeout(() => {
      setActiveTab(value);
      setTabChanged(false);
    }, 300);
  };

  const handleShareVideo = () => {
    if (!finalVideoUrl) {
      toast.warning("No video to share", {
        description: "Generate a video first before sharing."
      });
      return;
    }
    
    setIsShareDialogOpen(true);
  };

  return (
    <motion.div 
      className="container py-10 max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-purple-400/40 shadow-lg shadow-purple-600/20 overflow-hidden bg-gradient-to-br from-indigo-950/90 via-purple-950/60 to-fuchsia-950/70 cosmic-glow">
        <motion.div
          whileHover={{ backgroundColor: "rgba(30, 15, 60, 0.7)" }}
          transition={{ duration: 0.3 }}
        >
          <CardHeader className="border-b border-purple-400/30 bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2 cosmic-text">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                    className="text-purple-300"
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                  Video Creative Factory
                </CardTitle>
                <CardDescription className="text-purple-200/80">
                  Create professional social media ads from your clips with AI assistance
                </CardDescription>
              </div>
              
              {hasValidVideo() && (
                <div className="flex gap-2">
                  <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex gap-2 items-center border-purple-500/40 bg-indigo-950/60 text-purple-200 hover:bg-purple-900/40">
                        <Share2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-indigo-950/90 via-purple-950/80 to-fuchsia-950/90 border-purple-500/40 backdrop-blur-md">
                      <DialogHeader>
                        <DialogTitle className="text-purple-200">Share Your Video</DialogTitle>
                        <DialogDescription className="text-purple-300/80">
                          Choose how you want to share your video
                        </DialogDescription>
                      </DialogHeader>
                      <ShareOptionsMenu videoUrl={finalVideoUrl} />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex gap-2 items-center border-purple-500/40 bg-indigo-950/60 text-purple-200 hover:bg-purple-900/40"
                    onClick={() => {
                      if (finalVideoUrl) {
                        const a = document.createElement('a');
                        a.href = finalVideoUrl;
                        a.download = 'my-creative-video.webm';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        
                        toast.success("Download started", {
                          description: "Your video is being downloaded to your device."
                        });
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="px-6 pt-6">
            <TabsList className="grid w-full grid-cols-3 bg-indigo-950/60 border border-purple-500/30">
              <TabsTrigger value="upload" className="relative data-[state=active]:bg-purple-800/40 data-[state=active]:text-purple-100">
                Upload Media
                {activeTab === "upload" && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                    layoutId="activeTabIndicator"
                  />
                )}
              </TabsTrigger>
              <TabsTrigger value="edit" className="relative data-[state=active]:bg-purple-800/40 data-[state=active]:text-purple-100">
                Edit Video
                {activeTab === "edit" && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                    layoutId="activeTabIndicator"
                  />
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                disabled={!hasValidVideo()}
                className="relative data-[state=active]:bg-purple-800/40 data-[state=active]:text-purple-100"
              >
                Preview
                {activeTab === "preview" && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                    layoutId="activeTabIndicator"
                  />
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: tabChanged ? 20 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-indigo-950/30 p-6 rounded-lg border border-purple-500/30 shadow-inner shadow-purple-800/10"
              >
                {activeTab === "upload" && (
                  <VideoSequencer 
                    clips={clips} 
                    setClips={setClips} 
                    onCreateVideo={(selectedClips) => handleStartEditing(selectedClips)}
                  />
                )}
                
                {activeTab === "edit" && (
                  <React.Suspense fallback={
                    <div className="min-h-[300px] flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-purple-400" />
                        <p className="text-purple-300">Loading video editor...</p>
                      </div>
                    </div>
                  }>
                    <ErrorFallback>
                      <AIVideoEditor 
                        clips={clips}
                        onGenerateVideo={handleGenerateVideo}
                      />
                    </ErrorFallback>
                  </React.Suspense>
                )}
                
                {activeTab === "preview" && (
                  hasValidVideo() ? (
                    <FinalVideoPlayer 
                      videoUrl={finalVideoUrl!}
                      customTheme={customTheme}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <p className="text-muted-foreground mb-4">
                        No video has been generated yet. Go to the Edit tab to create a video.
                      </p>
                      <Button 
                        onClick={() => handleTabChange("edit")}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Go to Editor
                      </Button>
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Tabs>
        
        <CardFooter className="border-t border-purple-500/30 bg-black/60 p-6">
          <div className="flex w-full justify-between items-center">
            <div className="text-sm text-purple-300/80">
              Powered by AI video processing
            </div>
            <AnimatePresence mode="wait">
              {activeTab === "upload" && clips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    onClick={() => handleStartEditing(clips.filter(clip => !clip.isSegment))}
                    size="sm"
                    className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Continue to Editor
                    <motion.div
                      className="ml-2"
                      initial={{ x: 0 }}
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              )}
              {activeTab === "edit" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    onClick={() => handleTabChange("upload")}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/40 bg-indigo-950/60 text-purple-200 hover:bg-purple-900/40"
                  >
                    Back to Upload
                  </Button>
                </motion.div>
              )}
              {activeTab === "preview" && hasValidVideo() && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-2"
                >
                  <Button 
                    onClick={() => handleShareVideo()}
                    variant="default"
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Video
                  </Button>
                  <Button 
                    onClick={() => handleTabChange("edit")}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/40 bg-indigo-950/60 text-purple-200 hover:bg-purple-900/40"
                  >
                    Create Another
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default VideoCreativeFactory;

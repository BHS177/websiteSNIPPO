import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Share2, RefreshCw, Volume2, Volume1, VolumeX, Subtitles, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Caption, SubtitleOptions } from '@/types/video';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SubtitleStyler from './SubtitleStyler';
import captionService from '@/services/captionService';

interface FinalVideoPlayerProps {
  videoUrl: string;
  customTheme?: string;
  captions?: Caption[];
  adStyle?: string;
}

const FinalVideoPlayer: React.FC<FinalVideoPlayerProps> = ({ 
  videoUrl, 
  customTheme, 
  captions = [],
  adStyle = "standard"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [key, setKey] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [useNative, setUseNative] = useState(false);
  const [directDownloadUrl, setDirectDownloadUrl] = useState<string | null>(null);
  const [showCaptions, setShowCaptions] = useState(true);
  const [subtitleOptions, setSubtitleOptions] = useState<SubtitleOptions>({
    fontFamily: 'Arial',
    fontSize: 12,
    fontColor: '#FFFFFF',
    backgroundColor: 'transparent',
    position: 'bottom',
    alignment: 'center',
    style: 'standard'
  });
  const [activeCaption, setActiveCaption] = useState<Caption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<Caption[]>(captions || []);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("preview");
  const [bufferingState, setBufferingState] = useState<'initial' | 'buffering' | 'ready' | 'error'>('initial');
  const [isHDQuality, setIsHDQuality] = useState<boolean>(true);
  const [preloadStrategy, setPreloadStrategy] = useState<'auto' | 'metadata' | 'none'>('auto');
  const [isUsingHardwareAcceleration, setIsUsingHardwareAcceleration] = useState<boolean>(true);
  const [isGeneratingEndingCaptions, setIsGeneratingEndingCaptions] = useState<boolean>(false);
  const [captionAuthToken, setCaptionAuthToken] = useState<string | null>(null);
  const frameCache = useRef<Map<number, ImageData>>(new Map());

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const retryVideoLoad = () => {
    setRetryCount(prev => prev + 1);
    setKey(prevKey => prevKey + 1);
    setVideoError(null);
    setBufferingState('initial');
  };

  const toggleNativeControls = () => {
    setUseNative(prev => !prev);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSliderChange = (values: number[]) => {
    if (videoRef.current && values.length > 0) {
      videoRef.current.currentTime = values[0];
      setCurrentTime(values[0]);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX />;
    } else if (volume < 0.5) {
      return <Volume1 />;
    } else {
      return <Volume2 />;
    }
  };

  const handleVolumeChange = (values: number[]) => {
    if (videoRef.current && values.length > 0) {
      const newVolume = values[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      
      if (newVolume > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleCaptions = () => {
    setShowCaptions(prev => !prev);
  };

  const toggleHardwareAcceleration = () => {
    setIsUsingHardwareAcceleration(prev => !prev);
  };

  const shareVideo = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Video',
          text: 'Check out this AI-generated video!',
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share video');
    }
  };

  const generateEndingCaptions = async () => {
    if (!videoRef.current || duration === 0) {
      toast.error("Video not loaded yet");
      return;
    }
    
    setIsGeneratingEndingCaptions(true);
    
    try {
      const lastCaptionEndTime = generatedCaptions.length > 0 
        ? generatedCaptions[generatedCaptions.length - 1].endTime 
        : 0;
        
      if (lastCaptionEndTime < duration - 1) {
        const newCaptions = await captionService.generateEndingCaptions(
          videoUrl, 
          duration,
          captionAuthToken,
          duration - lastCaptionEndTime
        );
        
        const styledCaptions = captionService.styleCaptionsForAdType(
          newCaptions, 
          adStyle, 
          subtitleOptions
        );
        
        setGeneratedCaptions(prev => [...prev, ...styledCaptions]);
        toast.success("Ending captions generated successfully");
      } else {
        toast.info("Video already fully captioned");
      }
    } catch (error) {
      console.error("Failed to generate ending captions:", error);
      toast.error("Failed to generate ending captions");
    } finally {
      setIsGeneratingEndingCaptions(false);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      // Enable high quality playback settings
      videoRef.current.playsInline = true;
      videoRef.current.preload = "auto";
      
      // Force hardware acceleration
      videoRef.current.style.transform = 'translateZ(0)';
      videoRef.current.style.backfaceVisibility = 'hidden';
      videoRef.current.style.perspective = '1000px';
      
      // Set high quality playback
      videoRef.current.style.imageRendering = 'crisp-edges';
      videoRef.current.style.willChange = 'transform';
      
      // Increase buffer size for smoother playback
      const mediaSource = videoRef.current.src;
      if (mediaSource.startsWith('blob:')) {
        const mediaElement = videoRef.current;
        if ('webkitAudioDecodedByteCount' in mediaElement) {
          // @ts-ignore - Enable experimental features for better quality
          mediaElement.webkitPreservesPitch = true;
        }
      }
      
      // Enable better quality settings
      if ('preservesPitch' in videoRef.current) {
        // @ts-ignore
        videoRef.current.preservesPitch = true;
      }
      
      // Preload the video
      const preloadVideo = async () => {
        try {
          await videoRef.current?.load();
          // Wait for enough data to be loaded
          await new Promise<void>((resolve) => {
            const checkBuffer = () => {
              if (videoRef.current?.readyState >= 4) {
                resolve();
              }
            };
            videoRef.current?.addEventListener('canplaythrough', checkBuffer, { once: true });
          });
          setVideoLoaded(true);
        } catch (error) {
          console.error('Error preloading video:', error);
          setVideoError('Error loading video. Please try again.');
        }
      };
      
      preloadVideo();
    }
  }, [videoUrl]);

  return (
    <div className="space-y-6">
      <Tabs 
        value={selectedTab} 
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="preview">Video Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white">Your AI Masterpiece</h2>
            {customTheme && (
              <p className="text-white/80 mb-4 italic">"{customTheme}"</p>
            )}
            
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-10">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                    <p>{loadingMessage || "Processing video..."}</p>
                  </div>
                </div>
              )}
              
              {!isLoading && bufferingState === 'buffering' && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white/60 border-t-white rounded-full"></div>
                    <span>Buffering...</span>
                  </div>
                </div>
              )}
              
              {videoError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-center p-4">
                  <div>
                    <p className="mb-4">{videoError}</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button variant="outline" onClick={retryVideoLoad} className="bg-white/10 hover:bg-white/20 text-white">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                      <Button variant="outline" onClick={toggleNativeControls} className="bg-white/10 hover:bg-white/20 text-white">
                        <Play className="mr-2 h-4 w-4" />
                        {useNative ? "Use Custom Player" : "Use Native Player"}
                      </Button>
                      <Button variant="outline" asChild className="bg-white/10 hover:bg-white/20 text-white">
                        <a href={directDownloadUrl || videoUrl} download="ai-advertisement.webm">
                          <Download className="mr-2 h-4 w-4" />
                          Download Instead
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <video
                key={key}
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                playsInline
                controls={useNative}
                autoPlay={false}
                loop={false}
                muted={isMuted}
                preload="auto"
                crossOrigin="anonymous"
                style={{
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  objectFit: 'contain',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  imageRendering: 'crisp-edges',
                  perspective: '1000px'
                }}
                onLoadStart={() => {
                  setBufferingState('initial');
                  setVideoLoaded(false);
                }}
                onLoadedData={() => {
                  setBufferingState('ready');
                  setVideoLoaded(true);
                }}
                onWaiting={() => setBufferingState('buffering')}
                onPlaying={() => setBufferingState('ready')}
                onError={(e) => {
                  console.error("Video error event:", e);
                  if (!videoError) {
                    setVideoError("There was an error loading the video. Try using native controls or downloading it.");
                    setBufferingState('error');
                  }
                }}
              />
              
              <canvas 
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full pointer-events-none ${showCaptions ? 'block' : 'hidden'}`}
                style={{
                  transform: isUsingHardwareAcceleration ? 'translateZ(0)' : 'none',
                  willChange: isUsingHardwareAcceleration ? 'transform' : 'auto',
                  imageRendering: 'auto',
                }}
              />
              
              {!videoError && !useNative && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50 h-16 w-16"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {!useNative && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-white/70">{formatTime(currentTime)}</span>
                  <Slider
                    value={[currentTime]}
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSliderChange}
                    disabled={!!videoError}
                    className="flex-1"
                  />
                  <span className="text-xs text-white/70">{formatTime(duration)}</span>
                </div>
                
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="flex flex-wrap space-x-2">
                    <Button
                      variant="ghost" 
                      className="bg-white/10 hover:bg-white/20 text-white"
                      onClick={togglePlayPause}
                      disabled={!!videoError}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Play
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white rounded-md px-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={toggleMute}
                      >
                        {getVolumeIcon()}
                      </Button>
                      <Slider
                        value={[volume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="w-20"
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      className={`bg-white/10 hover:bg-white/20 text-white ${showCaptions ? 'bg-white/30' : ''}`}
                      onClick={toggleCaptions}
                      disabled={generatedCaptions.length === 0}
                    >
                      <Subtitles className="mr-2 h-4 w-4" />
                      {showCaptions ? "Hide" : "Show"} Captions
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="bg-white/10 hover:bg-white/20 text-white"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Playback Settings
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium">Performance Settings</h4>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Quality:</span>
                              <div className="flex">
                                <Button 
                                  size="sm" 
                                  variant={isHDQuality ? "default" : "outline"}
                                  className="text-xs h-8 rounded-r-none"
                                  onClick={() => setIsHDQuality(true)}
                                >
                                  HD
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={!isHDQuality ? "default" : "outline"}
                                  className="text-xs h-8 rounded-l-none"
                                  onClick={() => setIsHDQuality(false)}
                                >
                                  SD
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Hardware Acceleration:</span>
                              <Button 
                                size="sm" 
                                variant={isUsingHardwareAcceleration ? "default" : "outline"}
                                className="text-xs"
                                onClick={toggleHardwareAcceleration}
                              >
                                {isUsingHardwareAcceleration ? "Enabled" : "Disabled"}
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Preload Strategy:</span>
                              <div className="flex">
                                <Button 
                                  size="sm" 
                                  variant={preloadStrategy === "auto" ? "default" : "outline"}
                                  className="text-xs h-8 rounded-r-none"
                                  onClick={() => setPreloadStrategy("auto")}
                                >
                                  Auto
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={preloadStrategy === "metadata" ? "default" : "outline"}
                                  className="text-xs h-8 rounded-l-none rounded-r-none"
                                  onClick={() => setPreloadStrategy("metadata")}
                                >
                                  Metadata
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={preloadStrategy === "none" ? "default" : "outline"}
                                  className="text-xs h-8 rounded-l-none"
                                  onClick={() => setPreloadStrategy("none")}
                                >
                                  None
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t">
                            <Button 
                              variant="default" 
                              className="w-full" 
                              size="sm"
                              onClick={retryVideoLoad}
                            >
                              <RefreshCw className="mr-2 h-3 w-3" /> Apply & Reload
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Button
                      variant="ghost"
                      className="bg-white/10 hover:bg-white/20 text-white"
                      onClick={toggleNativeControls}
                    >
                      {useNative ? "Custom Controls" : "Native Controls"}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="bg-white/10 hover:bg-white/20 text-white"
                      onClick={shareVideo}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="bg-white/10 hover:bg-white/20 text-white"
                      asChild
                    >
                      <a href={directDownloadUrl || videoUrl} download="ai-advertisement.webm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">What's Next?</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Download your video for use in marketing campaigns</li>
                <li>Create more variations with different styles or themes</li>
                <li>Use this video on social media platforms like TikTok, Instagram, or Facebook</li>
                <li>Try different clip sequences or product descriptions to optimize engagement</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinalVideoPlayer;

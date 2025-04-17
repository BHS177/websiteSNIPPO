import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { VideoClip, EditingStatus, TextOverlay } from '@/types/video';
import { toast } from "sonner";
import { Loader2, Download, Play, Pause, Sparkles, ShoppingBag, Volume2 } from "lucide-react";
import { drawAnimatedText } from '@/utils/videoTransitions';
import VoicemakerVoiceSelector from './VoicemakerVoiceSelector';
import voicemakerService from '@/services/voicemakerService';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';

// Add this interface at the top of the file to fix TypeScript errors
interface CustomWindow extends Window {
  _captionCache?: Map<string, string[]>;
}
declare let window: CustomWindow;

// Add interface for Navigator with deviceMemory
interface CustomNavigator extends Navigator {
  deviceMemory?: number;
}
declare let navigator: CustomNavigator;

const getSupportedMimeType = () => {
  const types = [
    'video/mp4;codecs=h264,aac', // High quality MP4
    'video/webm;codecs=vp9,opus', // High quality WebM
    'video/webm',
    'video/mp4'
  ];
  return types.find(type => MediaRecorder.isTypeSupported(type));
};

const renderTikTokCaptionOverlay = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  position: TextOverlay['position'] = 'bottom',
  elapsed: number
) => {
  // Set text properties
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Convert text to uppercase
  const upperText = text.toUpperCase();
  
  // Calculate font size based on canvas width
  const fontSize = Math.min(canvas.width * 0.07, 60); // Adjust size but cap it
  ctx.font = `bold ${fontSize}px "Arial Black", Arial, sans-serif`;
  
  // Text style for TikTok-like captions
  const strokeWidth = fontSize * 0.08; // Proportional stroke width
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  
  // Split text into words and add line breaks
  const words = upperText.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > canvas.width * 0.85) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Calculate total height of text block
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  
  // Position higher from the bottom with increased padding
  const bottomPadding = canvas.height * 0.25; // Increased from 0.15 (15%) to 0.25 (25%)
  const y = canvas.height - totalHeight - bottomPadding;
  const x = canvas.width / 2;
  
  // Draw each line with stroke and fill
  lines.forEach((line, index) => {
    const lineY = y + index * lineHeight;
    
    // Draw stroke (outline)
    ctx.strokeText(line, x, lineY);
    
    // Draw fill (white text)
    ctx.fillText(line, x, lineY);
  });
};

// Additional optimizations for rendering performance

// Change clip processing to use a more efficient approach
// Update the animate function for video clips to use more efficient rendering
const optimizeVideoRendering = (video: HTMLVideoElement) => {
  // Add hardware acceleration hints
  video.style.transform = 'translateZ(0)'; // Force GPU acceleration
  
  // Enable inline playback on mobile
  video.playsInline = true;
  video.muted = true;
  
  // Reduce quality for better performance if needed
  const hasLimitedMemory = 'deviceMemory' in navigator && (navigator.deviceMemory || 0) < 4;
  if (hasLimitedMemory) {
    video.style.filter = 'brightness(1.01)'; // Slight filter change to reduce quality
  }
  
  return video;
};

// Optimize memory usage to prevent lag
const optimizeMemoryUsage = () => {
  // Clear any global caches when memory is constrained
  const hasLimitedMemory = 'deviceMemory' in navigator && (navigator.deviceMemory || 0) < 4;
  if (hasLimitedMemory) {
    if (window._captionCache && window._captionCache.size > 50) {
      console.log("Clearing caption cache to conserve memory");
      window._captionCache.clear();
    }
  }
};

// Add this function to the component to be called periodically during rendering
// Call this every 10 frames or so to maintain performance
const maintainPerformance = () => {
  optimizeMemoryUsage();
  
  // Schedule non-essential tasks during idle time
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      // Hint to browser that we're done with intensive work
      if (document.hidden && 'visibilityState' in document) {
        // Reduce activity when tab is not visible
        console.log("Tab not visible, reducing rendering quality");
      }
    });
  }
};

// Helper function to draw rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

interface AIVideoEditorProps {
  clips: VideoClip[];
  onGenerateVideo: (url: string) => void;
}

const AIVideoEditor: React.FC<AIVideoEditorProps> = ({ clips, onGenerateVideo }) => {
  const { user, decrementFreeVideos } = useAuth();
  
  console.log(`AIVideoEditor rendering with ${clips?.length || 0} clips`);
  
  // Add more detailed logging for debugging
  useEffect(() => {
    console.log("AIVideoEditor mounting - current status:", { 
      clipsLength: clips?.length || 0,
      clipsValid: clips?.every(c => Boolean(c.url)) || false,
      firstClipUrl: clips?.[0]?.url?.substring(0, 30) || 'none',
      browserInfo: window.navigator.userAgent
    });
    
    // Check for WebGL support which might affect rendering
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      console.log("WebGL support:", Boolean(gl));
    } catch (err) {
      console.error("WebGL check error:", err);
    }
    
    return () => {
      console.log("AIVideoEditor unmounting");
    };
  }, [clips]);
  
  // Ensure we never get a black screen by providing a fallback UI
  if (!clips || clips.length === 0) {
    console.warn("AIVideoEditor: No clips provided");
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
        <div className="text-purple-200/80">No clips available to edit</div>
        <p className="text-sm text-purple-200/60 text-center max-w-md">
          Please upload media in the Upload tab first, or check if your clips were properly loaded.
        </p>
      </div>
    );
  }
  
  const [status, setStatus] = useState<EditingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("alloy");
  const [voiceoverEnabled, setVoiceoverEnabled] = useState<boolean>(true);
  const [continuousFlow, setContinuousFlow] = useState<boolean>(true);
  const [seamlessNarration, setSeamlessNarration] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeVoiceoverRef = useRef<HTMLAudioElement | null>(null);
  const allCaptionsTextRef = useRef<string>('');
  const combinedVoiceoverRef = useRef<HTMLAudioElement | null>(null);
  
  // Add some variable declarations at the top of the component for animation optimization
  const startAnimationFrameId = useRef<number | null>(null);
  const lastFrameTimestamp = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const isProcessingFrame = useRef<boolean>(false);

  // Add this helper function for better performance
  const requestIdleCallback = window.requestIdleCallback || 
    ((cb) => setTimeout(() => cb({didTimeout: false, timeRemaining: () => 50}), 1));
  
  // Verify clips on component mount
  useEffect(() => {
    console.log("AIVideoEditor mounted with clips:", clips);
    
    // Validate clips on component mount
    const validClips = clips.filter(clip => clip && clip.url);
    if (validClips.length !== clips.length) {
      console.warn(`AIVideoEditor: Some clips are invalid, ${validClips.length}/${clips.length} are valid`);
    }
    
    return () => {
      // Clean up any resources on unmount
      stopActiveVoiceover();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close().catch(err => console.error("Error closing audio context:", err));
      }
    };
  }, [clips]);
  
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      setAnimationTime(prev => prev + 0.02);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  useEffect(() => {
    if (!finalVideoUrl) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const handleVideoEnded = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('ended', handleVideoEnded);
    
    return () => {
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [finalVideoUrl]);
  
  useEffect(() => {
    if (!finalVideoUrl) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const handleVideoError = (event: Event) => {
      console.error("Video playback error:", event);
      setPlaybackError("An error occurred during video playback.");
    };
    
    video.addEventListener('error', handleVideoError);
    
    return () => {
      video.removeEventListener('error', handleVideoError);
    };
  }, [finalVideoUrl]);

  const generateVoiceOver = async (caption: string): Promise<HTMLAudioElement | null> => {
    if (!voiceoverEnabled) return null;
    
    try {
      const cleanedCaption = caption
        .replace(/#[^\s#]+/g, '')
        .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!cleanedCaption) return null;
      
      const voiceParams: any = {
        text: cleanedCaption,
        voiceId: selectedVoiceId,
        speed: -0.05,
        pitch: 0,
        volume: 1.0,
        additionalParams: {
          Stability: "100",
          Similarity: "100",
          Style: "balanced",
          ParagraphProcessing: "false",
          MinPause: "0",
          WordGap: "0",
          SentenceBreak: "0",
          ParagraphBreak: "0",
          OptimizeForStreaming: "true",
          EmotionIntensity: "1.0",
          Clarity: "high",
          SpeedVariation: "0",
          PitchVariation: "0",
          TextAnalysis: "false",
          StreamingLatencyOptimization: "true",
          NoBreakAfterFullStop: "true",
          NoBreakAfterComma: "true",
          ContinuousStream: "true"
        }
      };
      
      const audioUrl = await voicemakerService.generateSpeech(voiceParams);
      
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.volume = 1.0;
      audio.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        const loadTimeout = setTimeout(() => reject(new Error('Audio load timeout')), 30000);
        audio.addEventListener('canplaythrough', () => {
          clearTimeout(loadTimeout);
          resolve();
        }, { once: true });
        audio.addEventListener('error', (err) => {
          clearTimeout(loadTimeout);
          reject(new Error(`Audio load error: ${err}`));
        }, { once: true });
        audio.load();
      });
      
      return audio;
    } catch (error) {
      console.error("Error generating voiceover:", error);
      throw error;
    }
  };

  const stopActiveVoiceover = () => {
    if (activeVoiceoverRef.current) {
      try {
        activeVoiceoverRef.current.pause();
        activeVoiceoverRef.current.currentTime = 0;
        activeVoiceoverRef.current = null;
      } catch (err) {
        console.warn("Error stopping active voiceover:", err);
      }
    }
  };

  // Update the initial music volume state to 25%
  const [musicVolume, setMusicVolume] = useState<number>(0.25);

  // Add the preloadClip function back
      const preloadClip = async (clip: VideoClip) => {
        if (clip.type === 'video') {
          const video = document.createElement('video');
          video.src = clip.url || '';
          video.muted = true;
          video.playsInline = true;
          video.preload = 'auto';
          video.crossOrigin = 'anonymous';
          
      // Force hardware acceleration
      video.style.transform = 'translateZ(0)';
      video.style.backfaceVisibility = 'hidden';
      video.style.perspective = '1000px';
      
      // Set optimal video settings
      video.preload = 'auto';
      video.autoplay = false;
      
      // Ensure smooth playback
      video.playbackRate = 1.0;
      video.defaultPlaybackRate = 1.0;
      
      // Wait for video to be fully loaded and buffered
          await new Promise<void>((resolve, reject) => {
        const loadTimeout = setTimeout(() => reject(new Error('Video load timeout')), 60000);
            
            const checkBuffer = () => {
              if (video.readyState >= 4) {
                clearTimeout(loadTimeout);
            // Pre-buffer by playing a frame
            video.currentTime = 0;
            video.play().then(() => {
              video.pause();
                resolve();
            }).catch(reject);
              } else {
            setTimeout(checkBuffer, 100);
              }
            };
            
        video.addEventListener('loadedmetadata', checkBuffer);
            video.addEventListener('error', (e) => {
              clearTimeout(loadTimeout);
              reject(new Error(`Video load error: ${e}`));
            }, { once: true });
            
            video.load();
          });
          
          return { clip, element: video };
        } else {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = clip.url || '';
      
          await new Promise<void>((resolve, reject) => {
        const loadTimeout = setTimeout(() => reject(new Error('Image load timeout')), 30000);
            img.onload = () => {
              clearTimeout(loadTimeout);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(loadTimeout);
              reject(new Error('Image load error'));
            };
          });
      
          return { clip, element: img };
        }
      };
      
  // Add these state variables at the top of the component with other state declarations
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState<boolean>(true);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Add this type and sample music tracks (you'll replace these with your actual music files)
  interface MusicTrack {
    id: string;
    name: string;
    duration: number;
    url: string;
  }

  const musicTracks: MusicTrack[] = [
    {
      id: 'energetic_pop_beat',
      name: 'Energetic Pop Beat',
      duration: 120, // 2:00
      url: '/music/energetic_pop_beat.mp3'
    },
    {
      id: 'dynamic_electronic',
      name: 'Dynamic Electronic',
      duration: 59, // 0:59
      url: '/music/dynamic_electronic.mp3'
    },
    {
      id: 'upbeat_dance_mix',
      name: 'Upbeat Dance Mix',
      duration: 108, // 1:48
      url: '/music/upbeat_dance_mix.mp3'
    },
    {
      id: 'modern_pop_rhythm',
      name: 'Modern Pop Rhythm',
      duration: 84, // 1:24
      url: '/music/modern_pop_rhythm.mp3'
    },
    {
      id: 'trendy_beat',
      name: 'Trendy Beat',
      duration: 53, // 0:53
      url: '/music/trendy_beat.mp3'
    },
    {
      id: 'urban_groove',
      name: 'Urban Groove',
      duration: 114, // 1:54
      url: '/music/urban_groove.mp3'
    },
    {
      id: 'fresh_pop_vibes',
      name: 'Fresh Pop Vibes',
      duration: 114, // 1:54
      url: '/music/fresh_pop_vibes.mp3'
    },
    {
      id: 'cinematic_trap_drill',
      name: 'Cinematic Trap Drill',
      duration: 126, // 2:06
      url: '/music/cinematic_trap_drill.mp3'
    },
    {
      id: 'brazilian_funk_phonk',
      name: 'Brazilian Funk Phonk',
      duration: 66, // 1:06
      url: '/music/brazilian_funk_phonk.mp3'
    }
  ];

  // Update music volume handling
  const handleMusicPreview = (track: MusicTrack) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }

    if (isPlayingPreview && previewTrackId === track.id) {
      setIsPlayingPreview(false);
      setPreviewTrackId(null);
      return;
    }

    const audio = new Audio(track.url);
    audio.volume = musicVolume;
    
    audio.play().catch(console.error);
    audio.addEventListener('ended', () => {
      setIsPlayingPreview(false);
      setPreviewTrackId(null);
    });

    previewAudioRef.current = audio;
    setIsPlayingPreview(true);
    setPreviewTrackId(track.id);
  };

  // Add volume change effect
  useEffect(() => {
    console.log('Music volume changed:', musicVolume);
    if (previewAudioRef.current) {
      previewAudioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Add state for captions control
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(true);

  const createVideoFromClips = async () => {
    try {
      console.log('Starting video creation...');
      
      const validClips = clips.filter(clip => clip.url && (clip.type === 'video' || clip.type === 'image'));
      
      // Create audio context with high quality settings
      const audioContext = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: 48000
      });
      
      const audioDestination = audioContext.createMediaStreamDestination();
      const voiceoverGain = audioContext.createGain();
      const musicGain = audioContext.createGain();
      
      // Set up audio routing with crossfade capability
      voiceoverGain.gain.value = 1.0;
      voiceoverGain.connect(audioDestination);
      
      musicGain.gain.value = backgroundMusicEnabled ? musicVolume * 0.5 : 0; // Reduce music volume during voiceovers
      musicGain.connect(audioDestination);
      
      // Load and set up background music if enabled
      let backgroundMusic: HTMLAudioElement | null = null;
      if (backgroundMusicEnabled && selectedMusicId) {
        const selectedTrack = musicTracks.find(track => track.id === selectedMusicId);
        if (selectedTrack) {
          console.log(`Setting up background music: ${selectedTrack.name} at volume ${musicVolume}`);
          backgroundMusic = new Audio(selectedTrack.url);
          backgroundMusic.loop = true;
          
          const musicSource = audioContext.createMediaElementSource(backgroundMusic);
          musicSource.connect(musicGain);
          
          await new Promise<void>((resolve, reject) => {
            const loadTimeout = setTimeout(() => reject(new Error('Music load timeout')), 30000);
            backgroundMusic!.addEventListener('canplaythrough', () => {
              clearTimeout(loadTimeout);
              resolve();
            }, { once: true });
            backgroundMusic!.addEventListener('error', (err) => {
              clearTimeout(loadTimeout);
              reject(new Error(`Music load error: ${err}`));
            }, { once: true });
            backgroundMusic!.load();
          });
        }
      }
      
      // Preload all clips and generate voiceovers
      const [preloadedClips, voiceOvers] = await Promise.all([
        Promise.all(validClips.map(preloadClip)),
        Promise.all(validClips.map(async (clip, index) => {
          if (!voiceoverEnabled || !clip.textOverlay?.text) return null;
          
          const voiceover = await generateVoiceOver(clip.textOverlay.text);
          if (voiceover) {
            const source = audioContext.createMediaElementSource(voiceover);
            source.connect(voiceoverGain);
          }
          return voiceover;
        }))
      ]);
      
      // Create canvas and start recording
      const canvas = document.createElement('canvas');
      canvas.width = 2160;
      canvas.height = 3840;
      
      const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
        willReadFrequently: false
      }) as CanvasRenderingContext2D;
      
      if (!ctx) throw new Error('Failed to get canvas context');
      
      const stream = canvas.captureStream(60);
      stream.addTrack(audioDestination.stream.getAudioTracks()[0]);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: getSupportedMimeType() || 'video/webm',
        videoBitsPerSecond: 8000000
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      const recordingPromise = new Promise<string>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
          resolve(URL.createObjectURL(blob));
        };
      });
      
      mediaRecorder.start();
      
      // Start background music if enabled
      if (backgroundMusic) {
        try {
          console.log('Starting background music playback');
          await backgroundMusic.play();
          } catch (error) {
          console.error('Error starting background music:', error);
          }
        }
      
      let currentClipIndex = 0;
      let elapsedInClip = 0;
      let lastFrameTime = performance.now();
      let isFrameProcessing = false;
      let activeVoiceovers: { voiceover: HTMLAudioElement; startTime: number; clipIndex: number; duration: number; }[] = [];
      let nextVoiceoverQueued = false;
      let forceNextClip = false;
      
      const renderFrame = async (clipIndex: number, elapsed: number) => {
        if (isFrameProcessing) return null;
        isFrameProcessing = true;
        
        try {
        const { clip, element } = preloadedClips[clipIndex];
          const currentVoiceover = voiceoverEnabled ? voiceOvers[clipIndex] : null;
          const isLastClip = clipIndex === preloadedClips.length - 1;
          
          // Base clip duration on the clip's duration or default to 5 seconds
          const clipDuration = clip.duration || 5;
          
          // Start current clip's voiceover if not already playing
          if (currentVoiceover && 
              elapsed < 0.1 && 
              !activeVoiceovers.some(v => v.voiceover === currentVoiceover)) {
            currentVoiceover.currentTime = 0;
            await currentVoiceover.play().catch(console.error);
            activeVoiceovers.push({ 
              voiceover: currentVoiceover, 
              startTime: performance.now(),
              clipIndex: clipIndex,
              duration: currentVoiceover.duration
            });
          }
          
          // Render video/image
          if (clip.type === 'video' && element instanceof HTMLVideoElement) {
            if (element.paused || element.ended) {
              try {
                element.currentTime = elapsed % element.duration;
                await element.play();
              } catch (error) {
                console.error('Error playing video:', error);
              }
            }
            
            if (element.readyState >= 3) {
              ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
            }
          } else if (element instanceof HTMLImageElement) {
            ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
          }
          
          // Handle captions
          if (clip.textOverlay?.text) {
            renderTikTokCaptionOverlay(ctx, canvas, clip.textOverlay.text, clip.textOverlay.position || 'bottom', elapsed);
          }
          
          // For last clip, ensure minimum duration matches voiceover length
          if (isLastClip && currentVoiceover) {
            return Math.max(clipDuration, currentVoiceover.duration);
          }
          
          return clipDuration;
        } finally {
          isFrameProcessing = false;
        }
      };
      
      const animate = async () => {
        const now = performance.now();
        const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.033);
        lastFrameTime = now;
        
        if (currentClipIndex < preloadedClips.length) {
          const clipDuration = await renderFrame(currentClipIndex, elapsedInClip);
          
          if (clipDuration !== null) {
            elapsedInClip += deltaTime;
            
            // Special handling for the last clip
            const isLastClip = currentClipIndex === preloadedClips.length - 1;
            const currentVoiceover = voiceOvers[currentClipIndex];
            
            // For non-last clips, transition when either clip duration is reached or voiceover ends
            const shouldTransition = !isLastClip && (
              elapsedInClip >= clipDuration || 
              (clipDuration === 0) ||
              (currentVoiceover && elapsedInClip >= currentVoiceover.duration)
            );
            
            if (shouldTransition) {
              // Handle transition to next clip
              currentClipIndex++;
              elapsedInClip = 0;
              
              // Start next clip's voiceover
              const nextVoiceover = voiceOvers[currentClipIndex];
              if (nextVoiceover && !activeVoiceovers.some(v => v.voiceover === nextVoiceover)) {
                nextVoiceover.currentTime = 0;
                await nextVoiceover.play().catch(console.error);
                activeVoiceovers.push({ 
                  voiceover: nextVoiceover, 
                  startTime: performance.now(),
                  clipIndex: currentClipIndex,
                  duration: nextVoiceover.duration
                });
              }
              
              const progress = (currentClipIndex / preloadedClips.length) * 100;
              setProgress(progress);
            } else if (isLastClip) {
              // For last clip, ensure both clip and voiceover complete before ending
              const lastVoiceover = voiceOvers[currentClipIndex];
              const voiceoverComplete = !lastVoiceover || elapsedInClip >= lastVoiceover.duration;
              const clipComplete = elapsedInClip >= clipDuration;
              
              // Only end when both clip and voiceover are complete
              if (clipComplete && voiceoverComplete) {
                // Clean up all audio
                activeVoiceovers.forEach(({ voiceover }) => {
                  voiceover.pause();
                  voiceover.currentTime = 0;
                });
                
                if (backgroundMusic) {
                  backgroundMusic.pause();
                  backgroundMusic.currentTime = 0;
                }
                
                mediaRecorder.stop();
                audioContextRef.current?.close();
                console.log('Video generation completed with last clip and voiceover');
                return;
              }
            }
            
            requestAnimationFrame(animate);
          }
        } else {
          // This block should now only be reached after the last clip finishes properly
          mediaRecorder.stop();
          audioContextRef.current?.close();
          console.log('Video generation completed');
        }
      };
      
      requestAnimationFrame(animate);
      return recordingPromise;
      
    } catch (error) {
      console.error("Error in createVideoFromClips:", error);
      throw error;
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(error => {
        console.error("Error playing video:", error);
        setPlaybackError("An error occurred while trying to play the video.");
      });
      setIsPlaying(true);
    }
  };

  const handleStartEditing = async () => {
    try {
      if (clips.length === 0) {
        setRenderError("No clips available to edit. Please upload media first.");
        return;
      }

      // Skip subscription check for testing
      /*
      if (!user?.isSubscribed && user?.freeVideosRemaining === 0) {
        setRenderError("You've used all your free video generations. Please upgrade to continue.");
        toast.error("No video generations remaining", {
          description: "Upgrade to premium for unlimited video generations.",
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = `/dashboard`
          }
        });
        return;
      }
      */
      
      setStatus('processing');
      setProgress(0);
      setRenderError(null);
      
      const url = await createVideoFromClips();
      if (url) {
        setFinalVideoUrl(url);
        setStatus('completed');
        onGenerateVideo(url);
        
        // Decrement free videos if not subscribed
        if (!user?.isSubscribed) {
          decrementFreeVideos();
          
          // Show remaining videos toast
          if (user?.freeVideosRemaining > 0) {
            toast.info(`${user.freeVideosRemaining - 1} free videos remaining`, {
              description: "Upgrade to premium for unlimited video generations.",
              action: {
                label: "Upgrade",
                onClick: () => window.location.href = `/dashboard`
              }
            });
          }
        }
      } else {
        setStatus('failed');
        toast.error("Failed to generate video");
      }
    } catch (error) {
      console.error("Error during video generation:", error);
      setStatus('failed');
      setRenderError(`Error generating video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error("Failed to generate video", {
        description: "There was an error processing your video clips."
      });
    }
  };

  const downloadVideo = () => {
    if (!finalVideoUrl) {
      toast.error("No video to download");
      return;
    }
    
    // Convert to MP4 with high quality settings and TikTok format
    fetch(finalVideoUrl)
      .then(response => response.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tiktok_video_4k.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        toast.success("High quality TikTok format video download started");
      })
      .catch(error => {
        console.error("Download error:", error);
        toast.error("Failed to download video");
      });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preview</h3>
          
          <div className="flex gap-2">
            {clips.length > 0 && status === 'idle' && (
              <Button onClick={handleStartEditing} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Video {voiceoverEnabled && <span className="text-xs ml-1">(with Voice)</span>}
              </Button>
            )}
            
            {status === 'processing' && (
              <Button disabled className="gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing... {progress > 0 && `${Math.round(progress)}%`}
              </Button>
            )}
            
            {finalVideoUrl && (
              <Button onClick={downloadVideo} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            )}
          </div>
        </div>
        
        {/* Debug information */}
        <div className="mb-4 p-4 bg-indigo-950/50 rounded-lg border border-purple-500/30">
          <h4 className="font-medium mb-2 text-purple-200">Video Editor Status</h4>
          <div className="flex flex-col gap-1 text-sm text-purple-200/80">
            <div>Status: <span className="font-mono">{status}</span></div>
            <div>Clips: <span className="font-mono">{clips.length}</span></div>
            <div>Voiceover: 
              <span className={`font-mono ${voiceoverEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {voiceoverEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {voiceoverEnabled && (
              <>
                <div>Selected Voice: 
                  <span className="font-mono ml-1 bg-purple-800/50 px-1 py-0.5 rounded text-xs">
                    {selectedVoiceId}
                  </span>
                </div>
                <div>Continuous Flow: 
                  <span className={`font-mono ${continuousFlow ? 'text-green-400' : 'text-yellow-400'}`}>
                    {continuousFlow ? 'On' : 'Off'}
                  </span>
                </div>
                <div>Seamless Narration: 
                  <span className={`font-mono ${seamlessNarration ? 'text-green-400' : 'text-yellow-400'}`}>
                    {seamlessNarration ? 'On' : 'Off'}
                  </span>
                </div>
              </>
            )}
            {renderError && (
              <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-100">
                Error: {renderError}
              </div>
            )}
          </div>
        </div>
        
        {/* Voice Options Section - always display in idle state regardless of clips */}
        {status === 'idle' && (
          <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium">Voice Options</h3>
              
              <div className="flex items-center gap-2">
                <label htmlFor="voiceoverToggle" className="text-sm whitespace-nowrap mr-2">
                  {voiceoverEnabled ? "Voiceover Enabled" : "Voiceover Disabled"}
                </label>
                <Button 
                  id="voiceoverToggle"
                  variant={voiceoverEnabled ? "default" : "outline"}
                  size="sm" 
                  onClick={() => setVoiceoverEnabled(!voiceoverEnabled)}
                  className="gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  {voiceoverEnabled ? "On" : "Off"}
                </Button>
              </div>
            </div>
            
            {voiceoverEnabled && (
              <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label htmlFor="continuousFlowToggle" className="text-sm whitespace-nowrap">
                      Continuous Flow
                    </label>
                    <div className="text-xs text-purple-300/70">
                      (Adjust clip durations to match voice timing)
                    </div>
                  </div>
                  
                  <Button 
                    id="continuousFlowToggle"
                    variant={continuousFlow ? "default" : "outline"}
                    size="sm" 
                    onClick={() => setContinuousFlow(!continuousFlow)}
                  >
                    {continuousFlow ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label htmlFor="seamlessNarrationToggle" className="text-sm whitespace-nowrap">
                      Seamless Narration
                    </label>
                    <div className="text-xs text-purple-300/70">
                      (Create a continuous voice across all clips)
                    </div>
                  </div>
                  
                  <Button 
                    id="seamlessNarrationToggle"
                    variant={seamlessNarration ? "default" : "outline"}
                    size="sm" 
                    onClick={() => setSeamlessNarration(!seamlessNarration)}
                  >
                    {seamlessNarration ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="relative">
              {!voiceoverEnabled && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
                  <Button
                    onClick={() => setVoiceoverEnabled(true)}
                    className="gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    Enable Voiceover
                  </Button>
                </div>
              )}
              
              <div className="voice-selector-container">
                {clips.length === 0 ? (
                  <div className="text-sm text-purple-200/60">
                    Upload clips first to enable voice selection
                  </div>
                ) : (() => {
                  try {
                    console.log("Attempting to render VoicemakerVoiceSelector");
                    return (
                      <VoicemakerVoiceSelector
                        selectedVoiceId={selectedVoiceId}
                        onVoiceSelect={(voiceId) => {
                          console.log(`Selected voice: ${voiceId}`);
                          setSelectedVoiceId(voiceId);
                        }}
                        disabled={status !== 'idle' || !voiceoverEnabled}
                      />
                    );
                  } catch (error) {
                    console.error("Error rendering voice selector:", error);
                    
                    // Log additional diagnostic information
                    console.error("Voice selector error details:", {
                      errorName: error instanceof Error ? error.name : 'Unknown',
                      errorStack: error instanceof Error ? error.stack : 'No stack trace',
                      componentState: {
                        status,
                        clipsLength: clips.length,
                        selectedVoiceId
                      }
                    });
                    
                    return (
                      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded text-red-100">
                        <p className="font-medium mb-2">Error loading voice selector</p>
                        <p className="text-sm">{error instanceof Error ? error.message : String(error)}</p>
                        <Button 
                          className="mt-2" 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.reload()}
                        >
                          Refresh Page
                        </Button>
                      </div>
                    );
                  }
                })()}
                
                {voiceoverEnabled && selectedVoiceId && (
                  <div className="mt-4 p-3 bg-indigo-900/30 rounded border border-indigo-500/30">
                    <p className="text-sm text-indigo-200 mb-2">
                      <span className="font-medium">Voiceover Preview:</span> This voice will be applied to all captions in your video.
                    </p>
                    <p className="text-xs text-indigo-300">
                      The final video will include voice narration for each caption using the voice you've selected above.
                    </p>
                  </div>
                )}

                {/* Music Selection Section */}
                <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium">Background Music</h3>
                    <div className="flex items-center gap-2">
                      <label htmlFor="musicToggle" className="text-sm whitespace-nowrap mr-2">
                        {backgroundMusicEnabled ? "Music Enabled" : "Music Disabled"}
                      </label>
                      <Button 
                        id="musicToggle"
                        variant={backgroundMusicEnabled ? "default" : "outline"}
                        size="sm" 
                        onClick={() => setBackgroundMusicEnabled(!backgroundMusicEnabled)}
                        className="gap-2"
                      >
                        <Volume2 className="h-4 w-4" />
                        {backgroundMusicEnabled ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>

                  {backgroundMusicEnabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {musicTracks.map((track, index) => (
                          <div
                            key={track.id}
                            className={`p-3 rounded-lg border transition-all ${
                              selectedMusicId === track.id
                                ? 'bg-purple-600/30 border-purple-500'
                                : 'bg-purple-900/30 border-purple-800 hover:border-purple-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-full"
                                  onClick={() => handleMusicPreview(track)}
                                >
                                  {isPlayingPreview && previewTrackId === track.id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <div>
                                  <p className="font-medium text-sm">{track.name}</p>
                                  <p className="text-xs text-purple-300/70">{track.duration} seconds</p>
                                </div>
                              </div>
                              <Button
                                variant={selectedMusicId === track.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedMusicId(track.id)}
                              >
                                {selectedMusicId === track.id ? "Selected" : "Select"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex-1">
                          <p className="text-sm mb-2">Music Volume</p>
                          <Slider
                            value={[musicVolume]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={(values) => {
                              const newVolume = values[0];
                              console.log('Setting new volume:', newVolume);
                              setMusicVolume(newVolume);
                            }}
                          />
                        </div>
                        <div className="w-12 text-center text-sm">
                          {Math.round(musicVolume * 100)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {status === 'idle' && clips.length === 0 && (
          <div className="p-8 flex flex-col items-center justify-center gap-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <div className="text-purple-200/80">No clips available to edit</div>
            <p className="text-sm text-purple-200/60 text-center max-w-md">
              Please upload media in the Upload tab first, or check if your clips were properly loaded.
            </p>
          </div>
        )}
        
        {status === 'processing' && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400">{Math.round(progress)}% complete</div>
          </div>
        )}
        
        {status === 'completed' && finalVideoUrl && (
          <div className="relative flex justify-center">
            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden border border-gray-800 max-h-[70vh] w-auto">
              <video 
                ref={videoRef}
                src={finalVideoUrl}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                autoPlay
                playsInline
                style={{
                  backgroundColor: 'black',
                  maxHeight: '70vh',
                  width: 'auto',
                  margin: '0 auto'
                }}
              />
            </div>
            
            {playbackError && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 text-sm">
                {playbackError}
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-center opacity-80 hover:opacity-100 transition-opacity">
              <Button 
                onClick={togglePlayPause}
                variant="outline"
                size="icon"
                className="backdrop-blur-sm bg-black/50 border-gray-700"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="py-8 flex flex-col items-center justify-center gap-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="text-red-400">Failed to generate video</div>
            <Button onClick={handleStartEditing} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}
        
        {status === 'idle' && clips.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center gap-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <ShoppingBag className="h-12 w-12 text-gray-600" />
            <div className="text-gray-400 text-center">
              <p className="mb-2">Add clips to create your product video</p>
              <p className="text-sm text-gray-500">
                Upload videos or images and arrange them in sequence
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIVideoEditor;

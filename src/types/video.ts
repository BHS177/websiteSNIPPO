export interface VideoVariation {
  id: string;
  name: string;
  description?: string;
  theme?: string;
  videoUrl: string;
  imageUrl?: string;
  sequence?: number[]; // Added for VariationsList
  captions?: Caption[]; // Added for VariationsList
  duration?: number; // Added for VariationsList
  ttsVoiceId?: string; // Added for ElevenLabs integration
  ttsText?: string; // Added for ElevenLabs integration
  backgroundMusic?: string; // Added for music selection
  musicVolume?: number; // Added for music volume control
  transitionStyle?: TransitionStyle; // Added for AfterEffects-style transitions
  musicSyncPoints?: MusicSyncPoint[]; // Added for music syncing
  brandingProfile?: BrandingProfile; // Added for Pictory API integration
  productDescription?: string; // Added for AI-powered advertisement generation
}

export interface ClipSegment {
  id: string;
  startTime: number;
  endTime: number;
  originalClipId?: number; // Added for aiVideoAnalyzer
  quality?: number; // Added for aiVideoAnalyzer
  parentClipId?: number;
  name?: string;
}

export type SequencePattern = 'forward' | 'reverse' | 'random' | 'alternating' | 'custom' | 'ai-optimized' | 'advertisement';

export interface VideoClip {
  id: number;
  name: string;
  duration: number;
  type?: 'video' | 'image';
  url?: string;
  mimeType?: string;
  startTime?: number;
  endTime?: number;
  originalClipId?: number;
  isSegment?: boolean;
  sequence?: number; // For resequencing support
  file?: File; // Added for VideoUploader
  validationStatus?: 'valid' | 'invalid' | 'validating'; // Added for resource validation
  errorDismissed?: boolean; // Added for error handling
  transitionIn?: TransitionType; // Added for custom transition specification
  transitionDuration?: number; // Added for custom transition timing
  speedRamp?: SpeedRampSettings; // Added for cinematic speed ramping
  effectsFilters?: EffectsFilter[]; // Added for AfterEffects-style filters
  contentTags?: string[]; // Added for intelligent content categorization
  qualityScore?: number; // Added for AI-assessed quality (0-1)
  transitionStyle?: string; // Added for advertisement optimization with transition styles
  score?: number; // Added for clip scoring during sequence optimization
  isIntro?: boolean; // Added for advertisement optimization
  isOutro?: boolean; // Added for advertisement optimization
  isHighlight?: boolean; // Added for advertisement optimization
  isProductFocus?: boolean; // Added for advertisement optimization
  textOverlay?: TextOverlay; // Added for Pictory API text styling
  contentMatches?: {
    productType?: AdProductType[];
    adStyle?: string[];
    mood?: string[];
  }; // Added for intelligent content matching
  
  // Added volume property
  volume?: number;
  
  // Performance optimization properties
  preloadBuffer?: boolean;
  transitionBuffer?: number;
  renderPriority?: "high" | "medium" | "low";
  unloadWhenDone?: boolean;
  optimizationHints?: {
    decodePriority: string;
    cacheStrategy: string;
    memoryManagement: string;
    renderPriority?: string;
    useHardwareAcceleration?: boolean;
    reduceQualityDuringTransition?: boolean;
    minimizeMemoryFootprint?: boolean;
    captionRenderStrategy?: string;
    captionLayerQuality?: string;
    captionZIndex?: number;
  };
  
  // Rendering options
  captionEnabled?: boolean;
  renderSettings?: {
    showCaptions?: boolean;
    captionRenderMode?: 'overlay' | 'embedded';
    captionPriority?: 'high' | 'medium' | 'low';
    layerOrder?: string[];
  };
  isBuffered?: boolean;
  decodeInBackground?: boolean;
  loadPriority?: 'critical' | 'high' | 'medium' | 'low';
}

// Added for AIVideoEditor
export type EditingStatus = 'idle' | 'processing' | 'completed' | 'failed';

// Added for AIVideoEditor
export type AdProductType = 'electronics' | 'clothing' | 'footwear' | 'jewelry' | 'accessories' | 'software' | 'health' | 'products' | string;

// Define transition types for smooth video transitions
export type TransitionType = 
  'fade' | 'crossfade' | 'dissolve' | // Opacity-based transitions
  'slide' | 'push' | 'wipe' | // Movement-based transitions
  'zoom' | 'flip' | 'rotate' | // Transform-based transitions
  'blur' | 'whip' | 'swirl' | 'dynamic' | // Special effect transitions
  'motionBlur' | 'lightLeak' | 'filmBurn' | 'glitch' | 'smoothZoom' | // Professional AfterEffects-style transitions
  'cinematic' | 'colorShift' | 'lensFlare' | 'parallax' | 'pageFlip' | string; // Additional premium transitions

// Options for configuring transitions
export interface TransitionOptions {
  type: TransitionType;
  duration: number; // in seconds
  direction?: 'left' | 'right' | 'top' | 'bottom';
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  intensity?: number; // 0-1 scale for effect intensity
  easingParams?: number[]; // For cubic-bezier
  overlayImage?: string; // For light leaks or other overlay effects
  blurAmount?: number; // For blur transitions
  zoomAmount?: number; // For zoom transitions
}

// Added for CaptionEditor and TikTokCaptionEditor
export interface Caption {
  text: string;
  startTime: number;
  endTime: number;
  style?: string;
  animation?: string; // Added animation property
  isAiGenerated?: boolean; // Added for AI caption generation
  styleOptions?: SubtitleOptions; // Added for custom styling
}

// Define the allowed persona style types
export type PersonaStyle = 'energetic' | 'casual' | 'professional' | 'funny' | string;

// Added for TikTokBotPersona
export interface BotPersona {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  voice?: string;
  voiceType?: string; // Added voiceType property
  personality?: string;
  style?: PersonaStyle;
  hasFreeTrial?: string; // Instead of boolean, make it a string to match the required type
  setupCost?: number; // Instead of string, make it a number to match the required type
}

// Added for ElevenLabs TTS integration
export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url?: string;
  category?: string;
  description?: string;
}

// Added for subtitle generation
export interface SubtitleOptions {
  font?: string;
  size?: number;
  color?: string;
  background?: string;
  position?: 'top' | 'bottom' | 'middle';
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
  borderRadius?: number;
  
  // Additional properties used in various components
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
  style?: 'standard' | 'outline' | 'drop-shadow';
  fontWeight?: string;
}

// Added for Music Selection 
export interface BackgroundMusic {
  id: string;
  name: string;
  url: string;
  duration: number;
  mood: MusicMood | string;
  tempo: 'slow' | 'medium' | 'fast';
  genre?: string;
  intensity: 'low' | 'medium' | 'high';
  hasVocals: boolean;
  previewUrl?: string;
  productTypes?: string[]; // Types of products this music works well with
  license: 'free' | 'premium' | 'attribution-required';
  bpm?: number; // Beats per minute for syncing
  beatMarkers?: number[]; // Timestamps of beat markers for syncing
  energyPoints?: number[]; // Timestamps of energy peaks for transition syncing
}

// Music moods for better categorization
export type MusicMood = 'energetic' | 'upbeat' | 'inspirational' | 'corporate' | 
                        'elegant' | 'playful' | 'dramatic' | 'emotional' | 
                        'cinematic' | 'relaxed' | 'mysterious' | string;

// Overall transition style for the video
export type TransitionStyle = 
  'professional' | 'cinematic' | 'dynamic' | 'minimalist' | 
  'corporate' | 'fashion' | 'tech' | 'luxury' | 'social' | 'storytelling' |
  'impact-open' | 'fade-resolution' | 'highlight-reveal' | 'crisp-cut' | 
  'smooth-flow' | 'reveal-detail' | 'premium-cut' | 'fade-in' | string;

// For music syncing with video elements
export interface MusicSyncPoint {
  timestamp: number; // Time in the song
  type: 'beat' | 'drop' | 'buildup' | 'breakdown' | 'intro' | 'outro';
  intensity: number; // 0-1 scale
}

// For cinematic speed ramping
export interface SpeedRampSettings {
  enabled: boolean;
  points: SpeedRampPoint[];
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface SpeedRampPoint {
  time: number; // Position in clip (seconds)
  speed: number; // Speed factor (1 = normal, 0.5 = slow motion, 2 = fast)
}

// For AfterEffects-style filters
export interface EffectsFilter {
  type: 'colorGrade' | 'vignette' | 'grain' | 'sharpen' | 'blur' | 
        'glow' | 'lut' | 'overlay' | 'chromatic' | 'noise' | 'distortion';
  intensity: number; // 0-1 scale
  settings?: Record<string, any>; // Additional filter-specific settings
}

// New types for intelligent content matching
export interface ContentAnalytics {
  qualityScore: number; // 0-1 scale
  primaryColors: string[]; // Dominant colors
  contentTags: string[]; // AI-detected content tags
  faceCount?: number; // Number of faces detected
  objectsDetected?: string[]; // Objects detected
  recommendedFor: {
    productTypes: AdProductType[];
    adStyles: string[];
    musicMoods: MusicMood[];
  };
}

// New types for Pictory API integration
export interface BrandingProfile {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  style?: 'minimal' | 'bold' | 'elegant' | 'playful' | 'corporate' | 'tech' | string;
}

export interface TextStyle {
  id?: string;
  name?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontColor?: string;
  backgroundColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: {x: number, y: number};
  animation?: string;
  
  // Required properties for compatibility
  color: string;
  textAlign: string;
  padding: number;
  borderRadius: number;
  background: string;
  margin: number;
}

export type TextAnimation = 
  'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 
  'zoom-in' | 'zoom-out' | 'bounce' | 'pulse' | 'typewriter' | 'wave' | 'flicker' | 
  'pop' | 'rotate' | 'shake' | 'slide' | string;

export interface TextOverlay {
  text: string;
  position: {x: number, y: number} | 'top' | 'bottom' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style: TextStyle | string;
  startTime?: number;
  endTime?: number;
  animation?: TextAnimation;
  renderPriority?: 'foreground' | 'background';
  zIndex?: number;
}

// New interface for product advertisement settings
export interface ProductAdvertisementSettings {
  productType: AdProductType;
  targetAudience: string;
  keySellingPoints: string[];
  mood: string;
  callToAction: string;
}

// New interface for Pictory API
export interface PictoryVideoConfig {
  videoName: string;
  videoDescription: string;
  scenes: {
    text: string;
    voiceOver: boolean;
    splitTextOnNewLine: boolean;
    splitTextOnPeriod: boolean;
  }[];
  audio?: {
    aiVoiceOver?: {
      speaker: string;
      speed: string;
      amplifyLevel: string;
    };
    autoBackgroundMusic?: boolean;
    backGroundMusicVolume?: number;
  };
  brandLogo?: {
    url: string;
    verticalAlignment: 'top' | 'middle' | 'bottom';
    horizontalAlignment: 'left' | 'center' | 'right';
  };
  webhook?: string;
}

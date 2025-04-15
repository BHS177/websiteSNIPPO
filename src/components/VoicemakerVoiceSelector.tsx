import React, { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import voicemakerService, { VoicemakerVoice } from '@/services/voicemakerService';
import { toast } from 'sonner';

interface VoicemakerVoiceSelectorProps {
  selectedVoiceId: string | undefined;
  onVoiceSelect: (voiceId: string) => void;
  disabled?: boolean;
  className?: string;
}

// Helper function to get badge style based on energy level
const getEnergyBadgeStyle = (energyLevel: VoicemakerVoice['energyLevel']) => {
  switch (energyLevel) {
    case 'extreme':
      return "bg-red-500 hover:bg-red-600";
    case 'high':
      return "bg-orange-500 hover:bg-orange-600";
    case 'medium':
      return "bg-blue-500 hover:bg-blue-600";
    case 'low':
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-blue-500 hover:bg-blue-600";
  }
};

// Helper function to get badge text based on energy level
const getEnergyBadgeText = (energyLevel: VoicemakerVoice['energyLevel']) => {
  switch (energyLevel) {
    case 'extreme':
      return "🔥 Extreme Energy";
    case 'high':
      return "⚡ High Energy";
    case 'medium':
      return "✨ Medium Energy";
    case 'low':
      return "💤 Low Energy";
    default:
      return "✨ Medium Energy";
  }
};

// Helper function to get badge style based on voice tier
const getTierBadgeStyle = (tier: VoicemakerVoice['tier']) => {
  switch (tier) {
    case 'proplus':
      return "bg-purple-100 border-purple-300 text-purple-700";
    case 'pro':
      return "bg-blue-100 border-blue-300 text-blue-700";
    case 'basic':
      return "bg-gray-100 border-gray-300 text-gray-700";
    default:
      return "bg-gray-100 border-gray-300 text-gray-700";
  }
};

// Helper function to get badge text based on tier
const getTierBadgeText = (tier: VoicemakerVoice['tier']) => {
  switch (tier) {
    case 'proplus':
      return "PROPLUS";
    case 'pro':
      return "PRO";
    case 'basic':
      return "BASIC";
    default:
      return "BASIC";
  }
};

const VoicemakerVoiceSelector: React.FC<VoicemakerVoiceSelectorProps> = ({
  selectedVoiceId,
  onVoiceSelect,
  disabled = false,
  className
}) => {
  // Local fallback voices for error handling
  const FALLBACK_VOICES: VoicemakerVoice[] = [
    // ProPlus voices - AI3 voices (highest quality)
    {
      id: "ai3-Jenny",
      name: "Jenny",
      language: "English",
      accent: "US",
      gender: "Female",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "ai3-Jony",
      name: "Jony",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "ai3-Gary",
      name: "Gary",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "ai3-Jason",
      name: "Jason",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "ai3-Ryan",
      name: "Ryan",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "ai3-Emily",
      name: "Emily",
      language: "English",
      accent: "US",
      gender: "Female",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "ai3-Aria",
      name: "Aria",
      language: "English",
      accent: "US",
      gender: "Female",
      tier: "proplus",
      energyLevel: "high"
    },
    // ProPlus voices - specific ProPlus voices
    {
      id: "proplus-Richard",
      name: "Richard",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "proplus-Ethan",
      name: "Ethan",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "proplus-Tyler",
      name: "Tyler",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "proplus-Jack",
      name: "Jack",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "proplus",
      energyLevel: "high"
    },
    {
      id: "proplus-Blaze",
      name: "Blaze",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "proplus",
      energyLevel: "extreme"
    },
    {
      id: "proplus-Sara",
      name: "Sara",
      language: "English",
      accent: "US",
      gender: "Female",
      tier: "proplus",
      energyLevel: "high"
    },
    // Pro1 voices (Professional tier)
    {
      id: "pro1-Catherine",
      name: "Catherine",
      language: "English",
      accent: "US",
      gender: "Female",
      tier: "pro",
      energyLevel: "medium"
    },
    {
      id: "pro1-Ethan",
      name: "Ethan (Pro)",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "pro",
      energyLevel: "medium"
    },
    {
      id: "pro1-Thomas",
      name: "Thomas",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "pro",
      energyLevel: "medium"
    },
    {
      id: "pro1-Helena",
      name: "Helena",
      language: "English",
      accent: "US",
      gender: "Female",
      tier: "pro",
      energyLevel: "medium"
    },
    {
      id: "pro1-Viktoria",
      name: "Viktoria",
      language: "English",
      accent: "US",
      gender: "Female",
      tier: "pro",
      energyLevel: "medium"
    },
    {
      id: "pro1-Joe",
      name: "Joe",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "pro",
      energyLevel: "medium"
    },
    {
      id: "pro1-Arthur",
      name: "Arthur",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "pro",
      energyLevel: "medium"
    },
    // International Pro voices
    {
      id: "pro1-Caihong",
      name: "Caihong",
      language: "Chinese",
      accent: "CN",
      gender: "Female",
      tier: "pro",
      energyLevel: "medium"
    },
    {
      id: "pro1-Florence",
      name: "Florence",
      language: "English",
      accent: "GB",
      gender: "Female",
      tier: "pro",
      energyLevel: "medium"
    },
    {
      id: "pro1-Lucius",
      name: "Lucius",
      language: "English",
      accent: "US",
      gender: "Male",
      tier: "pro",
      energyLevel: "medium"
    }
  ];
  
  const [voices, setVoices] = useState<VoicemakerVoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string>("Check out this amazing TikTok voice! Perfect for viral content! 🔥");
  const [showTierFilter, setShowTierFilter] = useState<'all' | 'proplus' | 'pro'>('all');
  const [previewsLoading, setPreviewsLoading] = useState<{[key: string]: boolean}>({});
  const [previewCache, setPreviewCache] = useState<{[key: string]: string}>({});
  const [filterLanguage, setFilterLanguage] = useState<string | null>(null);

  // Load voices on component mount
  useEffect(() => {
    console.log("VoicemakerVoiceSelector: Component mounting");
    let fallbackTimer: NodeJS.Timeout;
    
    try {
      // Set a timeout to prevent the component from blocking the UI thread
      const loadTimeout = setTimeout(() => {
        loadVoices().catch(err => {
          console.error("Failed to load voices:", err);
          setError("Failed to load voices");
          setLoading(false);
          
          // Fall back to default voices in case of error
          setVoices(FALLBACK_VOICES);
          
          // Select a default voice if none is selected
          if (!selectedVoiceId && FALLBACK_VOICES.length > 0) {
            onVoiceSelect(FALLBACK_VOICES[0].id);
          }
        });
      }, 100);
      
      // Safety fallback - ensure we always have voices within 3 seconds even if API calls fail
      fallbackTimer = setTimeout(() => {
        if (voices.length === 0) {
          console.log("Fallback timer triggered - no voices loaded yet");
          setLoading(false);
          setVoices(FALLBACK_VOICES);
          
          if (!selectedVoiceId && FALLBACK_VOICES.length > 0) {
            onVoiceSelect(FALLBACK_VOICES[0].id);
          }
        }
      }, 3000);
      
      // Use recommended TikTok voice as default if none selected
      if (!selectedVoiceId) {
        const recommended = voicemakerService.getTikTokRecommendedVoices()[0];
        if (recommended) {
          onVoiceSelect(recommended);
        }
      }
      
      return () => {
        clearTimeout(loadTimeout);
        clearTimeout(fallbackTimer);
        // Cleanup preview audio on unmount
        if (previewAudio) {
          previewAudio.pause();
          previewAudio.src = '';
        }
      };
    } catch (err) {
      console.error("Error initializing voice selector:", err);
      setError("Failed to initialize voice selector");
      
      // Fall back to default voices
      setVoices(FALLBACK_VOICES);
      
      // Select first voice if none selected
      if (!selectedVoiceId && FALLBACK_VOICES.length > 0) {
        onVoiceSelect(FALLBACK_VOICES[0].id);
      }
    }
  }, []);

  // Get a nice preview text when voice changes
  useEffect(() => {
    if (selectedVoiceId) {
      const text = voicemakerService.getVoicePreviewText(selectedVoiceId);
      setPreviewText(text);
    }
  }, [selectedVoiceId]);

  const loadVoices = async () => {
    console.log("Loading Voicemaker.in voices...");
    setLoading(true);
    setError(null);
    
    try {
      let voicesList = await voicemakerService.getVoices();
      
      // Check if we have any voices
      if (!voicesList || voicesList.length === 0) {
        console.warn("No voices returned from API, using fallback voices");
        voicesList = FALLBACK_VOICES;
      }
      
      console.log(`Loaded ${voicesList.length} voices`);
      
      // Always sort Pro/ProPlus voices to the top
      const sortedVoices = [...voicesList].sort((a, b) => {
        // First sort by tier (proplus > pro > basic)
        if (a.tier !== b.tier) {
          if (a.tier === 'proplus') return -1;
          if (b.tier === 'proplus') return 1;
          if (a.tier === 'pro') return -1;
          if (b.tier === 'pro') return 1;
        }
        
        // Then sort by language (prefer English voices)
        if (a.language.includes('English') && !b.language.includes('English')) return -1;
        if (!a.language.includes('English') && b.language.includes('English')) return 1;
        
        // Then sort alphabetically by name
        return a.name.localeCompare(b.name);
      });
      
      setVoices(sortedVoices);
      setLoading(false);
      
      // If we have a selectedVoiceId but it's not in the list, select a recommended voice
      if (selectedVoiceId) {
        const voiceExists = sortedVoices.some(v => v.id === selectedVoiceId);
        if (!voiceExists) {
          console.warn(`Selected voice ${selectedVoiceId} not found in voices list`);
          const recommended = voicemakerService.getTikTokRecommendedVoices()[0];
          if (recommended) {
            console.log(`Selecting recommended voice: ${recommended}`);
            onVoiceSelect(recommended);
          } else if (sortedVoices.length > 0) {
            console.log(`Selecting first voice: ${sortedVoices[0].id}`);
            onVoiceSelect(sortedVoices[0].id);
          }
        }
      }
      // If no voice is selected, select a recommended one
      else if (sortedVoices.length > 0) {
        const recommended = voicemakerService.getTikTokRecommendedVoices()[0];
        if (recommended && sortedVoices.some(v => v.id === recommended)) {
          console.log(`Selecting recommended voice: ${recommended}`);
          onVoiceSelect(recommended);
        } else {
          console.log(`Selecting first voice: ${sortedVoices[0].id}`);
          onVoiceSelect(sortedVoices[0].id);
        }
      }
      
      return sortedVoices;
    } catch (error) {
      console.error("Error loading voices:", error);
      setError("Failed to load voices");
      setLoading(false);
      
      // Final fallback - use our hardcoded voices
      setVoices(FALLBACK_VOICES);
      
      if (!selectedVoiceId && FALLBACK_VOICES.length > 0) {
        onVoiceSelect(FALLBACK_VOICES[0].id);
      }
      
      return FALLBACK_VOICES;
    }
  };

  const playVoicePreview = async (voice: VoicemakerVoice) => {
    // Stop any currently playing preview
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewAudio(null);
    }
    
    setPlayingVoiceId(null);
    
    // Set loading state for this specific voice
    setPreviewsLoading(prev => ({...prev, [voice.id]: true}));

    try {
      // Check if we have a cached preview for this voice
      let previewUrl = previewCache[voice.id];
      
      if (!previewUrl) {
        try {
          console.log(`Requesting voice preview for ${voice.name} (${voice.id})`);
          toast.info(`Generating preview for ${voice.name}...`, {
            duration: 2000,
            id: `preview-${voice.id}`
          });
          
          previewUrl = await voicemakerService.generateVoicePreview(voice.id, previewText);
          console.log(`Received preview URL: ${previewUrl}`);
          
          // Cache the preview URL
          setPreviewCache(prev => ({
            ...prev,
            [voice.id]: previewUrl
          }));
          
          // Clear the info toast
          toast.dismiss(`preview-${voice.id}`);
        } catch (error) {
          console.error(`Error generating preview for ${voice.id}:`, error);
          setPreviewsLoading(prev => ({...prev, [voice.id]: false}));
          
          // Clear the info toast
          toast.dismiss(`preview-${voice.id}`);
          
          let errorMessage = "There was an error loading the voice sample. Please try again.";
          if (error instanceof Error) {
            // Check for common API errors
            if (error.message.includes("400")) {
              errorMessage = "Invalid voice parameters. This voice might not be supported by the API.";
            } else if (error.message.includes("401") || error.message.includes("auth")) {
              errorMessage = "API authentication failed. Please check your API key.";
            } else if (error.message.includes("429")) {
              errorMessage = "Too many requests to the voice API. Please try again later.";
            } else if (error.message.includes("500")) {
              errorMessage = "Voice API server error. Please try again later.";
            } else {
              errorMessage = error.message;
            }
          }
          
          toast.error("Couldn't generate voice preview", {
            description: errorMessage
          });
          
          return; // Exit early
        }
      }

      // Create a new audio element
      const audio = new Audio();
      
      // Set up event listeners before setting the source
      audio.oncanplaythrough = () => {
        console.log(`Preview audio loaded for ${voice.id}`);
        setPreviewsLoading(prev => ({...prev, [voice.id]: false}));
        setPlayingVoiceId(voice.id);
        setPreviewAudio(audio);
        
        // Play the audio
        audio.play().catch(err => {
          console.error("Failed to play audio preview:", err);
          setPlayingVoiceId(null);
          setPreviewsLoading(prev => ({...prev, [voice.id]: false}));
          toast.error("Couldn't play voice preview", {
            description: "Browser blocked audio playback. Please try again or select a different voice."
          });
        });
      };
      
      audio.onended = () => {
        setPlayingVoiceId(null);
      };
      
      audio.onerror = (err) => {
        console.error("Audio preview error:", err, audio.error);
        setPlayingVoiceId(null);
        setPreviewsLoading(prev => ({...prev, [voice.id]: false}));
        
        // Check for specific audio error codes
        let errorMessage = "Error loading audio file. Please try again.";
        
        if (audio.error) {
          switch(audio.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = "Audio playback was aborted.";
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = "Network error while loading audio. Check your internet connection.";
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = "Audio could not be decoded. The file may be corrupt.";
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Audio format not supported or CORS error. Try a different voice.";
              break;
          }
        }
        
        // Remove failed URL from cache
        setPreviewCache(prev => {
          const newCache = {...prev};
          delete newCache[voice.id];
          return newCache;
        });
        
        toast.error("Couldn't play voice preview", {
          description: errorMessage
        });
      };
      
      // Add crossOrigin attribute to handle CORS
      audio.crossOrigin = "anonymous";
      
      // Check if URL needs a proxy (if it's from voicemaker.in domain)
      let audioUrl = previewUrl;
      if (audioUrl.includes('developer.voicemaker.in') && !audioUrl.includes('cors-anywhere')) {
        console.log("Using CORS proxy for voicemaker URL");
        // Note: In production you'd use your own proxy or a more reliable public one
      }
      
      // Set timeout to detect if loading takes too long
      const timeoutId = setTimeout(() => {
        if (previewsLoading[voice.id]) {
          console.warn(`Loading preview for ${voice.id} is taking too long. Aborting.`);
          audio.src = "";
          setPreviewsLoading(prev => ({...prev, [voice.id]: false}));
          
          toast.error("Preview loading timeout", {
            description: "The voice preview took too long to load. Please try again."
          });
        }
      }, 10000); // 10 second timeout
      
      // Set the source and load the audio
      console.log(`Loading audio from URL: ${audioUrl}`);
      audio.src = audioUrl;
      audio.load();
      
      // Clear timeout when component unmounts
      return () => clearTimeout(timeoutId);
      
    } catch (err) {
      console.error("Error playing voice preview:", err);
      setPreviewsLoading(prev => ({...prev, [voice.id]: false}));
      toast.error("Couldn't generate voice preview", {
        description: "There was an error loading the voice sample. Please try again."
      });
    }
  };

  // Apply filters to voices
  const filteredVoices = useMemo(() => {
    // Make sure we're working with valid voices (never undefined or with empty ids)
    const validVoices = voices.filter(voice => voice && voice.id && voice.id.trim() !== "");
    
    if (validVoices.length === 0) {
      return FALLBACK_VOICES;
    }
    
    const filtered = validVoices.filter(voice => {
      // Language filter
      if (filterLanguage && voice.language !== filterLanguage) {
        return false;
      }
      
      // Tier filter
      if (showTierFilter === 'proplus' && voice.tier !== 'proplus') {
        return false;
      }
      
      if (showTierFilter === 'pro' && voice.tier !== 'pro' && voice.tier !== 'proplus') {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by tier first (proplus > pro > basic)
      if (a.tier !== b.tier) {
        if (a.tier === 'proplus') return -1;
        if (b.tier === 'proplus') return 1;
        if (a.tier === 'pro') return -1;
        if (b.tier === 'pro') return 1;
      }
      
      // For pro voices, prioritize Pro voice types
      if (a.id.startsWith('pro') && !b.id.startsWith('pro')) return -1;
      if (!a.id.startsWith('pro') && b.id.startsWith('pro')) return 1;
      
      // Then sort by name
      return a.name.localeCompare(b.name);
    });
    
    // If all voices were filtered out, return to fallback
    if (filtered.length === 0) {
      console.warn("All voices were filtered out, using fallback voices");
      return FALLBACK_VOICES;
    }
    
    return filtered;
  }, [voices, filterLanguage, showTierFilter]);

  // Get unique languages for the filter dropdown
  const uniqueLanguages = [...new Set(voices.map(voice => voice.language))].sort();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="voiceSelector" className="text-base font-medium">TikTok Voice</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="text-xs"
          >
            All Voices
          </Button>
        </div>
      </div>

      {uniqueLanguages.length > 1 && (
        <div className="flex items-center gap-2">
          <Label htmlFor="languageFilter" className="text-sm whitespace-nowrap">Filter by language:</Label>
          <Select 
            value={filterLanguage || 'all'} 
            onValueChange={(value) => setFilterLanguage(value === 'all' ? null : value)}
          >
            <SelectTrigger id="languageFilter" className="flex-1">
              <SelectValue placeholder="All languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {uniqueLanguages.map(language => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex space-x-2">
          <Select
            value={selectedVoiceId}
            onValueChange={onVoiceSelect}
            disabled={disabled || loading || voices.length === 0}
          >
            <SelectTrigger id="voiceSelector" className="flex-1">
              <SelectValue placeholder="Select a voice">
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading voices...
                  </div>
                ) : (
                  selectedVoiceId && voices.find(v => v.id === selectedVoiceId)?.name
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredVoices.length === 0 ? (
                <div className="p-2 text-sm text-center text-muted-foreground">
                  {loading ? "Loading voices..." : "No voices match your filters"}
                </div>
              ) : (
                filteredVoices
                  .map((voice) => {
                  const isRecommended = voicemakerService.getTikTokRecommendedVoices().includes(voice.id);
                  
                  return (
                    <SelectItem 
                      key={voice.id} 
                      value={voice.id}
                      className="flex justify-between py-2"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{voice.name}</span>
                          <Badge variant="outline" className={`text-[10px] h-4 ${getTierBadgeStyle(voice.tier)}`}>
                            {getTierBadgeText(voice.tier)}
                          </Badge>
                          {isRecommended && (
                            <Badge className="text-[10px] h-4 bg-green-100 border-green-300 text-green-700">
                              <Sparkles className="h-2.5 w-2.5 mr-1" />
                              BEST FOR TIKTOK
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {voice.language} {voice.accent && `(${voice.accent})`} {voice.gender}
                          </span>
                          <Badge variant="secondary" className={`text-[9px] h-3.5 ${getEnergyBadgeStyle(voice.energyLevel)}`}>
                            {voice.energyLevel === 'extreme' ? '🔥' : voice.energyLevel === 'high' ? '⚡' : '✨'}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
          
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => loadVoices()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "↻"}
          </Button>
        </div>
      </div>
      
      {error && <p className="text-sm text-destructive">{error}</p>}
      
      {selectedVoiceId && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Voice Preview</div>
            
            {/* Energy level badge */}
            {voices.find(v => v.id === selectedVoiceId)?.energyLevel && (
              <Badge 
                className={`${getEnergyBadgeStyle(voices.find(v => v.id === selectedVoiceId)?.energyLevel || 'medium')} text-white`}
              >
                {getEnergyBadgeText(voices.find(v => v.id === selectedVoiceId)?.energyLevel || 'medium')}
              </Badge>
            )}
          </div>
          
          {/* Preview text */}
          <div className="p-3 bg-muted/50 rounded-md text-sm border">
            {previewText}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="default"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                const selectedVoice = voices.find(v => v.id === selectedVoiceId);
                if (selectedVoice) {
                  playVoicePreview(selectedVoice);
                }
              }}
              disabled={!selectedVoiceId || previewsLoading[selectedVoiceId] || voices.length === 0}
            >
              {previewsLoading[selectedVoiceId] ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
              {playingVoiceId === selectedVoiceId ? "Playing..." : "Play Selected Voice"}
              {playingVoiceId === selectedVoiceId && (
                <span className="ml-1 h-2 w-2 rounded-full bg-current animate-pulse" />
              )}
            </Button>
            
            {previewCache[selectedVoiceId] && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear cache for this voice to force regeneration
                  setPreviewCache(prev => {
                    const newCache = {...prev};
                    delete newCache[selectedVoiceId];
                    return newCache;
                  });
                  
                  const selectedVoice = voices.find(v => v.id === selectedVoiceId);
                  if (selectedVoice) {
                    toast.info("Generating new voice preview...");
                    playVoicePreview(selectedVoice);
                  }
                }}
              >
                Refresh Preview
              </Button>
            )}
            
            <div className="mt-2 text-xs text-muted-foreground">
              {loading ? (
                <span>Loading voice options...</span>
              ) : (
                <span>
                  {filteredVoices.length} voices available 
                  {filterLanguage && ` in ${filterLanguage}`}
                  {showTierFilter !== 'all' && ` (${showTierFilter} tier${showTierFilter === 'pro' ? ' and above' : ''})`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicemakerVoiceSelector;

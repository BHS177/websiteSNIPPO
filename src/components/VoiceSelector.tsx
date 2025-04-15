
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ElevenLabsVoice } from "@/types/video";
import { elevenLabsService } from "@/services/elevenLabsService";
import { Label } from "@/components/ui/label";
import ElevenLabsApiSetup from './ElevenLabsApiSetup';

interface VoiceSelectorProps {
  selectedVoiceId: string | undefined;
  onVoiceSelect: (voiceId: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoiceId,
  onVoiceSelect,
  disabled = false,
  className
}) => {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Load voices when API key is set
  useEffect(() => {
    if (isApiKeySet) {
      loadVoices();
    }
    
    // Check if API key is already set
    setIsApiKeySet(elevenLabsService.hasApiKey());
  }, [isApiKeySet]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
      }
    };
  }, [previewAudio]);

  const loadVoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const voicesList = await elevenLabsService.getVoices();
      setVoices(voicesList);
      
      // If no voice is selected yet but we have voices, select the first one
      if (!selectedVoiceId && voicesList.length > 0) {
        onVoiceSelect(voicesList[0].voice_id);
      }
    } catch (err) {
      console.error("Failed to load voices:", err);
      setError("Failed to load voices. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const playVoicePreview = (voice: ElevenLabsVoice) => {
    // Stop any currently playing preview
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.src = '';
    }

    // If the voice has a preview URL, play it
    if (voice.preview_url) {
      const audio = new Audio(voice.preview_url);
      setPreviewAudio(audio);
      setPlayingVoiceId(voice.voice_id);
      
      audio.onended = () => {
        setPlayingVoiceId(null);
      };
      
      audio.play().catch(err => {
        console.error("Failed to play audio preview:", err);
        setPlayingVoiceId(null);
      });
    }
  };

  const handleApiKeySet = (isValid: boolean) => {
    setIsApiKeySet(isValid);
  };

  if (!isApiKeySet) {
    return <ElevenLabsApiSetup onApiKeySet={handleApiKeySet} minimal />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="voiceSelector">Voice</Label>
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
                  selectedVoiceId && voices.find(v => v.voice_id === selectedVoiceId)?.name
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem 
                  key={voice.voice_id} 
                  value={voice.voice_id}
                  className="flex justify-between"
                >
                  <div className="flex flex-col">
                    <span>{voice.name}</span>
                    {voice.description && (
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => loadVoices()}
            disabled={loading || !isApiKeySet}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "↻"}
          </Button>
        </div>
      </div>
      
      {error && <p className="text-sm text-destructive">{error}</p>}
      
      {selectedVoiceId && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Voice Preview</div>
          <div className="flex flex-wrap gap-2">
            {voices
              .filter(voice => voice.preview_url)
              .map(voice => (
                <Button
                  key={voice.voice_id}
                  variant={voice.voice_id === selectedVoiceId ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => playVoicePreview(voice)}
                  disabled={!voice.preview_url}
                >
                  <Volume2 className="h-3 w-3" />
                  {voice.name}
                  {playingVoiceId === voice.voice_id && (
                    <span className="ml-1 h-2 w-2 rounded-full bg-current animate-pulse" />
                  )}
                </Button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;

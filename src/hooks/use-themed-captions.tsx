
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { generateThemedCaptions } from '@/services/openaiIntegration';
import { VideoClip, TextOverlay } from '@/types/video';

interface UseThemedCaptionsOutput {
  isGenerating: boolean;
  generateCaptionsForClips: (
    description: string,
    clips: VideoClip[],
    onCaptionsGenerated: (captions: Record<number, string>, positions: Record<number, TextOverlay['position']>) => void
  ) => Promise<void>;
}

export const useThemedCaptions = (): UseThemedCaptionsOutput => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateCaptionsForClips = useCallback(async (
    description: string,
    clips: VideoClip[],
    onCaptionsGenerated: (captions: Record<number, string>, positions: Record<number, TextOverlay['position']>) => void
  ) => {
    if (!clips || clips.length === 0) {
      toast.error("No clips available");
      return;
    }

    if (!description) {
      toast.error("Please provide a description");
      return;
    }

    setIsGenerating(true);
    toast.info(`Using chatbot to create captions`, {
      description: "Please use the chat interface to generate captions"
    });

    try {
      // This function is kept for backward compatibility, but we're redirecting users to use ChatGPT
      // We now need to properly clean up any assistant boilerplate text from the captions
      
      // Create initial empty captions
      const cleanCaptions: Record<number, string> = {};
      const positions: Record<number, TextOverlay['position']> = {};
      
      // Set default positions for all clips (center is optimal for voice-over sync)
      clips.forEach(clip => {
        positions[clip.id] = 'center';
      });
      
      // We're redirecting to chat interface but still providing this function for backward compatibility
      setIsGenerating(false);
      
      // Pass the empty captions and positions to the callback
      if (onCaptionsGenerated) {
        onCaptionsGenerated(cleanCaptions, positions);
      }
      
      toast.info("Please use the ChatGPT assistant", {
        description: "For better captions, use the chat interface to generate specific captions for each clip"
      });
    } catch (error) {
      console.error("Error generating themed captions:", error);
      toast.error("Failed to generate themed captions");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generateCaptionsForClips
  };
};

export default useThemedCaptions;

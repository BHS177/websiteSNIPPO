import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LayoutGrid, Scissors, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import FuturisticButton from "@/components/FuturisticButton";
import { sanitizeCaption } from "@/services/openaiIntegration";
import CaptionSelector from "@/components/CaptionSelector";

interface MediaControlsProps {
  resequenceMode: boolean;
  useCaptions: boolean;
  useAdvancedTransitions: boolean;
  isOptimizing: boolean;
  onResequenceToggle: () => void;
  onCaptionsToggle: (value: boolean) => void;
  onTransitionsToggle: (value: boolean) => void;
  onOptimize: () => void;
  onAdvancedClick: () => void;
  onCaptionSelect?: (caption: string, clipIndex: number) => void;
}

const MediaControls: React.FC<MediaControlsProps> = ({
  resequenceMode,
  useCaptions,
  useAdvancedTransitions,
  isOptimizing,
  onResequenceToggle,
  onCaptionsToggle,
  onTransitionsToggle,
  onOptimize,
  onAdvancedClick,
  onCaptionSelect
}) => {
  const [open, setOpen] = useState(false);
  const [captionsText, setCaptionsText] = useState('');
  const [selectedCaptionIndices, setSelectedCaptionIndices] = useState<number[]>([]);

  const handleGenerateCaptions = () => {
    setOpen(true);
  };
  
  // Enhanced function to detect content type and format
  const detectContentType = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Check for scene-based format
    if (lowerText.includes("scene") || lowerText.includes("clip")) {
      return "scene_based";
    }
    
    // Check for ChatGPT response patterns
    if (lowerText.includes("here are") && lowerText.includes("captions")) {
      return "chatgpt_response";
    }
    
    // Check for specific content types
    if (lowerText.includes("haram") || lowerText.includes("halal")) {
      return "islamic";
    }
    if (lowerText.includes("hookup") || lowerText.includes("dating")) {
      return "hookup";
    }
    if (lowerText.includes("business") || lowerText.includes("entrepreneur")) {
      return "business";
    }
    if (lowerText.includes("tutorial") || lowerText.includes("how to")) {
      return "tutorial";
    }
    if (lowerText.includes("lifestyle") || lowerText.includes("day in")) {
      return "lifestyle";
    }
    
    return "general";
  };

  // Enhanced function to extract scene-based captions
  const extractSceneBasedCaptions = (text: string): Record<number, string> => {
    const captionsMap: Record<number, string> = {};
    let currentScene = 0;
    
    // Split into sections by double newlines
    const sections = text.split(/\n\s*\n/);
    
    for (const section of sections) {
      const lines = section.trim().split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Check for intro/title
        if (trimmedLine.toLowerCase().includes("intro clip")) {
          const match = trimmedLine.match(/["'](.+?)["']/) || 
                       section.match(/["'](.+?)["']/);
          if (match?.[1]) {
            captionsMap[1] = match[1].trim();
            currentScene = 1;
          }
          continue;
        }

        // Check for scene headers
        const sceneMatch = line.match(/^(?:\*\*)?Scene\s*(\d+)/i) ||
                          line.match(/^(\d+)\.\s/);
        if (sceneMatch) {
          currentScene = parseInt(sceneMatch[1]);
          continue;
        }

        // Extract quoted content or full line
        const quoteMatch = trimmedLine.match(/["'](.+?)["']/);
        if (quoteMatch?.[1] && !trimmedLine.startsWith('**')) {
          if (currentScene > 0) {
            captionsMap[currentScene + 1] = quoteMatch[1].trim();
          }
        } else if (!trimmedLine.startsWith('**') && 
                   !trimmedLine.toLowerCase().includes("feel free") &&
                   !trimmedLine.toLowerCase().includes("here are")) {
          // Use the line itself if it's not a header or meta text
          if (currentScene > 0) {
            captionsMap[currentScene + 1] = trimmedLine;
          }
        }
      }
    }
    
    return captionsMap;
  };

  // Enhanced function to extract video description from ChatGPT response
  const extractVideoDescription = (text: string): string => {
    const lines = text.split('\n');
    
    // Look for description in common ChatGPT response patterns
    for (const line of lines) {
          const lowerLine = line.toLowerCase();
      if (lowerLine.includes("creating captions for") || 
          lowerLine.includes("here are the captions for") ||
          lowerLine.includes("making a video")) {
        return line.replace(/^.*?(?:for|about):?\s*/i, '').trim();
      }
    }
    
    // If no clear description found, use the first non-empty line
    return lines.find(line => line.trim().length > 0) || "";
  };

  // Enhanced function to process TikTok-style caption
  const processTikTokStyleCaption = (caption: string): string => {
    return caption
      .replace(/^[0-9]+\.\s*/, '') // Remove leading numbers
      .replace(/^["'](.+)["']$/, '$1') // Remove wrapping quotes
      .replace(/^[-–—]\s*/, '') // Remove leading dashes
      .trim();
  };

  const handleApplyCaptions = () => {
    if (!captionsText) {
      toast.error("Please paste some captions first");
      return;
    }

    try {
      const captionsMap: Record<number, string> = {};
      
      // Split text into lines and clean them
      const lines = captionsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Process each line
      for (const line of lines) {
        // Skip common header/footer lines
        if (line.toLowerCase().includes('here are') || 
            line.toLowerCase().includes('hope these') ||
            line.toLowerCase().includes('viral') ||
            line.toLowerCase().includes('am') ||
            line.toLowerCase().includes('pm') ||
            line.startsWith('Make TikTok') ||
            line.startsWith('**')) {
          continue;
        }

        // Try different caption formats
        let match = null;

        // Format: 1. "Caption text"
        match = line.match(/^(\d+)\.\s*[""]([^""]+)[""]/) ||
                line.match(/^(\d+)\.\s*["']([^"']+)["']/) ||
                line.match(/^(\d+)\.\s*(.+)$/);

        if (match) {
          const number = parseInt(match[1]);
          const caption = match[2].trim();
          
          // Skip empty or invalid captions
          if (caption.length < 2) continue;
          
          // Store caption with original formatting
          captionsMap[number] = caption;
        }
      }

      // Ensure we have at least one caption
      if (Object.keys(captionsMap).length === 0) {
        toast.error("No valid captions found. Please check your caption format.");
        return;
      }
      
      // Sort captions by number to ensure proper order
      const sortedCaptions = Object.entries(captionsMap)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .reduce((obj, [key, value]) => ({
          ...obj,
          [key]: value
        }), {});

      // Save captions to localStorage
      localStorage.setItem('generatedCaptions', JSON.stringify(sortedCaptions));
      localStorage.setItem('hasNewAiCaptions', 'true');
      localStorage.setItem('captionStyle', 'tiktok');

      // Update UI state
      onCaptionsToggle(true);
      setOpen(false);

      const captionCount = Object.keys(sortedCaptions).length;
      toast.success(`Captions applied!`, {
        description: `Successfully added ${captionCount} caption${captionCount > 1 ? 's' : ''} to your clips`
      });
    } catch (error) {
      console.error('Error applying captions:', error);
      toast.error('Failed to apply captions');
    }
  };

  const handleCaptionSelect = (caption: string, index: number) => {
    // If already selected, remove it
    if (selectedCaptionIndices.includes(index)) {
      setSelectedCaptionIndices(prev => prev.filter(i => i !== index));
      return;
    }

    // Add to selected captions
    setSelectedCaptionIndices(prev => [...prev, index]);
    
    // Call parent handler
    if (onCaptionSelect) {
      onCaptionSelect(caption, selectedCaptionIndices.length);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center justify-between p-4 bg-black/20 rounded-lg backdrop-blur-sm">
      <div className="flex gap-2">
        <Button 
          variant={resequenceMode ? "secondary" : "outline"}
          size="sm" 
          onClick={onResequenceToggle}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          {resequenceMode ? "Save Order" : "Reorder"}
        </Button>
        
        <Button 
          variant="outline"
          size="sm" 
          onClick={onAdvancedClick}
          className="gap-2"
        >
          <Scissors className="h-4 w-4" />
          Advanced
        </Button>
        
        <Button 
          variant="outline"
          size="sm" 
          onClick={() => setOpen(true)}
          className="gap-2 bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50 text-purple-200"
        >
          <MessageSquare className="h-4 w-4" />
          Choose Captions
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-black/95 border-purple-500/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Choose Your Captions
            </DialogTitle>
            <DialogDescription className="text-purple-200/70">
              Paste your captions and click them in the order you want them to appear in your video.
            </DialogDescription>
          </DialogHeader>
          
          <CaptionSelector
            onCaptionSelect={handleCaptionSelect}
            selectedIndices={selectedCaptionIndices}
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50 text-purple-200"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaControls;

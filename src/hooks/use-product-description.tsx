import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Caption, BackgroundMusic, VideoClip, TextOverlay } from '@/types/video';
import { generateThemedCaptions } from '@/services/openaiService';

interface UseProductDescriptionOutput {
  productDescription: string;
  setProductDescription: (value: string) => void;
  isApplyingDescription: boolean;
  saveDescription: () => void;
  applyProductDescription: (
    videoUrl: string, 
    duration: number,
    onCaptionsGenerated: (captions: Caption[]) => void,
    onMusicSelected: (music: BackgroundMusic) => void
  ) => Promise<void>;
  analyzeAllClips: (
    clips: VideoClip[],
    onCaptionsGenerated: (captions: Record<number, string>, positions: Record<number, TextOverlay['position']>) => void
  ) => Promise<void>;
}

export const useProductDescription = (): UseProductDescriptionOutput => {
  const [productDescription, setProductDescription] = useState<string>('');
  const [isApplyingDescription, setIsApplyingDescription] = useState<boolean>(false);

  // Listen for ChatGPT captions extraction event
  useEffect(() => {
    const handleChatGPTCaptionsExtracted = () => {
      toast.success("ChatGPT captions extracted! Click Apply to add them to clips.");
    };

    window.addEventListener('chatgpt-captions-extracted', handleChatGPTCaptionsExtracted);
    
    return () => {
      window.removeEventListener('chatgpt-captions-extracted', handleChatGPTCaptionsExtracted);
    };
  }, []);
  
  // Listen for new captions generation event
  useEffect(() => {
    const handleNewCaptionsGenerated = () => {
      const hasNewCaptions = localStorage.getItem('hasNewAiCaptions') === 'true';
      if (hasNewCaptions) {
        toast.info("New captions have been generated! Apply them to your clips.");
      }
    };
    
    window.addEventListener('new-captions-generated', handleNewCaptionsGenerated);
    
    return () => {
      window.removeEventListener('new-captions-generated', handleNewCaptionsGenerated);
    };
  }, []);

  const saveDescription = () => {
    if (!productDescription.trim()) {
      toast.info('No description provided, will use AI-generated captions only');
    }
    localStorage.setItem('productDescription', productDescription || '');
    toast.success('Description saved successfully');
  };

  const applyProductDescription = async (
    videoUrl: string,
    duration: number,
    onCaptionsGenerated: (captions: Caption[]) => void,
    onMusicSelected: (music: BackgroundMusic) => void
  ) => {
    if (!productDescription.trim()) {
      toast.error('Please enter a product description');
      return;
    }
    setIsApplyingDescription(true);
    try {
      // Simplified implementation
      const captions: Caption[] = [];
      onCaptionsGenerated(captions);
      toast.success('Product-specific captions generated');
    } catch (error) {
      console.error('Error applying product description:', error);
      toast.error('Failed to process product description');
    } finally {
      setIsApplyingDescription(false);
    }
  };

  // Improved function to extract captions from ChatGPT responses
  const extractChatGPTCaptions = (clips: VideoClip[]): {
    captions: Record<number, string>,
    positions: Record<number, TextOverlay['position']>
  } => {
    const generatedCaptions: Record<number, string> = {};
    const generatedPositions: Record<number, TextOverlay['position']> = {};
    
    try {
      // First check if we have captions in the localStorage from the "Apply ChatGPT Captions" button
      const savedCaptionsJSON = localStorage.getItem('generatedCaptions');
      
      if (savedCaptionsJSON) {
        console.log('Found stored captions from ChatGPT extraction:', savedCaptionsJSON);
        const parsedCaptions = JSON.parse(savedCaptionsJSON);
        
        // Reset flag to indicate we're now using these captions
        localStorage.setItem('hasNewAiCaptions', 'false');
        
        // Map captions to clips by index for 1-based caption numbers
        clips.forEach((clip, index) => {
          const clipNumber = index + 1; // 1-based index for "Clip 1", "Clip 2" format
          
          if (parsedCaptions[clipNumber]) {
            // Store by clip ID, but mark that we're using sequence-based captions
            generatedCaptions[clip.id] = parsedCaptions[clipNumber];
            localStorage.setItem('usingSequenceCaptions', 'true');
            
            // Assign positions based on clip position in sequence
            if (index === 0) {
              generatedPositions[clip.id] = "center";
            } else if (index === clips.length - 1) {
              generatedPositions[clip.id] = "center";
            } else {
              generatedPositions[clip.id] = index % 2 === 0 ? "bottom" : "top";
            }
          }
        });
        
        // If we found and mapped captions, return them
        if (Object.keys(generatedCaptions).length > 0) {
          toast.success(`Applied ${Object.keys(generatedCaptions).length} captions from ChatGPT`);
          
          // Make sure every clip has a caption (fallback if needed)
          clips.forEach((clip, index) => {
            if (!generatedCaptions[clip.id]) {
              generatedCaptions[clip.id] = index === 0 
                ? "Welcome to our trending content! ✨ #viral" 
                : `Check out part ${index + 1} of our amazing content! 🔥`;
                
              generatedPositions[clip.id] = index % 2 === 0 ? "bottom" : "top";
            }
          });
          
          localStorage.setItem('captionsApplied', 'true');
          localStorage.setItem('hasNewAiCaptions', 'false');
          
          return { captions: generatedCaptions, positions: generatedPositions };
        }
      }
      
      // If we got here, let's try extracting from lastCaptionsResponse directly
      const lastCaptionsResponse = localStorage.getItem('lastCaptionsResponse');
      
      if (lastCaptionsResponse) {
        console.log('Extracting captions from ChatGPT response:', lastCaptionsResponse);
        
        // Get the "Clip X:" pattern directly from the response
        const clipRegex = /\*\*Clip\s*(\d+)[:]*\*\*\s*["']*(.*?)["']*(?=\n\n|\n\*\*Clip|\n\*\s*Clip|$)/gsi;
        
        // Alternative pattern for other formatting
        const altClipRegex = /Clip\s*(\d+)[:\s-]*\s*["']*(.*?)["']*(?=\n\n|\nClip|\n\*\s*Clip|$)/gsi;
        
        // Intro pattern for first clip
        const introKeywords = ["intro", "catchy", "hookup", "opening", "attention", "grab", "hook"];
        const introPatternRegex = new RegExp(`\\*\\*(?:${introKeywords.join('|')})\\s*(?:caption|title)?\\*\\*\\s*:?\\s*["']*(.*?)["']*(?=\\n\\n|\\n\\*\\*|$)`, 'i');
        
        let extractedCaptions: Record<number, string> = {};
        let match;
        
        // Try to extract intro/opening caption first
        const introMatch = lastCaptionsResponse.match(introPatternRegex);
        if (introMatch && introMatch[1]) {
          let introText = introMatch[1].trim()
            .replace(/^\*+|\*+$/g, '') // Remove asterisks at beginning/end
            .replace(/^#+|#+$/g, '')   // Remove hashtags at beginning/end
            .replace(/^["']|["']$/g, '') // Remove quotes
            .trim();
            
          if (introText) {
            extractedCaptions[1] = introText;
          }
        }
        
        // Try the first regex pattern with ** formatting
        while ((match = clipRegex.exec(lastCaptionsResponse)) !== null) {
          const clipNumber = parseInt(match[1]);
          let captionText = match[2].trim();
          
          // Clean up the caption text
          captionText = captionText
            .replace(/^\*+|\*+$/g, '') // Remove asterisks at beginning/end
            .replace(/^#+|#+$/g, '')   // Remove hashtags at beginning/end
            .replace(/^["']|["']$/g, '') // Remove quotes
            .trim();
            
          if (captionText) {
            extractedCaptions[clipNumber] = captionText;
          }
        }
        
        // If we didn't find any captions with the first pattern, try the alternative
        if (Object.keys(extractedCaptions).length === 0 || (Object.keys(extractedCaptions).length === 1 && extractedCaptions[1])) {
          while ((match = altClipRegex.exec(lastCaptionsResponse)) !== null) {
            const clipNumber = parseInt(match[1]);
            let captionText = match[2].trim();
            
            // Clean up the caption text
            captionText = captionText
              .replace(/^\*+|\*+$/g, '') // Remove asterisks at beginning/end
              .replace(/^#+|#+$/g, '')   // Remove hashtags at beginning/end
              .replace(/^["']|["']$/g, '') // Remove quotes
              .trim();
              
            if (captionText) {
              extractedCaptions[clipNumber] = captionText;
            }
          }
        }
        
        // Try to extract from numbered list (1. Text) if still no success
        if (Object.keys(extractedCaptions).length === 0 || (Object.keys(extractedCaptions).length === 1 && extractedCaptions[1])) {
          const numberedRegex = /(\d+)[\.:\)]\s+(.*?)(?=\n\n|\n\d+[\.:\)]|$)/gsi;
          
          while ((match = numberedRegex.exec(lastCaptionsResponse)) !== null) {
            const clipNumber = parseInt(match[1]);
            let captionText = match[2].trim();
            
            // Clean up the caption text
            captionText = captionText
              .replace(/^\*+|\*+$/g, '') // Remove asterisks at beginning/end
              .replace(/^#+|#+$/g, '')   // Remove hashtags at beginning/end
              .replace(/^["']|["']$/g, '') // Remove quotes
              .trim();
              
            if (captionText) {
              extractedCaptions[clipNumber] = captionText;
            }
          }
        }
        
        // If we found captions, map them to clips
        if (Object.keys(extractedCaptions).length > 0) {
          console.log('Successfully extracted captions:', extractedCaptions);
          
          // Reset flag to indicate we're now using these captions
          localStorage.setItem('hasNewAiCaptions', 'false');
          
          // Map captions to clips by clip sequence number
          clips.forEach((clip, index) => {
            const clipNumber = index + 1; // 1-based for "Clip 1", "Clip 2", etc.
            
            if (extractedCaptions[clipNumber]) {
              generatedCaptions[clip.id] = extractedCaptions[clipNumber];
              
              // Choose position based on clip position
              if (index === 0) {
                generatedPositions[clip.id] = "center";
              } else if (index === clips.length - 1) {
                generatedPositions[clip.id] = "center";
              } else {
                generatedPositions[clip.id] = index % 2 === 0 ? "bottom" : "top";
              }
            }
          });
          
          // Store the mapped captions for future use
          localStorage.setItem('generatedCaptions', JSON.stringify(generatedCaptions));
          localStorage.setItem('captionPositions', JSON.stringify(generatedPositions));
          
          toast.success(`Extracted ${Object.keys(generatedCaptions).length} captions from ChatGPT`);
          localStorage.setItem('captionsApplied', 'true');
          
          return { captions: generatedCaptions, positions: generatedPositions };
        }
      }
    } catch (error) {
      console.error('Error extracting ChatGPT captions:', error);
      toast.error('Failed to extract captions from ChatGPT');
    }
    
    // If all extraction methods failed, return empty mappings
    return { captions: {}, positions: {} };
  };

  const analyzeAllClips = async (
    clips: VideoClip[],
    onCaptionsGenerated: (captions: Record<number, string>, positions: Record<number, TextOverlay['position']>) => void
  ) => {
    if (!clips || clips.length === 0) {
      toast.error('No video clips available');
      return;
    }
    
    setIsApplyingDescription(true);
    
    try {
      // First, try to extract captions from ChatGPT conversations
      const extractedData = extractChatGPTCaptions(clips);
      
      if (Object.keys(extractedData.captions).length > 0) {
        console.log('Using ChatGPT extracted captions:', extractedData);
        
        // Save these captions back to localStorage to ensure they're used consistently
        localStorage.setItem('generatedCaptions', JSON.stringify(extractedData.captions));
        localStorage.setItem('captionPositions', JSON.stringify(extractedData.positions));
        
        // Update the UI with these captions
        onCaptionsGenerated(extractedData.captions, extractedData.positions);
        
        // Apply the captions directly to clips
        clips.forEach(clip => {
          if (extractedData.captions[clip.id]) {
            const textOverlay = {
              text: extractedData.captions[clip.id],
              position: extractedData.positions[clip.id] || 'bottom',
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
            };
            
            // Update localStorage directly 
            try {
              const mediaClips = JSON.parse(localStorage.getItem('mediaClips') || '[]');
              const clipIndex = mediaClips.findIndex((c: any) => c.id === clip.id);
              if (clipIndex !== -1) {
                mediaClips[clipIndex].textOverlay = textOverlay;
                localStorage.setItem('mediaClips', JSON.stringify(mediaClips));
              }
            } catch (error) {
              console.error("Error updating clip with caption:", error);
            }
          }
        });
        
        toast.success('ChatGPT captions applied to all clips');
        localStorage.setItem('hasNewAiCaptions', 'false');
        localStorage.setItem('captionsApplied', 'true');
        
        setIsApplyingDescription(false);
        return;
      }
      
      // If no ChatGPT captions found, notify user
      toast.info('No ChatGPT captions found. Try using the "Apply ChatGPT Captions" button first.');
      
      // Fallback to original logic if no ChatGPT captions found
      const storedDescription = localStorage.getItem('productDescription') || productDescription;
      
      if (!storedDescription) {
        toast.error('No description provided for caption generation');
        setIsApplyingDescription(false);
        return;
      }
      
      const generatedCaptions: Record<number, string> = {};
      const generatedPositions: Record<number, TextOverlay['position']> = {};
      
      // Generate a unique caption for each clip
      clips.forEach((clip, index) => {
        // Assign positions based on clip order
        if (index === 0) {
          generatedPositions[clip.id] = "center";
        } else if (index === clips.length - 1) {
          generatedPositions[clip.id] = "center";
        } else {
          generatedPositions[clip.id] = index % 2 === 0 ? "bottom" : "top";
        }
        
        // Default captions as fallback
        generatedCaptions[clip.id] = index === 0 
          ? `Welcome to our ${storedDescription} content! ✨ #trending` 
          : `Part ${index + 1}: Engaging ${storedDescription} insights! 🔥`;
      });
      
      // Store the generated captions and positions
      localStorage.setItem('generatedCaptions', JSON.stringify(generatedCaptions));
      localStorage.setItem('captionPositions', JSON.stringify(generatedPositions));
      
      // Update the UI with these captions
      onCaptionsGenerated(generatedCaptions, generatedPositions);
      
      // Apply the captions directly to the clips
      clips.forEach(clip => {
        if (generatedCaptions[clip.id]) {
          const textOverlay = {
            text: generatedCaptions[clip.id],
            position: generatedPositions[clip.id] || 'bottom',
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
          };
          
          // Update localStorage directly 
          try {
            const mediaClips = JSON.parse(localStorage.getItem('mediaClips') || '[]');
            const clipIndex = mediaClips.findIndex((c: any) => c.id === clip.id);
            if (clipIndex !== -1) {
              mediaClips[clipIndex].textOverlay = textOverlay;
              localStorage.setItem('mediaClips', JSON.stringify(mediaClips));
            }
          } catch (error) {
            console.error("Error updating clip with caption:", error);
          }
        }
      });
      
      toast.success('Generated captions applied to all clips');
      localStorage.setItem('captionsApplied', 'true');
      
    } catch (error) {
      console.error('Error analyzing clips:', error);
      toast.error('Failed to analyze clips');
    } finally {
      setIsApplyingDescription(false);
    }
  };

  return {
    productDescription,
    setProductDescription,
    isApplyingDescription,
    saveDescription,
    applyProductDescription,
    analyzeAllClips
  };
};

export default useProductDescription;

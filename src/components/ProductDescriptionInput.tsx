
import { useState, useEffect } from "react";
import { Tag, Info, ShoppingBag, MessageSquare, Wand2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import FuturisticButton from "./FuturisticButton";

interface ProductDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const ProductDescriptionInput = ({
  value,
  onChange,
  onSubmit,
  isProcessing
}: ProductDescriptionInputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplyingCaptions, setIsApplyingCaptions] = useState(false);
  
  const examplePrompts = [
    "TikTok about makeup tutorials showing different eye shadow techniques for beginners",
    "Travel vlog showcasing hidden gems in Paris with local food recommendations",
    "Fitness motivation series with quick home workout routines for busy people"
  ];

  const handleUseExample = (example: string) => {
    onChange(example);
    setIsExpanded(true);
  };

  const scrollToChatSection = () => {
    document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' });
    
    // Flash the chat section to draw attention
    const chatSection = document.getElementById('chat-section');
    if (chatSection) {
      chatSection.classList.add('highlight-pulse');
      setTimeout(() => {
        chatSection.classList.remove('highlight-pulse');
      }, 2000);
    }
    
    // Show a toast with instructions
    toast.info("Chat with AI to generate captions", {
      description: "After chatting, click the 'APPLY CHATGPT CAPTIONS' button to apply them to your clips",
      duration: 5000
    });
  };
  
  const applyChatGPTCaptions = async () => {
    // Prevent multiple clicks
    if (isApplyingCaptions) return;
    
    setIsApplyingCaptions(true);
    toast.info("Processing ChatGPT captions...");
    
    try {
      // Get the ChatGPT response from localStorage
      const chatResponse = localStorage.getItem('lastCaptionsResponse');
      
      if (!chatResponse) {
        toast.error("No ChatGPT captions found. Please chat with the AI first.");
        return;
      }
      
      // Check if we have any clips to caption
      const clipCount = document.querySelectorAll('.clip-card, [data-clip-type]').length;
      
      if (clipCount === 0) {
        toast.error("No clips found. Please upload video clips first.");
        return;
      }
      
      console.log("Extracting captions from: ", chatResponse);
      
      // Extract clips and their captions using regex
      const clipCaptionsMap: Record<number, string> = {};
      
      // Try multiple patterns to extract captions
      
      // Pattern 1: **Clip X:** Text or **Intro Caption:** Text
      const introKeywords = ["intro", "catchy", "hookup", "opening", "attention", "grab", "hook"];
      const introPatternRegex = new RegExp(`\\*\\*(?:${introKeywords.join('|')})\\s*(?:caption|title)?\\*\\*\\s*:?\\s*["']*(.*?)["']*(?=\\n\\n|\\n\\*\\*|$)`, 'i');
      const introMatch = chatResponse.match(introPatternRegex);
      
      if (introMatch && introMatch[1]) {
        const introText = introMatch[1].trim()
          .replace(/^\*+|\*+$/g, '') // Remove asterisks at beginning/end
          .replace(/^#+|#+$/g, '')   // Remove hashtags at beginning/end
          .replace(/^["']|["']$/g, '') // Remove quotes at beginning/end
          .trim();
          
        if (introText) {
          console.log("Found opening caption:", introText);
          clipCaptionsMap[1] = introText;
        }
      }
      
      // Pattern 2: **Clip X:** Text (standard pattern)
      let clipRegex = /\*\*Clip\s*(\d+)[:]*\*\*\s*["']*(.*?)["']*(?=\n\n|\n\*\*Clip|\n\*\s*Clip|$)/gsi;
      let match;
      let extractionSuccessful = Object.keys(clipCaptionsMap).length > 0;
      
      while ((match = clipRegex.exec(chatResponse)) !== null) {
        const clipNumber = parseInt(match[1]);
        let captionText = match[2].trim();
        
        // Clean up the caption text
        captionText = captionText
          .replace(/^\*+|\*+$/g, '') // Remove asterisks at beginning/end
          .replace(/^#+|#+$/g, '')   // Remove hashtags at beginning/end
          .replace(/^["']|["']$/g, '') // Remove quotes
          .trim();
        
        clipCaptionsMap[clipNumber] = captionText;
        extractionSuccessful = true;
      }
      
      // Pattern 3: Clip X: Text (without asterisks)
      if (!extractionSuccessful || Object.keys(clipCaptionsMap).length <= 1) {
        clipRegex = /Clip\s*(\d+)[:\s-]*\s*["']*(.*?)["']*(?=\n\n|\nClip|\n\*\s*Clip|$)/gsi;
        
        while ((match = clipRegex.exec(chatResponse)) !== null) {
          const clipNumber = parseInt(match[1]);
          let captionText = match[2].trim();
          
          captionText = captionText
            .replace(/^\*+|\*+$/g, '')
            .replace(/^#+|#+$/g, '')
            .replace(/^["']|["']$/g, '')
            .trim();
          
          clipCaptionsMap[clipNumber] = captionText;
          extractionSuccessful = true;
        }
      }
      
      // Pattern 4: Numbered list like "1. Caption text"
      if (!extractionSuccessful || Object.keys(clipCaptionsMap).length <= 1) {
        clipRegex = /(\d+)[\.:\)]\s+(.*?)(?=\n\n|\n\d+[\.:\)]|$)/gsi;
        
        while ((match = clipRegex.exec(chatResponse)) !== null) {
          const clipNumber = parseInt(match[1]);
          let captionText = match[2].trim();
          
          captionText = captionText
            .replace(/^\*+|\*+$/g, '')
            .replace(/^#+|#+$/g, '')
            .replace(/^["']|["']$/g, '')
            .trim();
          
          clipCaptionsMap[clipNumber] = captionText;
          extractionSuccessful = true;
        }
      }
      
      // Pattern 5: Emoji numbering like "1️⃣ Caption text"
      if (!extractionSuccessful || Object.keys(clipCaptionsMap).length <= 1) {
        clipRegex = /(\d+)(?:️⃣|\uFE0F\u20E3)\s+(.*?)(?=\n\n|\n\d+(?:️⃣|\uFE0F\u20E3)|$)/gsi;
        
        while ((match = clipRegex.exec(chatResponse)) !== null) {
          const clipNumber = parseInt(match[1]);
          let captionText = match[2].trim();
          
          captionText = captionText
            .replace(/^\*+|\*+$/g, '')
            .replace(/^#+|#+$/g, '')
            .replace(/^["']|["']$/g, '')
            .trim();
          
          clipCaptionsMap[clipNumber] = captionText;
          extractionSuccessful = true;
        }
      }
      
      // Pattern 6: Paragraph-based extraction
      if (!extractionSuccessful || Object.keys(clipCaptionsMap).length <= 1) {
        // Split by double newlines to separate paragraphs
        const paragraphs = chatResponse.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        // Check if we have a paragraph with title/intro and extract it for first clip
        if (paragraphs.length > 0) {
          const firstPara = paragraphs[0];
          if (/catchy|attention|hook|intro|opening/i.test(firstPara) && !clipCaptionsMap[1]) {
            // Extract the actual caption text after the keyword
            const cleanedText = firstPara
              .replace(/.*?(?:caption|title|hook|intro).*?[:]/i, '')
              .replace(/^\*+|\*+$/g, '')
              .replace(/^#+|#+$/g, '')
              .replace(/^["']|["']$/g, '')
              .trim();
              
            if (cleanedText) {
              clipCaptionsMap[1] = cleanedText;
            }
          }
          
          // Process remaining paragraphs for other clips
          for (let i = 1; i < paragraphs.length; i++) {
            const clipNumberMatch = paragraphs[i].match(/(\d+)[\.:\)]|(\d+)(?:️⃣|\uFE0F\u20E3)/);
            if (clipNumberMatch) {
              const clipNumber = parseInt(clipNumberMatch[1] || clipNumberMatch[2]);
              if (!clipCaptionsMap[clipNumber]) {
                const cleanedText = paragraphs[i]
                  .replace(/^\d+[\.:\)]|(\d+)(?:️⃣|\uFE0F\u20E3)/, '')
                  .replace(/^\*+|\*+$/g, '')
                  .replace(/^#+|#+$/g, '')
                  .replace(/^["']|["']$/g, '')
                  .trim();
                  
                if (cleanedText) {
                  clipCaptionsMap[clipNumber] = cleanedText;
                }
              }
            }
          }
        }
      }
      
      // Pattern 7: Try to extract bulleted items
      if (!extractionSuccessful && Object.keys(clipCaptionsMap).length <= 1) {
        const bulletItems = chatResponse.match(/[\*\-•]\s+([^\n]+)/g);
        if (bulletItems && bulletItems.length > 0) {
          bulletItems.forEach((item, index) => {
            const cleanItem = item
              .replace(/^[\*\-•]\s+/, '')
              .replace(/^\*+|\*+$/g, '')
              .replace(/^#+|#+$/g, '')
              .replace(/^["']|["']$/g, '')
              .trim();
            
            // If we already have a first caption from intro extraction, start at index 2
            const clipNumber = clipCaptionsMap[1] ? index + 2 : index + 1;
            
            if (cleanItem && !clipCaptionsMap[clipNumber]) {
              clipCaptionsMap[clipNumber] = cleanItem;
            }
          });
          extractionSuccessful = true;
        }
      }
      
      // Pattern 8: Try to find quoted text
      if (!extractionSuccessful && Object.keys(clipCaptionsMap).length <= 1) {
        const quotes = chatResponse.match(/["']([^"']{5,})["']/g);
        if (quotes && quotes.length > 0) {
          quotes.forEach((quote, index) => {
            const cleanQuote = quote
              .replace(/^["']|["']$/g, '')
              .trim();
            
            // If we already have a first caption from intro extraction, start at index 2
            const clipNumber = clipCaptionsMap[1] ? index + 2 : index + 1;
            
            if (cleanQuote && !clipCaptionsMap[clipNumber]) {
              clipCaptionsMap[clipNumber] = cleanQuote;
            }
          });
          extractionSuccessful = true;
        }
      }
      
      // If we failed to extract captions with patterns, try splitting by newlines
      if (!extractionSuccessful && Object.keys(clipCaptionsMap).length <= 1) {
        const lines = chatResponse.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && !line.startsWith('**') && !line.startsWith('#'));
        
        if (lines.length > 0) {
          lines.forEach((line, index) => {
            if (index < clipCount) {
              // Skip lines that look like headers or instructions
              if (!/your|create|here|caption|suggestion/i.test(line)) {
                const clipNumber = index + 1;
                if (!clipCaptionsMap[clipNumber]) {
                  clipCaptionsMap[clipNumber] = line
                    .replace(/^\*+|\*+$/g, '')
                    .replace(/^#+|#+$/g, '')
                    .replace(/^["']|["']$/g, '')
                    .trim();
                }
              }
            }
          });
          extractionSuccessful = true;
        }
      }
      
      console.log("Final captions to be applied:", clipCaptionsMap);
      
      // Store extracted captions in localStorage for processing
      if (Object.keys(clipCaptionsMap).length > 0) {
        localStorage.setItem('generatedCaptions', JSON.stringify(clipCaptionsMap));
        localStorage.setItem('hasNewAiCaptions', 'true');
        
        // Also save the first clip caption specifically
        if (clipCaptionsMap[1]) {
          localStorage.setItem('firstClipCaption', clipCaptionsMap[1]);
        }
        
        // Signal the application to use these captions (for the useProductDescription hook)
        window.dispatchEvent(new CustomEvent('chatgpt-captions-extracted'));
        
        // Auto-trigger the apply captions function
        onSubmit();
        
        toast.success(`Applied ${Object.keys(clipCaptionsMap).length} captions to your clips!`);
      } else {
        toast.error("Couldn't extract captions from the ChatGPT response. Try asking for captions with 'Clip 1:', 'Clip 2:' format.");
      }
    } catch (error) {
      console.error("Error applying captions:", error);
      toast.error("Failed to apply captions. Please try again.");
    } finally {
      setIsApplyingCaptions(false);
    }
  };
  
  // When description changes, store it in localStorage for ChatGPT to access
  useEffect(() => {
    if (value.trim()) {
      localStorage.setItem('productDescription', value);
    }
  }, [value]);
  
  // Listen for new captions event
  useEffect(() => {
    const handleNewCaptions = () => {
      toast.success("New captions generated! Click 'APPLY CHATGPT CAPTIONS' to add them to your clips.");
    };
    
    window.addEventListener('new-captions-generated', handleNewCaptions);
    return () => {
      window.removeEventListener('new-captions-generated', handleNewCaptions);
    };
  }, []);

  return (
    <motion.div
      className="mb-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2 text-indigo-400" />
          <h3 className="text-lg font-medium text-white">Video Description</h3>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                  <Info className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p>Describe the content of your TikTok video to generate perfectly matched captions with AI. Include key themes, mood, and target audience.</p>
                <p className="mt-2 text-xs text-indigo-300">ChatGPT will automatically create viral-style captions for each clip you've uploaded.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToChatSection}
            className="text-xs text-indigo-400 hover:text-indigo-300 border-indigo-500/30 relative overflow-hidden group"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Chat with AI
            <span className="absolute inset-0 bg-indigo-400/10 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            {isExpanded ? "Hide Examples" : "Show Examples"}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          className="grid gap-2 mb-4 grid-cols-1 md:grid-cols-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {examplePrompts.map((example, index) => (
            <motion.div
              key={index}
              className="p-3 rounded-md bg-indigo-950/30 border border-indigo-500/20 cursor-pointer hover:bg-indigo-900/30 transition-colors"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleUseExample(example)}
            >
              <p className="text-sm text-gray-300 line-clamp-3">{example}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="relative">
        <Textarea
          placeholder="Describe your TikTok content (style, theme, audience)..."
          className="min-h-[100px] resize-y bg-black/50 border-indigo-500/30 focus:border-indigo-400 text-white placeholder:text-gray-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        
        <div className="mt-6 flex flex-col gap-3">
          <FuturisticButton
            onClick={applyChatGPTCaptions}
            disabled={isApplyingCaptions}
            variant="mega-gradient"
            size="2xl"
            className="w-full py-6 animate-pulse"
            glowIntensity="high"
            pulseEffect={true}
          >
            {isApplyingCaptions ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Applying ChatGPT Captions...
              </>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Wand2 className="h-6 w-6" />
                <span className="text-lg uppercase tracking-wider">APPLY CHATGPT CAPTIONS</span>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
            )}
          </FuturisticButton>
          
          <div className="text-center text-xs text-gray-400 mt-1">
            ↑ Chat with AI first, then click this button to apply captions to your clips ↑
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button
            onClick={onSubmit}
            disabled={!value.trim() || isProcessing}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
          >
            <Tag className="h-4 w-4" />
            {isProcessing ? "Processing..." : "Apply to Video"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDescriptionInput;

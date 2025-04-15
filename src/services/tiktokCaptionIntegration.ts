
import { VideoClip, Caption } from "@/types/video";
import { generateCaptions } from "./openaiIntegration";

// Format timestamps for display (e.g., 1.5 -> "00:01.5")
const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toFixed(1).padStart(4, '0')}`;
};

// Expanded list of keywords that indicate a hook/intro caption
const hookKeywords = [
  'hook', 'hookup', 'attention', 'intro', 'introduction', 'opening', 'catchy',
  'caption', 'title', 'headline', 'attract', 'viral', 'trending', 'grabber',
  'engaging', 'pov', 'beginning', 'start', 'first', 'main', 'shocking', 'mind-blowing',
  'secret', 'discover', 'unlock', 'revealed', 'attention-grabbing', 'eye-catching',
  'jaw-dropping', 'mind-blowing', 'stunning', 'amazing', 'incredible'
];

// List of ChatGPT common phrases to remove
const chatGptPhrases = [
  "feel free to let me know",
  "let me know if you need",
  "if you need any adjustments",
  "if you need any more options",
  "if you have any questions",
  "hope this helps",
  "is there anything else",
  "would you like me to",
  "do you want me to",
  "i've created",
  "i've generated"
];

// Improved markdown formatting cleaner that preserves emojis and removes ChatGPT phrases
const cleanMarkdownFormatting = (text: string): string => {
  if (!text) return "";
  
  console.log("Original caption text before cleaning:", text);
  
  // Check for ChatGPT phrases and truncate text at that point
  for (const phrase of chatGptPhrases) {
    if (text.toLowerCase().includes(phrase)) {
      const index = text.toLowerCase().indexOf(phrase);
      text = text.substring(0, index).trim();
      console.log("Truncated caption after finding ChatGPT phrase:", text);
      break;
    }
  }
  
  // First check for explicit Caption format - this is our highest priority
  const captionFormatRegex = /\*\*Caption:\*\*\s*["']?([^"'\n]+)["']?/i;
  const captionMatch = text.match(captionFormatRegex);
  
  if (captionMatch && captionMatch[1]) {
    console.log("Found explicit Caption format:", captionMatch[1]);
    return captionMatch[1].trim()
      .replace(/^\*+|\*+$/g, '') // Remove surrounding asterisks
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\s*AM\s*/g, '') // Remove standalone AM
      .trim();
  }
  
  // If no explicit caption found, check if this is an AI response with a list of captions
  if (text.includes("Here are") && 
      (text.includes("TikTok captions") || text.includes("caption") || text.includes("hook"))) {
    console.log("Detected special 'Here are' pattern that often causes issues");
    
    // Look for any line with "Caption:" format first (case insensitive)
    const captionRegex = /\*\*(?:Caption|Hook|Intro|Attention)[:]*\*\*\s*["']?([^"'\n]+)["']?/i;
    const captionMatch = text.match(captionRegex);
    
    if (captionMatch && captionMatch[1]) {
      const captionText = captionMatch[1].trim();
      console.log("Found caption in AI response:", captionText);
      return captionText.replace(/\s*AM\s*/g, '');
    }
    
    // Try to find a line that has actual caption content
    const lines = text.split('\n');
    for (const line of lines) {
      // Skip header/explanation lines
      if (line.includes("Here are") || line.includes("Ready to go viral") || 
          line.includes("captions for your")) {
        continue;
      }
      
      // Check for quotes which often contain the actual caption
      const quotedMatch = line.match(/["']([^"']+)["']/);
      if (quotedMatch && quotedMatch[1]) {
        console.log("Found quoted content in line:", quotedMatch[1]);
        return quotedMatch[1].trim().replace(/\s*AM\s*/g, '');
      }
      
      // Check for emoji-rich lines which are often hooks
      if (/\p{Emoji}/u.test(line) && !line.match(/^\d+\./)) {
        const cleanLine = line.trim()
          .replace(/^[-*•]/, '') // Remove list markers
          .replace(/^\d+\./, '') // Remove numbered list markers
          .replace(/^["']|["']$/g, '') // Remove quotes
          .replace(/\*\*([^*]+)\*\*/g, '$1') // Clean bold markdown
          .replace(/\s*AM\s*/g, '') // Remove standalone AM
          .trim();
          
        if (cleanLine && cleanLine.length > 5) {
          console.log("Found emoji-rich line:", cleanLine);
          return cleanLine;
        }
      }
    }
  }
  
  // Enhanced handling for first clip issues - key fix for the first caption problem
  if (text === "**" || text === "*" || text === "***" || text === "****" ||
      text === "###" || text === "##" || text === "#" ||
      /^\s*[\*\#]+\s*$/.test(text)) { // Also catch patterns with whitespace and only symbols
    
    console.log("Detected problematic first clip with symbols only, extracting title from full response");
    
    // Try to extract a more relevant caption
    try {
      const captionsText = localStorage.getItem('lastCaptionsResponse') || '';
      if (captionsText) {
        // First look for any "Caption:" pattern (case insensitive)
        const captionMatch = captionsText.match(/\*\*(?:Caption|Hook|Intro|Attention)[:]*\*\*\s*["']?([^"'\n]+)["']?/i);
        if (captionMatch && captionMatch[1]) {
          const captionText = captionMatch[1].trim()
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .replace(/\s*AM\s*/g, '') // Remove standalone AM
            .trim();
          console.log("Found explicit caption in storage:", captionText);
          return captionText;
        }
        
        // Next, look for Clip 1/first clip pattern
        const clipOneMatch = captionsText.match(/(?:\*\*)?Clip\s*1(?:\*\*)?[:]\s*["']?([^"'\n]+)["']?/i);
        if (clipOneMatch && clipOneMatch[1]) {
          const clipTitle = clipOneMatch[1].trim().replace(/\s*AM\s*/g, '');
          console.log("Found clip 1 title in storage:", clipTitle);
          return clipTitle;
        }
        
        // Try to find numbered captions
        const numberedMatch = captionsText.match(/1\.\s*["']?([^"'\n]+)["']?/);
        if (numberedMatch && numberedMatch[1]) {
          const numberedCaption = numberedMatch[1].trim().replace(/\s*AM\s*/g, '');
          console.log("Found numbered caption in storage:", numberedCaption);
          return numberedCaption;
        }
        
        // Try to find emoji-numbered captions
        const emojiMatch = captionsText.match(/1️⃣\s*["']?([^"'\n]+)["']?/);
        if (emojiMatch && emojiMatch[1]) {
          const emojiCaption = emojiMatch[1].trim().replace(/\s*AM\s*/g, '');
          console.log("Found emoji-numbered caption in storage:", emojiCaption);
          return emojiCaption;
        }
      }
    } catch (error) {
      console.error("Error extracting first caption from storage:", error);
    }
    
    // If all extraction failed, use a more specific fallback
    console.log("Using improved fallback for first clip");
    return "Welcome to our trending content! #viral #trending";
  }
  
  // If we couldn't extract a proper caption from a list, apply standard cleaning
  
  // Remove standard AI response prefixes more aggressively
  let cleaned = text.replace(/^(Sure!|Here are|I've created|Here's)\s+.*?(captions|caption).*?[:\.]/i, "");
  
  // Remove time indicators - including AM/PM references
  cleaned = cleaned.replace(/\b\d{1,2}:\d{2}\s*[AP]M\b/gi, '');
  cleaned = cleaned.replace(/\s*AM\s*/g, '');
  cleaned = cleaned.replace(/\s*PM\s*/g, '');
  
  // Remove ChatGPT common phrases
  for (const phrase of chatGptPhrases) {
    if (cleaned.toLowerCase().includes(phrase)) {
      cleaned = cleaned.split(new RegExp(phrase, 'i'))[0].trim();
      break;
    }
  }
  
  // Special handler for emoji numbering - preserve emojis
  cleaned = cleaned.replace(/(\d+)️⃣\s+/g, (match, num) => {
    // Keep the emoji numbering, it's good visual style
    return match;
  });
  
  // Remove trailing hash marks and asterisks first (these often appear at the end)
  cleaned = cleaned.replace(/#+\s*$/g, '');
  cleaned = cleaned.replace(/\*+\s*$/g, '');
  
  // Remove markdown heading markers completely
  cleaned = cleaned.replace(/###/g, "");
  cleaned = cleaned.replace(/##/g, "");
  cleaned = cleaned.replace(/#/g, "");
  
  // Process asterisks for highlighting - convert to spans for highlighting
  cleaned = cleaned.replace(/\*\*\*([^*]+)\*\*\*/g, '<span class="highlight-green">$1</span>'); 
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '<span class="highlight-green">$1</span>'); 
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '<span class="highlight-green">$1</span>'); 
  
  // Remove any remaining unpaired asterisks
  cleaned = cleaned.replace(/\*+/g, "");
  
  // Remove markdown headers
  cleaned = cleaned.replace(/^#+\s+/gm, "");
  
  // Remove any leading/trailing quotes
  cleaned = cleaned.replace(/^["']|["']$/g, "");
  
  // Remove numbered list markers (1., 2., etc.) but keep emoji numbers
  cleaned = cleaned.replace(/^\d+\.\s*/gm, "");
  
  // Remove common AI response phrases
  cleaned = cleaned.replace(/^(Here is|This caption|A caption for)/i, "");
  
  // If we still have very little text after cleaning, try to extract any meaningful content
  if (cleaned.trim().length < 5 && text.length > 20) {
    // Look for any text between quotes that might be the actual caption
    const quotedMatch = text.match(/["']([^"']+)["']/);
    if (quotedMatch && quotedMatch[1]) {
      return cleanMarkdownFormatting(quotedMatch[1]);
    }
    
    // Look for anything after colons
    const afterColon = text.split(':')[1];
    if (afterColon && afterColon.trim().length > 5) {
      return cleanMarkdownFormatting(afterColon);
    }
  }
  
  // Final cleanup
  cleaned = cleaned.trim();
  
  // Extra safety check to catch any remaining markdown formatting
  cleaned = cleaned.replace(/#+\s*$/g, ''); // Remove any trailing hash marks again
  cleaned = cleaned.replace(/\*+\s*$/g, ''); // Remove any trailing asterisks again
  
  // If we somehow ended up with an empty string or just symbols, return a fallback
  if (cleaned.length < 2 || 
      /^[\*\#]+$/.test(cleaned) || // Only contains * or # characters
      cleaned === "**" || 
      cleaned === "*" || 
      cleaned === "***" ||
      cleaned === "###" || 
      cleaned === "##" || 
      cleaned === "#") {
    console.log("Caption was invalid, using fallback");
    return "Welcome to our trending content! #viral #trending";
  }
  
  console.log("Final cleaned caption:", cleaned);
  return cleaned || "Welcome to our trending content! #viral #trending";
};

// Generate a single TikTok caption for a specific clip using OpenAI
export const generateTikTokCaption = async (
  clip: VideoClip,
  contentDescription: string
): Promise<string> => {
  try {
    const captionsText = await generateCaptions(contentDescription);
    console.log("Raw caption from OpenAI:", captionsText);
    
    // Store the raw caption response for potential extraction later
    localStorage.setItem('lastCaptionsResponse', captionsText);
    
    // First look for explicit caption markers in the response
    const captionFormats = ["caption:", "intro caption:", "hook:", "attention grabber:", "intro:", "opening:"];
    
    for (const format of captionFormats) {
      const regex = new RegExp(`\\*\\*(?:${format})\\*\\*\\s*["']?([^"'\n]+)["']?`, 'i');
      const match = captionsText.match(regex);
      if (match && match[1]) {
        console.log(`Found explicit ${format}:`, match[1]);
        return cleanMarkdownFormatting(match[1]);
      }
    }
    
    // First clean the whole response
    let cleanedText = cleanMarkdownFormatting(captionsText);
    console.log("Cleaned caption:", cleanedText);
    
    // If the cleaned text is too short or looks like a symbol, use improved extraction
    if (cleanedText.length < 3 || /^[\*\#]+$/.test(cleanedText)) {
      // Try to extract from the response differently
      const quotedMatch = captionsText.match(/["']([^"'\n]+)["']/);
      if (quotedMatch && quotedMatch[1]) {
        return cleanMarkdownFormatting(quotedMatch[1]);
      }
      
      return "Welcome to our trending content! #viral #trending";
    }
    
    // Look for lines that start with numbers (like "1. Caption text")
    const numberedMatch = captionsText.match(/\d+\.\s*(.+)/);
    if (numberedMatch && numberedMatch[1]) {
      return cleanMarkdownFormatting(numberedMatch[1]);
    }
    
    // Look specifically for "Clip 1:" format in caption responses
    if (captionsText.includes("Clip 1:")) {
      const clipMatch = captionsText.match(/Clip\s*1\s*:(.+?)(?:\n|$)/i);
      if (clipMatch && clipMatch[1]) {
        return cleanMarkdownFormatting(clipMatch[1]);
      }
    }
    
    // If all else fails, return the cleaned first line
    return cleanedText.split('\n')[0];
  } catch (error) {
    console.error("Error generating TikTok caption:", error);
    return "Welcome to our trending content! #viral #trending";
  }
};

// Generate captions specifically for TikTok format
export const generateTikTokCaptions = async (
  clips: VideoClip[],
  contentDescription?: string
): Promise<Caption[]> => {
  const captions: Caption[] = [];
  
  try {
    if (!contentDescription || clips.length === 0) return captions;
    
    // Generate captions using OpenAI
    const captionsText = await generateCaptions(contentDescription);
    console.log("Raw caption text from OpenAI:", captionsText);
    
    // Store the raw captions for potential extraction later
    localStorage.setItem('lastCaptionsResponse', captionsText);
    localStorage.setItem('hasNewAiCaptions', 'true');
    
    // Method 1: First check for explicit caption/hook formats
    let firstCaption = null;
    const captionFormats = ["caption:", "intro caption:", "hook:", "attention grabber:", "intro:", "opening:"];
    
    for (const format of captionFormats) {
      const regex = new RegExp(`\\*\\*(?:${format})\\*\\*\\s*["']?([^"'\n]+)["']?`, 'i');
      const match = captionsText.match(regex);
      if (match && match[1]) {
        firstCaption = cleanMarkdownFormatting(match[1]);
        console.log(`Found explicit ${format}:`, firstCaption);
        break;
      }
    }
    
    // Method 2: Look specifically for "Clip X:" format in the response
    const clipCaptionMatches = captionsText.match(/(?:\*\*)?Clip\s*\d+(?:\*\*)?[:]\s*["']?([^"'\n]+)["']?/gi);
    const extractedClipCaptions: string[] = [];
    
    if (clipCaptionMatches && clipCaptionMatches.length > 0) {
      console.log("Found clip caption matches in Clip X: format:", clipCaptionMatches);
      
      clipCaptionMatches.forEach(match => {
        const captionText = match.replace(/(?:\*\*)?Clip\s*\d+(?:\*\*)?[:]\s*["']?([^"'\n]+)["']?/i, '$1').trim();
        extractedClipCaptions.push(cleanMarkdownFormatting(captionText));
      });
    }
    
    // Method 3: Try to find numbered list captions
    const numberedMatches = captionsText.match(/\d+\.\s*["']?([^"'\n]+)["']?/g);
    const extractedNumberedCaptions: string[] = [];
    
    if (numberedMatches && numberedMatches.length > 0) {
      console.log("Found numbered caption matches:", numberedMatches);
      
      numberedMatches.forEach(match => {
        const captionText = match.replace(/\d+\.\s*["']?([^"'\n]+)["']?/i, '$1').trim();
        extractedNumberedCaptions.push(cleanMarkdownFormatting(captionText));
      });
    }
    
    // Method 4: Try to find emoji-numbered captions 
    const emojiMatches = captionsText.match(/\d+️⃣\s*["']?([^"'\n]+)["']?/g);
    const extractedEmojiCaptions: string[] = [];
    
    if (emojiMatches && emojiMatches.length > 0) {
      console.log("Found emoji-numbered caption matches:", emojiMatches);
      
      emojiMatches.forEach(match => {
        const captionText = match.replace(/\d+️⃣\s*["']?([^"'\n]+)["']?/i, '$1').trim();
        extractedEmojiCaptions.push(cleanMarkdownFormatting(captionText));
      });
    }
    
    // Combine all our findings, prioritizing the most specific ones
    let allCaptions: string[] = [];
    
    // If we have a first caption/hook and clip captions, combine them
    if (firstCaption) {
      allCaptions.push(firstCaption);
      
      if (extractedClipCaptions.length > 0) {
        allCaptions = allCaptions.concat(extractedClipCaptions);
      } else if (extractedNumberedCaptions.length > 0) {
        allCaptions = allCaptions.concat(extractedNumberedCaptions);
      } else if (extractedEmojiCaptions.length > 0) {
        allCaptions = allCaptions.concat(extractedEmojiCaptions);
      }
    } 
    // If no explicit first caption but we have clip captions
    else if (extractedClipCaptions.length > 0) {
      allCaptions = extractedClipCaptions;
    }
    // If we only have numbered captions
    else if (extractedNumberedCaptions.length > 0) {
      allCaptions = extractedNumberedCaptions;
    }
    // If we only have emoji captions
    else if (extractedEmojiCaptions.length > 0) {
      allCaptions = extractedEmojiCaptions;
    }
    // If we still don't have captions, fall back to quotes
    else {
      const quotedMatches = captionsText.match(/["']([^"'\n]{5,})["']/g) || [];
      allCaptions = quotedMatches.map(match => {
        return match.replace(/^["']|["']$/g, '').trim();
      });
    }
    
    console.log("All extracted captions:", allCaptions);
    
    // If we still don't have captions, use a last resort method: split by lines
    if (allCaptions.length === 0) {
      const lines = captionsText.split('\n')
        .filter(line => line.trim().length > 10)
        .filter(line => !line.includes("Here are"))
        .filter(line => !line.includes("captions for your"))
        .map(line => cleanMarkdownFormatting(line));
      
      if (lines.length > 0) {
        allCaptions = lines;
      }
    }
    
    // Create caption objects for all clips
    clips.forEach((clip, index) => {
      let captionText;
      
      if (index < allCaptions.length) {
        captionText = allCaptions[index];
      } else {
        // Cycle through available captions or use fallback
        captionText = allCaptions.length > 0 
          ? allCaptions[index % allCaptions.length] 
          : (index === 0 
            ? "Welcome to our trending content! #viral #trending" 
            : `Check out this amazing ${contentDescription || 'content'}!`);
      }
      
      captions.push({
        text: captionText,
        startTime: clip.startTime || 0,
        endTime: clip.endTime || 0,
        style: "tiktok-style"
      });
    });
    
    // Store the extracted first caption separately for special handling
    if (captions.length > 0 && captions[0].text) {
      localStorage.setItem('firstClipCaption', captions[0].text);
    }
    
  } catch (error) {
    console.error("Error generating TikTok captions:", error);
    
    // Provide fallback captions in case of error
    clips.forEach((clip, index) => {
      captions.push({
        text: index === 0 
          ? "Welcome to our trending content! #viral #trending" 
          : "Check out this amazing content!",
        startTime: clip.startTime || 0,
        endTime: clip.endTime || 0,
        style: "tiktok-style"
      });
    });
  }
  
  return captions;
};

// Create a TikTok style caption template
export const createTikTokCaptionTemplate = (text: string): Partial<Caption> => {
  return {
    text: cleanMarkdownFormatting(text),
    style: "tiktok-style"
  };
};

export default {
  generateTikTokCaptions,
  createTikTokCaptionTemplate,
  formatTimestamp,
  generateTikTokCaption
};

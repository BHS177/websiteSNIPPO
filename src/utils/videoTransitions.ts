
import { VideoClip } from "@/types/video";

// Helper function for fade animation
export const animateFade = async (
  ctx: CanvasRenderingContext2D,
  fromOpacity: number,
  toOpacity: number,
  duration: number,
  canvas: HTMLCanvasElement
) => {
  const startTime = performance.now();
  
  return new Promise<void>((resolve) => {
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentOpacity = fromOpacity + (toOpacity - fromOpacity) * progress;
      
      // Take a snapshot of the canvas at each step to apply fade
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Clear and draw with new opacity
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = currentOpacity;
      ctx.putImageData(snapshot, 0, 0);
      ctx.globalAlpha = 1;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };
    
    animate();
  });
};

// Function to draw text with TikTok-style animations
export const drawAnimatedText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  animationTime: number = 0
) => {
  // Clean the text from any unwanted patterns
  const cleanedText = cleanCaptionText(text);
  
  // If text is empty after cleaning, don't draw anything
  if (!cleanedText.trim()) return;
  
  ctx.save();
  
  // TikTok-style text properties - medium font size for TikTok style
  ctx.font = 'bold 18px Arial'; // Medium size that matches the reference image
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add stronger shadow for better visibility - pure black like in photo
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Apply subtle animation effect
  const bounceOffset = Math.sin(animationTime * 3) * 2;
  
  // Draw the text in uppercase to match TikTok style
  ctx.fillText(cleanedText.toUpperCase(), x, y + bounceOffset);
  
  // Reset context properties
  ctx.restore();
};

// Helper function to clean caption text from AI assistant boilerplate
export const cleanCaptionText = (text: string): string => {
  if (!text) return '';
  
  // Remove any AM/PM timezone markers that might appear
  let cleaned = text.replace(/\s*AM\s*/g, '').replace(/\s*PM\s*/g, '');
  
  // Remove common AI assistant phrases and boilerplate
  const phrasesToRemove = [
    // Closing statements
    "Let me know if you need any adjustments",
    "Feel free to let me know",
    "Feel free to",
    "Let me know if",
    "I hope this helps",
    "Hope this helps",
    "Is there anything else",
    "Do you need any other",
    "Would you like me to",
    "Please let me know",
    "How does this sound",
    // Opening statements
    "Here's a caption",
    "Here are some captions",
    "Here is a caption",
    "I've created",
    "I've generated",
    "I've prepared",
    "Here's what I came up with",
    "Here's my suggestion",
    "For this clip",
    "For the clip",
    // Generic phrases
    "more options",
    "additional options",
    "adjustments",
    "variations",
    "feedback"
  ];
  
  // Remove each of the phrases (case insensitive)
  phrasesToRemove.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  // Remove lines that are addressing the user directly
  cleaned = cleaned.split('\n')
    .filter(line => {
      const lowerLine = line.toLowerCase();
      return !lowerLine.includes('let me know') && 
             !lowerLine.includes('feel free') &&
             !lowerLine.includes('hope this') &&
             !lowerLine.includes('please ') &&
             !lowerLine.includes('adjustments');
    })
    .join('\n');
  
  // Remove any markdown formatting
  cleaned = cleaned.replace(/\*\*/g, '').replace(/\*/g, '');
  
  // Remove any colons at the end of the string
  cleaned = cleaned.replace(/:\s*$/, '');
  
  // Remove any quotes
  cleaned = cleaned.replace(/["']/g, '');
  
  // Trim whitespace and multiple spaces
  cleaned = cleaned.trim().replace(/\s+/g, ' ');
  
  return cleaned;
};

// Function to format text into staggered caption lines (TikTok style)
export const formatTikTokStaggeredText = (text: string): string[] => {
  if (!text) return [];
  
  // Clean the text first
  const cleanedText = cleanCaptionText(text);
  
  // If cleaned text is empty, return empty array
  if (!cleanedText) return [];
  
  // If text is very short, just return it as a single line
  if (cleanedText.length <= 15) return [cleanedText];
  
  // Split text into words
  const words = cleanedText.split(' ');
  
  // For very short captions (2-4 words) - use two lines
  if (words.length <= 4) {
    const midpoint = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, midpoint).join(' ');
    const secondLine = words.slice(midpoint).join(' ');
    return [firstLine, secondLine];
  }
  
  // For longer captions - use three lines with staggered formatting
  // Calculate roughly how to split into 3 parts
  const totalWords = words.length;
  let firstBreak, secondBreak;
  
  // Strategy: Create 3 segments of text, then sort by length
  // This creates the staggered appearance with shortest-longest-shortest pattern
  
  // Try to create natural breaks at roughly 1/3 and 2/3 of the way through
  firstBreak = Math.floor(totalWords / 3);
  secondBreak = Math.floor(totalWords * 2 / 3);
  
  // Make adjustments to avoid breaking in awkward places
  // Adjust breaks to avoid splitting after prepositions, articles, etc.
  const breakWords = ['the', 'a', 'an', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'with', 'by'];
  
  // Adjust first break point if needed
  if (breakWords.includes(words[firstBreak - 1].toLowerCase())) {
    firstBreak--; // Move break earlier to avoid ending line with preposition
  } else if (breakWords.includes(words[firstBreak].toLowerCase())) {
    firstBreak++; // Move break later to include preposition with following content
  }
  
  // Adjust second break point if needed
  if (breakWords.includes(words[secondBreak - 1].toLowerCase())) {
    secondBreak--;
  } else if (breakWords.includes(words[secondBreak].toLowerCase())) {
    secondBreak++;
  }
  
  // Ensure breaks don't go out of bounds
  firstBreak = Math.max(1, Math.min(firstBreak, totalWords - 2));
  secondBreak = Math.max(firstBreak + 1, Math.min(secondBreak, totalWords - 1));
  
  // Create the three lines
  const line1 = words.slice(0, firstBreak).join(' ');
  const line2 = words.slice(firstBreak, secondBreak).join(' ');
  const line3 = words.slice(secondBreak).join(' ');
  
  // Create an array of lines
  const lines = [line1, line2, line3];
  
  // Sort lines by length to create staggered appearance
  // This is key to the TikTok style - shortest lines at top and bottom
  lines.sort((a, b) => a.length - b.length);
  
  // If the lines have very similar lengths, keep original order
  if (Math.abs(lines[0].length - lines[1].length) < 3 &&
      Math.abs(lines[1].length - lines[2].length) < 3) {
    return [line1, line2, line3];
  }
  
  // Return the properly sorted lines (shortest, longest, medium)
  if (lines.length === 3) {
    // Get the shortest line
    const shortest = lines[0];
    // Get the longest line
    const longest = lines[2];
    // Get the middle length line
    const middle = lines[1];
    
    return [shortest, longest, middle];
  }
  
  return lines;
};

// Function to draw captions in TikTok style
export const drawTikTokCaption = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  y: number,
  fontSize: number = 18, // Medium font size that matches the reference image
  animation: "bounce" | "shake" | "scale" | "wave" = "bounce",
  time: number = 0,
  highlight: boolean = false
) => {
  // Clean the text first
  const cleanedText = cleanCaptionText(text);
  
  // Skip if text is empty after cleaning
  if (!cleanedText || cleanedText.trim() === '') return;
  
  // Create caption with transparent background
  ctx.save();
  
  // Center position is key for TikTok style
  const padding = 8; // Medium padding
  ctx.font = `bold ${fontSize}px Arial`;
  
  // Format text into staggered TikTok style lines
  const staggeredLines = formatTikTokStaggeredText(cleanedText);
  
  // Skip if no lines to render
  if (staggeredLines.length === 0) {
    ctx.restore();
    return;
  }
  
  // Draw each line with proper spacing
  const lineHeight = fontSize * 1.2;
  const totalHeight = staggeredLines.length * lineHeight;
  
  // Get the base Y position (shifted up if multiple lines)
  const baseY = y - ((staggeredLines.length - 1) * lineHeight / 2);
  
  // For TikTok-style captions, we don't use background boxes, just outlined text
  for (let i = 0; i < staggeredLines.length; i++) {
    const lineY = baseY + (i * lineHeight);
    
    // Draw text with a stronger shadow/outline for better visibility
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add deeper pure black text shadow for better readability 
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10; // Increased shadow blur
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Use medium font for TikTok style
    ctx.font = `bold ${fontSize}px Arial`;
    
    // Use white text with highlight if needed
    if (highlight) {
      ctx.fillStyle = "#8B5CF6"; // Purple highlight
    } else {
      ctx.fillStyle = "#FFFFFF"; // White
    }
    
    // Draw the text (uppercase for TikTok style)
    ctx.fillText(staggeredLines[i].toUpperCase(), canvas.width / 2, lineY);
  }
  
  ctx.restore();
};

// Helper function to draw rounded rectangles
export const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

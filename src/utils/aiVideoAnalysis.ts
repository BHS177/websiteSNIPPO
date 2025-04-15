import { VideoClip, TextOverlay } from '@/types/video';

/**
 * Analyzes video clips to extract the best segments and rank them
 * for optimal sequencing and narrative flow
 */
export interface ClipAnalysisResult {
  clipId: number;
  score: number;
  bestStartTime: number;
  bestEndTime: number;
  emotionalImpact: number;
  motionScore: number;
  visualClarity: number;
  recommended: boolean;
}

/**
 * Uses AI-driven analysis to find the most engaging 3-4 second segment in a clip
 */
export const analyzeClipForBestSegment = (clip: VideoClip): ClipAnalysisResult => {
  console.log(`Analyzing clip ${clip.id} for best segment extraction`);
  
  // Default segment duration (3-4 seconds based on requirements)
  const targetDuration = clip.duration && clip.duration > 4 ? 3.5 : Math.min(clip.duration || 3, 3);
  
  // Calculate scores for different segments of the clip
  // In a real implementation, this would use computer vision and ML models
  // Here we use a simplified approach that favors segments in the middle or with specific patterns
  let bestStartTime = 0;
  let bestEndTime = Math.min(targetDuration, clip.duration || 3);
  let bestScore = 0;
  
  if (clip.duration && clip.duration > targetDuration + 0.5) {
    // For longer clips, analyze different segments to find the best one
    const segmentCount = Math.floor((clip.duration - targetDuration) / 0.5) + 1;
    const segments = Array.from({ length: segmentCount }, (_, i) => i * 0.5);
    
    segments.forEach(startTime => {
      const endTime = startTime + targetDuration;
      if (endTime <= clip.duration!) {
        // Calculate a score for this segment based on various factors
        // This simulates AI analysis of motion, visual quality, etc.
        
        // Golden ratio positioning (segments near 1/3 or 2/3 of clip duration get higher scores)
        const positionScore = 1 - Math.min(
          Math.abs((startTime / clip.duration!) - 0.33),
          Math.abs((startTime / clip.duration!) - 0.66)
        );
        
        // Movement score (segments in the middle generally have more action)
        const movementFactor = 1 - Math.abs((startTime + endTime) / 2 / clip.duration! - 0.5) * 1.5;
        
        // Add a bit of randomness to simulate varied analysis results
        const randomFactor = 0.1 + Math.random() * 0.1;
        
        // Combine factors for final score
        const segmentScore = positionScore * 0.4 + movementFactor * 0.4 + randomFactor * 0.2;
        
        if (segmentScore > bestScore) {
          bestScore = segmentScore;
          bestStartTime = startTime;
          bestEndTime = endTime;
        }
      }
    });
  }
  
  // Calculate additional metrics for the best segment
  const visualClarity = 0.6 + Math.random() * 0.4; // Simulated visual quality score
  const motionScore = 0.5 + Math.random() * 0.5;   // Simulated motion dynamics score
  const emotionalImpact = 0.4 + Math.random() * 0.6; // Simulated emotional impact score
  
  // Final normalized score combining all factors
  const normalizedScore = (bestScore * 0.4 + visualClarity * 0.3 + motionScore * 0.15 + emotionalImpact * 0.15);
  
  return {
    clipId: clip.id,
    score: normalizedScore,
    bestStartTime,
    bestEndTime,
    visualClarity,
    motionScore,
    emotionalImpact,
    recommended: normalizedScore > 0.65 // Flag if this clip is highly recommended
  };
};

/**
 * Analyzes an array of clips to determine the best segments and sequence
 */
export const analyzeClipsCollection = (clips: VideoClip[]): ClipAnalysisResult[] => {
  console.log(`Analyzing ${clips.length} clips for optimal sequencing`);
  
  if (!clips || clips.length === 0) {
    return [];
  }
  
  // Analyze each clip individually
  const analysisResults = clips.map(clip => analyzeClipForBestSegment(clip));
  
  // Sort by score, highest first
  analysisResults.sort((a, b) => b.score - a.score);
  
  return analysisResults;
};

/**
 * Creates an optimized sequence of clips based on analysis results
 * Implements a narrative structure: Hook → Details → Benefits → Call to Action
 */
export const createOptimizedSequence = (
  clips: VideoClip[],
  analysisResults: ClipAnalysisResult[]
): VideoClip[] => {
  if (clips.length === 0) return [];
  console.log(`Creating optimized sequence from ${clips.length} clips`);
  
  // Map analysis results back to clips while maintaining original order
  const processedClips = clips.map(clip => {
    const analysis = analysisResults.find(a => a.clipId === clip.id) || analyzeClipForBestSegment(clip);
    
    // Create a new clip with the optimized segment information
    return {
      ...clip,
      startTime: analysis.bestStartTime,
      endTime: analysis.bestEndTime,
      duration: analysis.bestEndTime - analysis.bestStartTime,
      sequence: clip.sequence, // Maintain original sequence
      score: analysis.score,
      transitionStyle: 'fade-in', // Consistent transitions for smoother flow
      transitionIn: 'fade',
      transitionDuration: 0.7
    };
  });
  
  return processedClips;
};

// Helper function to generate clip captions
const generateClipCaption = (description: string, index: number, total: number): string => {
  const templates = [
    `*Feature ${index}:* Perfect for ${description} enthusiasts 💯`,
    `Here's why this ${description} is *different* ⭐`,
    `The *secret* to amazing ${description} results 🎯`,
    `Transform your ${description} experience *instantly* ✨`
  ];
  return templates[index % templates.length];
};

// Helper function to generate closing caption
const generateClosingCaption = (description: string): string => {
  const closingTemplates = [
    `*Get yours now* and transform your ${description} game! 🔥`,
    `Don't miss out on this *amazing ${description}* opportunity! 💫`,
    `*Limited time offer* - Get your ${description} today! ⚡`,
    `Join thousands of satisfied ${description} users! *Order now* 🌟`
  ];
  return closingTemplates[Math.floor(Math.random() * closingTemplates.length)];
};

/**
 * Generates seamless captions that flow across clip transitions
 * with improved product description handling
 */
export const generateSeamlessCaptions = (
  clips: VideoClip[],
  productDescription?: string
): { captions: Record<number, string>, positions: Record<number, TextOverlay['position']> } => {
  console.log('Generating seamless captions across clip transitions');
  
  // Get baseline product description
  const description = productDescription || localStorage.getItem('productDescription') || '';
  
  // Initialize caption storage
  const captions: Record<number, string> = {};
  const positions: Record<number, TextOverlay['position']> = {};
  
  // Sort clips by sequence
  const sortedClips = [...clips].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  
  // Check for existing captions first
  try {
    const savedCaptions = localStorage.getItem('generatedCaptions');
    const savedPositions = localStorage.getItem('captionPositions');
    
    if (savedCaptions) {
      const parsedCaptions = JSON.parse(savedCaptions);
      Object.keys(parsedCaptions).forEach(id => {
        const clipId = parseInt(id);
        const clip = sortedClips.find(c => c.id === clipId);
        if (clip) {
          captions[clipId] = parsedCaptions[id];
          positions[clipId] = 'center';
        }
      });
    }
    
    if (savedPositions) {
      const parsedPositions = JSON.parse(savedPositions);
      Object.keys(parsedPositions).forEach(id => {
        const clipId = parseInt(id);
        if (captions[clipId]) {
          positions[clipId] = parsedPositions[id];
        }
      });
    }
  } catch (error) {
    console.error("Error loading saved captions:", error);
  }
  
  // Get the first and last clips
  const openingClip = sortedClips[0];
  const closingClip = sortedClips[sortedClips.length - 1];
  const middleClips = sortedClips.slice(1, -1);
  
  // Generate opening caption if needed
  if (openingClip && !captions[openingClip.id]) {
    const openingText = generateOpeningCaption(description);
    captions[openingClip.id] = openingText;
    positions[openingClip.id] = "center";
  }
  
  // Generate middle captions
  middleClips.forEach((clip, index) => {
    if (!captions[clip.id]) {
      const clipText = generateClipCaption(description, index + 1, middleClips.length);
      captions[clip.id] = clipText;
      positions[clip.id] = index % 2 === 0 ? "bottom" : "top";
    }
  });
  
  // Generate closing caption if needed
  if (closingClip && !captions[closingClip.id]) {
    const closingText = generateClosingCaption(description);
    captions[closingClip.id] = closingText;
    positions[closingClip.id] = "center";
  }
  
  // Store the generated captions and positions
  try {
    localStorage.setItem('generatedCaptions', JSON.stringify(captions));
    localStorage.setItem('captionPositions', JSON.stringify(positions));
    localStorage.setItem('usingSequenceCaptions', 'false'); // Mark that we're using clip IDs
  } catch (error) {
    console.error("Error saving captions to localStorage:", error);
  }
  
  return { captions, positions };
};

// Helper function to generate opening caption
const generateOpeningCaption = (description: string): string => {
  const openingTemplates = [
    `*Check out* this amazing ${description} 🔥`,
    `Want to know about the *best ${description}*? 👀`,
    `*Introducing* the perfect ${description} solution! ✨`,
    `This ${description} will *change your life*! 🚀`
  ];
  return openingTemplates[Math.floor(Math.random() * openingTemplates.length)];
};

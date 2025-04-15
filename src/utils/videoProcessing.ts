import { VideoClip, TextOverlay, TextStyle, TextAnimation } from "@/types/video";

export type SequencePattern = 'forward' | 'reverse' | 'random' | 'alternating' | 'custom' | 'ai-optimized' | 'advertisement';

/**
 * Generates a sequence of clips based on the specified pattern
 */
export const generateSequence = (
  clips: VideoClip[],
  pattern: SequencePattern,
  customPattern?: string,
  textStyle?: TextStyle
): VideoClip[] => {
  if (clips.length <= 1) return [...clips];
  
  // Create a deep clone of the clips to avoid reference issues
  const sortedClips = JSON.parse(JSON.stringify(clips)).sort((a: VideoClip, b: VideoClip) => 
    (a.sequence ?? 0) - (b.sequence ?? 0)
  );
  
  // Log the number of clips being processed
  console.log(`Processing ${sortedClips.length} clips with pattern: ${pattern}`);
  
  let result: VideoClip[] = [];
  
  switch (pattern) {
    case 'forward':
      result = sortedClips;
      break;
    
    case 'reverse':
      result = [...sortedClips].reverse();
      break;
    
    case 'random':
      result = shuffleArray([...sortedClips]);
      break;
    
    case 'alternating':
      const odd = sortedClips.filter((_: VideoClip, i: number) => i % 2 === 0);
      const even = sortedClips.filter((_: VideoClip, i: number) => i % 2 === 1);
      result = [...odd, ...even];
      break;
    
    case 'custom':
      if (!customPattern) return sortedClips;
      
      try {
        const indexPattern = customPattern.split(',').map(s => parseInt(s.trim()) - 1);
        
        // Validate indexes are in range
        const validIndexes = indexPattern.every(idx => idx >= 0 && idx < sortedClips.length);
        
        if (!validIndexes) {
          console.error("Invalid indexes in custom pattern");
          return sortedClips;
        }
        
        result = indexPattern.map(idx => sortedClips[idx]);
      } catch (error) {
        console.error("Error applying custom pattern:", error);
        return sortedClips;
      }
      break;
      
    case 'advertisement':
      // IMPORTANT: Modified version with NO TRANSITIONS
      console.log(`Advertisement pattern with ${sortedClips.length} clips - NO TRANSITIONS`);
      
      // Default text style if none provided
      const defaultTextStyle: TextStyle = {
        id: 'default-ad-style',
        name: 'Default Ad Style',
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fontColor: '#FFFFFF',
        backgroundColor: 'rgba(0,0,0,0.5)',
        animation: 'none', // Changed to "none" to prevent animation freeze
        // Add required TextStyle properties
        color: '#FFFFFF',
        textAlign: 'center',
        padding: 10,
        borderRadius: 4,
        background: 'rgba(0,0,0,0.5)',
        margin: 0
      };
      
      // Use provided text style or default
      const adTextStyle = textStyle || defaultTextStyle;
      
      // Process each clip - NO TRANSITIONS
      const processedClips = sortedClips.map((clip, index) => {
        // Clean clip - no transitions, precise timing
        let trimmedClip = { ...clip };
        
        if (clip.duration > 3) {
          // Find optimal segment - use clean integer values
          const segmentDuration = 3;
          const bestStartTime = clip.duration > 5 
            ? Math.floor((clip.duration - segmentDuration) * 0.3) 
            : 0;
          
          trimmedClip = {
            ...clip,
            startTime: bestStartTime,
            endTime: bestStartTime + segmentDuration,
            duration: segmentDuration
          };
        }
        
        // Create appropriate text overlay
        let textContent: string;
        
        // Different text overlays based on sequence position
        if (index === 0) {
          textContent = "INTRODUCING";
        } else if (index === sortedClips.length - 1) {
          textContent = "GET YOURS TODAY";
        } else if (index === Math.floor(sortedClips.length / 2)) {
          textContent = "PREMIUM QUALITY";
        } else {
          // Generate dynamic benefits/features text
          const benefitTexts = [
            "EFFORTLESS PERFORMANCE",
            "SLEEK DESIGN",
            "OUTSTANDING QUALITY",
            "NEXT-GEN TECHNOLOGY",
            "PERFECT RESULTS",
            "PROFESSIONAL GRADE",
            "EXCEPTIONAL VALUE"
          ];
          textContent = benefitTexts[index % benefitTexts.length];
        }
        
        // Create the text overlay with styling - NO ANIMATIONS
        const textOverlay: TextOverlay = {
          text: textContent,
          position: "center", // Always use center position
          style: adTextStyle,
          animation: "none", // Force no animation
          startTime: 0.2, // Small delay to ensure reliable start
          endTime: trimmedClip.duration ? trimmedClip.duration - 0.2 : undefined // End slightly early
        };
        
        return {
          ...trimmedClip,
          score: 0.7 + (Math.random() * 0.3), // High baseline score for all clips
          transitionStyle: 'none', // NO TRANSITION
          transitionDuration: 0, // ZERO DURATION
          textOverlay
        };
      });
      
      // For advertisement pattern, arrange clips but KEEP IT SIMPLE
      if (processedClips.length >= 4) {
        // Extract first and last clips
        const firstClip = processedClips[0];
        const lastClip = processedClips[processedClips.length - 1];
        
        // Get middle clips
        const middleClips = processedClips.slice(1, processedClips.length - 1);
        
        // Just ensure first and last are in place, middle can be simple
        result = [
          firstClip,
          ...middleClips,
          lastClip
        ];
      } else {
        // For 3 or fewer clips, keep original order
        result = processedClips;
      }
      
      // Verify all clips are included
      console.log(`Advertisement sequence created with ${result.length} clips (from ${sortedClips.length} original clips)`);
      
      // Set NO transitions for all clips
      result = result.map(clip => ({
        ...clip,
        transitionStyle: 'none', // NO transition
        transitionDuration: 0    // ZERO DURATION
      }));
      break;
      
    case 'ai-optimized':
      // Modified AI optimization - NO TRANSITIONS
      console.log(`AI-optimized pattern with ${sortedClips.length} clips - NO TRANSITIONS`);
      
      // Process all clips with consistent durations but NO transitions
      const optimizedClips = sortedClips.map(clip => {
        // Smart trimming - standardize to 3 seconds if longer
        let trimmedClip = { ...clip };
        
        if (clip.duration > 3) {
          const segmentDuration = 3;
          const bestStartTime = Math.floor((clip.duration - segmentDuration) * 0.3);
          
          trimmedClip = {
            ...clip,
            startTime: bestStartTime,
            endTime: bestStartTime + segmentDuration,
            duration: segmentDuration,
            transitionIn: 'none',
            transitionDuration: 0
          };
        }
        
        return {
          ...trimmedClip,
          score: 0.8 + (Math.random() * 0.2), // High scores for all
          transitionStyle: 'none', // NO TRANSITION
          transitionDuration: 0 // ZERO DURATION
        };
      });
      
      // Keep it simple - sort by score
      optimizedClips.sort((a, b) => (b.score || 0) - (a.score || 0));
      result = optimizedClips;
      
      // Verify all clips are included
      console.log(`AI-optimized sequence created with ${result.length} clips (from ${sortedClips.length} original clips)`);
      break;
      
    default:
      result = sortedClips;
  }
  
  // Final verification that all clips are included
  if (result.length !== sortedClips.length) {
    console.warn(`Warning: Result has ${result.length} clips but original had ${sortedClips.length} clips`);
  }
  
  // Ensure sequence numbers are updated and ALL TRANSITIONS ARE REMOVED
  return result.map((clip, index) => ({
    ...clip,
    sequence: index,
    transitionStyle: 'none', // REMOVE ALL TRANSITIONS
    transitionDuration: 0,    // ZERO DURATION
    // Force integer values for start/end times to avoid precision issues
    startTime: clip.startTime ? Math.floor(clip.startTime * 10) / 10 : undefined,
    endTime: clip.endTime ? Math.floor(clip.endTime * 10) / 10 : undefined
  }));
};

/**
 * Generates multiple different sequences from the same clips
 */
export const generateMultipleSequences = (
  clips: VideoClip[],
  count: number = 5,
  textStyle?: TextStyle
): VideoClip[][] => {
  const sequences: VideoClip[][] = [];
  
  // Standard patterns to include
  const patterns: SequencePattern[] = ['forward', 'reverse', 'random', 'alternating', 'advertisement', 'ai-optimized'];
  
  // Add standard patterns first
  patterns.forEach(pattern => {
    sequences.push(generateSequence(clips, pattern, undefined, textStyle));
  });
  
  // Fill remaining count with random variations
  while (sequences.length < count) {
    sequences.push(generateSequence(clips, 'random'));
  }
  
  return sequences;
};

/**
 * Shuffles array in place using Fisher-Yates algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array]; // Create a copy to avoid mutating the original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Mock implementation of Pictory API functions for local development
export const mockPictoryApi = {
  getBrandingProfiles: (): Promise<{ brands: Array<{ id: string, name: string }> }> => {
    return Promise.resolve({
      brands: [
        { id: 'brand-1', name: 'Corporate Clean' },
        { id: 'brand-2', name: 'Energetic Sport' },
        { id: 'brand-3', name: 'Luxury Premium' },
        { id: 'brand-4', name: 'Tech Modern' },
        { id: 'brand-5', name: 'Fashion Forward' }
      ]
    });
  },
  
  getTextStyles: (): Promise<{ styles: Array<{ id: string, name: string }> }> => {
    return Promise.resolve({
      styles: [
        { id: 'style-1', name: 'Bold Impact' },
        { id: 'style-2', name: 'Elegant Script' },
        { id: 'style-3', name: 'Clean Minimal' },
        { id: 'style-4', name: 'Techy Sans' },
        { id: 'style-5', name: 'Playful Display' }
      ]
    });
  },
  
  getBrandingProfile: (id: string): Promise<{ brand: any }> => {
    const brands: Record<string, any> = {
      'brand-1': {
        id: 'brand-1',
        name: 'Corporate Clean',
        logoUrl: 'https://example.com/logos/corporate.png',
        primaryColor: '#0052CC',
        secondaryColor: '#FFFFFF',
        fontFamily: 'Arial',
        style: 'corporate'
      },
      'brand-2': {
        id: 'brand-2',
        name: 'Energetic Sport',
        logoUrl: 'https://example.com/logos/sport.png',
        primaryColor: '#FF4500',
        secondaryColor: '#333333',
        fontFamily: 'Montserrat',
        style: 'bold'
      }
      // Add more as needed
    };
    
    return Promise.resolve({ brand: brands[id] || brands['brand-1'] });
  },
  
  getTextStyle: (id: string): Promise<{ style: TextStyle }> => {
    const styles: Record<string, TextStyle> = {
      'style-1': {
        id: 'style-1',
        name: 'Bold Impact',
        fontFamily: 'Impact',
        fontSize: 36,
        fontWeight: 'bold',
        fontColor: '#FFFFFF',
        outlineColor: '#000000',
        outlineWidth: 1,
        animation: 'none',
        // Add required TextStyle properties
        color: '#FFFFFF',
        textAlign: 'center',
        padding: 12,
        borderRadius: 0,
        background: 'rgba(0,0,0,0.6)',
        margin: 0
      },
      'style-2': {
        id: 'style-2',
        name: 'Elegant Script',
        fontFamily: 'Playfair Display',
        fontSize: 28,
        fontWeight: 'normal',
        fontColor: '#FFFFFF',
        outlineColor: '#000000',
        outlineWidth: 1,
        animation: 'fade-in',
        // Add required TextStyle properties
        color: '#FFFFFF',
        textAlign: 'center',
        padding: 8,
        borderRadius: 4,
        background: 'transparent',
        margin: 4
      }
      // Add more as needed
    };
    
    return Promise.resolve({ style: styles[id] || styles['style-1'] });
  }
};

/**
 * Function to generate final processed clips array from raw clips
 * MODIFIED: Completely removes all transitions
 */
export const processClipsForFinalVideo = (clips: VideoClip[]): VideoClip[] => {
  // Sort clips by sequence number
  const sortedClips = [...clips].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  
  // Process each clip to ensure maximum quality
  return sortedClips.map(clip => {
    // Ensure text overlay has proper styling if it exists
    let updatedClip = { ...clip };
    
    // Add quality optimization hints
    updatedClip.optimizationHints = {
      decodePriority: 'high',
      cacheStrategy: 'keep-in-memory',
      memoryManagement: 'aggressive',
      renderPriority: 'critical',
      useHardwareAcceleration: true,
      reduceQualityDuringTransition: false,
      minimizeMemoryFootprint: false,
      captionRenderStrategy: 'hardware-accelerated',
      captionLayerQuality: 'ultra',
      captionZIndex: 1000
    };
    
    // Set maximum quality rendering settings
    updatedClip.renderSettings = {
      ...updatedClip.renderSettings,
      showCaptions: true,
      captionRenderMode: 'embedded',
      captionPriority: 'high',
      layerOrder: ['video', 'captions', 'effects']
    };
    
    // Force high quality processing
    updatedClip.renderPriority = "high";
    updatedClip.preloadBuffer = true;
    updatedClip.transitionBuffer = 1.0; // 1 second buffer for smooth transitions
    updatedClip.decodeInBackground = true;
    updatedClip.loadPriority = "critical";
    updatedClip.isBuffered = true;
    
    if (updatedClip.textOverlay) {
      // Create a copy of the text overlay to avoid modifying the original
      const updatedTextOverlay = { ...updatedClip.textOverlay };
      
      // Always use center position for best quality
      updatedTextOverlay.position = 'center';
      
      // Default text style with high quality settings
      const defaultTextStyle: TextStyle = {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        background: 'transparent',
        padding: 10,
        borderRadius: 4,
        margin: 0,
        animation: 'none', // Disable animations for better quality
        id: 'default-style',
        name: 'Default Style',
        fontFamily: 'Arial'
      };
      
      // Check if style exists and is an object before spreading
      if (updatedTextOverlay.style && typeof updatedTextOverlay.style === 'object') {
        updatedTextOverlay.style = {
          ...defaultTextStyle,
          ...updatedTextOverlay.style as object
        };
      } else {
        // Create default style if none exists or if it's not an object
        updatedTextOverlay.style = defaultTextStyle;
      }
      
      updatedClip.textOverlay = updatedTextOverlay;
    }
    
    return {
      ...updatedClip,
      loadPriority: "critical" as const,
      // Remove transitions for better quality
      transitionStyle: 'none',
      transitionDuration: 0,
      // Ensure consistent volume
      volume: clip.volume ?? 1.0,
      // Clean up start/end times to avoid precision issues
      startTime: clip.startTime ? Math.floor(clip.startTime * 10) / 10 : undefined,
      endTime: clip.endTime ? Math.floor(clip.endTime * 10) / 10 : undefined
    };
  });
};

/**
 * Process clips specifically for social media export
 * MODIFIED: Completely removes all transitions
 */
export const processClipsForSocialMedia = (clips: VideoClip[]): VideoClip[] => {
  // Sort clips by sequence number
  const sortedClips = [...clips].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  
  // Apply social media specific processing with NO TRANSITIONS
  const processedClips = sortedClips.map(clip => {
    // For social media, we want shorter clips without transitions
    let socialClip = { ...clip };
    
    // Update text overlay styling if present
    if (socialClip.textOverlay) {
      // Create a copy of the text overlay to avoid modifying the original
      const updatedTextOverlay = { ...socialClip.textOverlay };
      
      // Always use center position
      updatedTextOverlay.position = 'center';
      
      // Default text style with required properties
      const defaultTextStyle: TextStyle = {
        fontSize: 40, // Larger font size
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        background: 'transparent', // Transparent background
        padding: 10,
        borderRadius: 4, // Required property
        margin: 0, // Required property
        animation: 'caption-appear',
        id: 'default-style',
        name: 'Default Style',
        fontFamily: 'Arial'
      };
      
      // Check if style exists and is an object before spreading
      if (updatedTextOverlay.style && typeof updatedTextOverlay.style === 'object') {
        updatedTextOverlay.style = {
          ...defaultTextStyle,
          ...updatedTextOverlay.style as object
        };
      } else {
        // Create default style if none exists or if it's not an object
        updatedTextOverlay.style = defaultTextStyle;
      }
      
      socialClip.textOverlay = updatedTextOverlay;
    }
    
    return {
      ...socialClip,
      // Trim longer clips to maintain viewer attention
      duration: clip.duration && clip.duration > 5 ? 5 : clip.duration,
      // NO TRANSITIONS
      transitionStyle: 'none',
      transitionDuration: 0,
      // Clean up start/end times to avoid precision issues
      startTime: clip.startTime ? Math.floor(clip.startTime * 10) / 10 : undefined,
      endTime: clip.endTime ? Math.floor(clip.endTime * 10) / 10 : undefined,
      // Consistent volume
      volume: 1.0,
    };
  });
  
  // Set highest priority loading
  return processedClips.map(clip => {
    return {
      ...clip,
      loadPriority: "critical" as const,
    };
  });
};

/**
 * Process clips for advertisement with captions but NO TRANSITIONS
 * MODIFIED: Completely removes all transitions
 */
export const processClipsForAdvertisement = (
  clips: VideoClip[],
  segmentDuration: number = 3,
  transitionStyle: string = 'none', // FORCED to 'none'
  captions?: Record<number, string>,
  captionPositions?: Record<number, TextOverlay['position']>
): VideoClip[] => {
  try {
    console.log(`Processing ${clips.length} clips for advertisement with segment duration: ${segmentDuration}`);
    
    // Ensure input validation
    if (!clips || clips.length === 0) {
      console.warn("No clips provided to processClipsForAdvertisement");
      return [];
    }
    
    // Makes sure all clips have required properties
    const validClips = clips.filter(clip => clip && clip.url && typeof clip.id === 'number');
    
    if (validClips.length === 0) {
      console.warn("No valid clips found after filtering");
      return [];
    }
    
    // Sort clips by sequence number
    const sortedClips = [...validClips].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    
    // Process each clip with NO TRANSITIONS
    const processedClips = sortedClips.map((clip, index) => {
      // Copy the clip to avoid modifying the original
      let trimmedClip = { ...clip };
      
      // Ensure clip has a duration
      if (typeof trimmedClip.duration !== 'number' || isNaN(trimmedClip.duration)) {
        console.warn(`Clip ${clip.id} has invalid duration: ${clip.duration}, using default`);
        trimmedClip.duration = 3; // Default duration
      }
      
      // Trim longer clips to specified segment duration
      if (trimmedClip.duration > segmentDuration) {
        // Use clean integer values to avoid precision issues
        const bestStartTime = trimmedClip.duration > segmentDuration + 2 
          ? Math.floor((trimmedClip.duration - segmentDuration) * 0.3) 
          : 0;
        
        trimmedClip = {
          ...trimmedClip,
          startTime: bestStartTime,
          endTime: bestStartTime + segmentDuration,
          duration: segmentDuration
        };
      }
      
      // Add text overlay if captions are provided
      if (captions && captions[clip.id]) {
        const captionText = captions[clip.id];
        
        // Default text style with NO ANIMATIONS
        const defaultTextStyle: TextStyle = {
          id: 'default-ad-style',
          name: 'Default Ad Style',
          fontFamily: 'Arial',
          fontSize: 36, // Larger font size for visibility
          fontWeight: 'bold',
          fontColor: '#FFFFFF',
          backgroundColor: 'transparent', // Transparent background
          animation: 'none', // NO ANIMATION
          // Add required TextStyle properties
          color: '#FFFFFF',
          textAlign: 'center',
          padding: 10,
          borderRadius: 4,
          background: 'transparent', // Remove background
          margin: 0
        };
        
        // Create text overlay with NO ANIMATIONS and TypeScript-safe position
        const position: TextOverlay['position'] = captionPositions?.[clip.id] || 'center';
        
        const textOverlay: TextOverlay = {
          text: captionText,
          position: position,
          style: defaultTextStyle,
          animation: "none", // NO ANIMATION
          startTime: 0.2, // Small delay to ensure reliable start
          endTime: trimmedClip.duration ? trimmedClip.duration - 0.2 : undefined // End slightly early
        };
        
        trimmedClip.textOverlay = textOverlay;
      }
      
      // Force NO TRANSITIONS
      return {
        ...trimmedClip,
        transitionStyle: 'none', // NO TRANSITION
        transitionDuration: 0     // ZERO DURATION
      };
    });
    
    // Ensure sequence numbers are updated
    return processedClips.map((clip, index) => ({
      ...clip,
      sequence: index
    }));
  } catch (error) {
    console.error("Error in processClipsForAdvertisement:", error);
    // Return empty array to prevent further issues
    return [];
  }
};

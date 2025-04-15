
import { VideoClip, ClipSegment } from "@/types/video";

// Configuration for analysis parameters
interface AnalysisConfig {
  minSegmentDuration: number;
  maxSegmentDuration: number;
  transitionDuration: number;
  preferenceWeights: {
    motion: number;
    brightness: number;
    contrast: number;
    facePriority: number;
    objectPriority: number;
    productFocus: number;
    actionIntensity: number;
  };
}

// Optimized configuration for professional advertisement clips (3-4 seconds)
const defaultConfig: AnalysisConfig = {
  minSegmentDuration: 3.0,
  maxSegmentDuration: 4.0,
  transitionDuration: 0.5,
  preferenceWeights: {
    motion: 0.25,
    brightness: 0.15,
    contrast: 0.15,
    facePriority: 0.10,
    objectPriority: 0.10,
    productFocus: 0.15,
    actionIntensity: 0.10
  }
};

// Enhanced AI analysis that leverages weighted factors to score video segments
export const analyzeVideoContent = async (
  videoEl: HTMLVideoElement,
  clip: VideoClip,
  segmentCount: number = 1,
  config: Partial<AnalysisConfig> = {}
): Promise<ClipSegment[]> => {
  const mergedConfig = { ...defaultConfig, ...config };
  return new Promise((resolve) => {
    const segments: ClipSegment[] = [];
    const duration = clip.duration;
    
    // For very short clips, just use the entire clip
    if (duration <= mergedConfig.minSegmentDuration * 1.5) {
      resolve([{
        id: `segment-${clip.id}-0`,
        originalClipId: clip.id,
        startTime: 0,
        endTime: duration,
        quality: 1
      }]);
      return;
    }

    // Set target segment duration based on clip length and segment count
    // For advertisements, we want 3-4 second segments to highlight the best moments
    const targetSegmentDuration = Math.min(
      mergedConfig.maxSegmentDuration,
      Math.max(mergedConfig.minSegmentDuration, 
        duration > 15 ? 3.5 : Math.min(4.0, duration / (segmentCount + 1)))
    );
    
    // Calculate how many sample points we need - more samples for longer videos
    const sampleCount = Math.max(30, Math.ceil(duration * 4)); // Increased sample density
    let samplesAnalyzed = 0;
    
    // Track the highest quality segments we've found
    const highQualitySegments: { startTime: number; endTime: number; quality: number }[] = [];
    
    // Analysis progress tracking
    let lastProgressTime = 0;
    
    const analyzeFrameAt = (time: number) => {
      videoEl.currentTime = time;
      
      videoEl.onseeked = () => {
        // Enhanced frame analysis with weighted metrics optimized for advertisements
        const frameScore = simulateEnhancedFrameAnalysisForAds(videoEl, time, duration, mergedConfig);
        
        // If this is a high-quality frame, consider it as the center of a segment
        // Increase quality threshold for advertisements to be more selective
        const qualityThreshold = duration > 15 ? 0.70 : 0.65;
        
        if (frameScore > qualityThreshold) {
          const halfSegmentDuration = targetSegmentDuration / 2;
          const startTime = Math.max(0, time - halfSegmentDuration);
          const endTime = Math.min(duration, time + halfSegmentDuration);
          
          // Check if this segment overlaps significantly with any existing high-quality segment
          const significantOverlap = highQualitySegments.some(existing => {
            // Calculate overlap percentage
            const overlapStart = Math.max(startTime, existing.startTime);
            const overlapEnd = Math.min(endTime, existing.endTime);
            
            if (overlapStart < overlapEnd) {
              const overlapDuration = overlapEnd - overlapStart;
              const segmentDuration = endTime - startTime;
              const overlapPercentage = overlapDuration / segmentDuration;
              
              // If overlap is more than 35%, consider it significant (slightly reduced from previous)
              return overlapPercentage > 0.35;
            }
            return false;
          });
          
          // Only add if it doesn't overlap significantly with existing segments
          if (!significantOverlap || highQualitySegments.length < segmentCount) {
            // Add to high-quality segments with the score
            highQualitySegments.push({
              startTime,
              endTime,
              quality: frameScore
            });
          }
        }
        
        samplesAnalyzed++;
        
        // Log progress at intervals for longer videos
        const progressPercentage = Math.floor((samplesAnalyzed / sampleCount) * 100);
        const progressTime = Math.floor(progressPercentage / 10);
        if (progressTime > lastProgressTime && duration > 10) {
          console.log(`Advanced AI Analysis progress: ${progressPercentage}%`);
          lastProgressTime = progressTime;
        }
        
        if (samplesAnalyzed < sampleCount) {
          // Analyze the next sample point
          analyzeFrameAt((samplesAnalyzed / sampleCount) * duration);
        } else {
          // We've analyzed all sample points, find the best segments
          
          // Sort by quality
          highQualitySegments.sort((a, b) => b.quality - a.quality);
          
          // Filter overlapping segments - prefer higher quality
          const filteredSegments: typeof highQualitySegments = [];
          
          for (const segment of highQualitySegments) {
            // Check if this segment overlaps with any we've already selected
            const overlapping = filteredSegments.some(existingSegment => {
              return (
                (segment.startTime >= existingSegment.startTime && segment.startTime <= existingSegment.endTime) ||
                (segment.endTime >= existingSegment.startTime && segment.endTime <= existingSegment.endTime) ||
                (segment.startTime <= existingSegment.startTime && segment.endTime >= existingSegment.endTime)
              );
            });
            
            if (!overlapping) {
              filteredSegments.push(segment);
              if (filteredSegments.length >= segmentCount) break;
            }
          }
          
          // If we don't have enough segments, add more strategically
          if (filteredSegments.length < segmentCount) {
            // For longer videos, try to find diverse segments across the timeline
            if (duration > 10) {
              // Divide video into regions and try to find a segment in each region
              const regionCount = segmentCount - filteredSegments.length;
              const regionDuration = duration / (regionCount + 1);
              
              for (let i = 1; filteredSegments.length < segmentCount && i <= regionCount; i++) {
                const centerTime = i * regionDuration;
                
                // Find the highest quality segment in this region
                let bestSegmentInRegion = null;
                let bestQualityInRegion = 0;
                
                for (const segment of highQualitySegments) {
                  const segmentCenter = (segment.startTime + segment.endTime) / 2;
                  const distanceFromCenter = Math.abs(segmentCenter - centerTime);
                  
                  // Only consider segments close to this region's center
                  if (distanceFromCenter < regionDuration / 2) {
                    // Check if this overlaps with already filtered segments
                    const overlapping = filteredSegments.some(existingSegment => {
                      return (
                        (segment.startTime >= existingSegment.startTime && segment.startTime <= existingSegment.endTime) ||
                        (segment.endTime >= existingSegment.startTime && segment.endTime <= existingSegment.endTime) ||
                        (segment.startTime <= existingSegment.startTime && segment.endTime >= existingSegment.endTime)
                      );
                    });
                    
                    if (!overlapping && segment.quality > bestQualityInRegion) {
                      bestSegmentInRegion = segment;
                      bestQualityInRegion = segment.quality;
                    }
                  }
                }
                
                if (bestSegmentInRegion) {
                  filteredSegments.push(bestSegmentInRegion);
                } else {
                  // If no good segment found in this region, create one
                  const startTime = Math.max(0, centerTime - (targetSegmentDuration / 2));
                  const endTime = Math.min(duration, centerTime + (targetSegmentDuration / 2));
                  
                  filteredSegments.push({
                    startTime,
                    endTime,
                    quality: 0.5 // Default quality for added segments
                  });
                }
              }
            } else {
              // For shorter videos, just add segments at regular intervals
              const segmentInterval = duration / (segmentCount + 1);
              
              for (let i = 1; filteredSegments.length < segmentCount && i <= segmentCount; i++) {
                const time = i * segmentInterval;
                const startTime = Math.max(0, time - (targetSegmentDuration / 2));
                const endTime = Math.min(duration, time + (targetSegmentDuration / 2));
                
                // Check if this overlaps with existing segments
                const overlapping = filteredSegments.some(existingSegment => {
                  return (
                    (startTime >= existingSegment.startTime && startTime <= existingSegment.endTime) ||
                    (endTime >= existingSegment.startTime && endTime <= existingSegment.endTime) ||
                    (startTime <= existingSegment.startTime && endTime >= existingSegment.endTime)
                  );
                });
                
                if (!overlapping) {
                  filteredSegments.push({
                    startTime,
                    endTime,
                    quality: 0.5 // Default quality for added segments
                  });
                }
              }
            }
          }
          
          // Ensure segments don't exceed video duration
          const validatedSegments = filteredSegments.map(segment => ({
            ...segment,
            startTime: Math.max(0, segment.startTime),
            endTime: Math.min(duration, segment.endTime),
          }));
          
          // Sort by start time for a more natural sequence
          validatedSegments.sort((a, b) => a.startTime - b.startTime);
          
          // Map to the ClipSegment format
          const result = validatedSegments.map((segment, index) => ({
            id: `segment-${clip.id}-${index}`,
            originalClipId: clip.id,
            startTime: segment.startTime,
            endTime: segment.endTime,
            quality: segment.quality
          }));
          
          console.log(`Advanced ad-focused analysis complete: Found ${result.length} optimal segments for clip of ${duration}s`);
          resolve(result);
        }
      };
    };
    
    // Start analysis from the beginning
    analyzeFrameAt(0);
  });
};

// Enhanced frame analysis algorithm optimized for advertisements
const simulateEnhancedFrameAnalysisForAds = (
  videoEl: HTMLVideoElement, 
  currentTime: number,
  totalDuration: number,
  config: AnalysisConfig
): number => {
  // Extract image data from video frame (simulated in this implementation)
  
  // Motion simulation for advertisements - enhanced to prefer dynamic, action-focused segments
  // Higher scores for motion-rich sections, product reveals, and well-composed shots
  let positionFactor;
  if (totalDuration <= 10) {
    // For shorter clips, prefer well-spaced key moments
    // Typically in ads: intro (0-15%), product reveal (40-60%), and call to action (85-100%)
    const relativePosition = currentTime / totalDuration;
    if (relativePosition < 0.15) {
      // Intro sequence - moderately high
      positionFactor = 0.85;
    } else if (relativePosition > 0.4 && relativePosition < 0.6) {
      // Product reveal - highest priority
      positionFactor = 0.95;
    } else if (relativePosition > 0.85) {
      // Call to action - high priority
      positionFactor = 0.9;
    } else {
      // Other sections - baseline priority
      positionFactor = 0.75;
    }
  } else {
    // For longer clips, distribute focus better with emphasis on product reveal moments
    const relativePosition = currentTime / totalDuration;
    // Multi-point scoring for longer ads with multiple key moments
    positionFactor = 0.7 + 
      0.25 * Math.pow(Math.sin(relativePosition * Math.PI * 3), 2) + // Creates peaks at 1/6, 1/2, and 5/6 positions
      0.05 * Math.random(); // Small randomness
  }
  
  // Simulate brightness analysis (higher in product-focused shots)
  const brightnessFactor = 0.5 + 0.5 * (1 - Math.abs((currentTime / totalDuration) - 0.5) * 1.5);
  
  // Simulate contrast analysis (higher for visually striking moments)
  const contrastFactor = 0.4 + 0.6 * Math.pow(Math.random(), 1.5);
  
  // Simulate face detection (important for testimonials and human elements in ads)
  const faceDetectionProbability = Math.random() < 0.25 ? 
    0.9 * Math.pow(Math.sin((currentTime / totalDuration) * Math.PI), 2) : 
    0.2 * Math.random();
  
  // Simulate product detection - enhanced to detect product-focused segments
  // Products are often shown clearly at key moments
  const productFocusProbability = Math.random() < 0.3 ?
    0.9 * (0.7 + 0.3 * Math.sin((currentTime / totalDuration) * Math.PI * 2)) :
    0.3 + 0.3 * Math.random();
  
  // Simulate action intensity - higher during dynamic moments
  const actionIntensityFactor = 0.3 + 0.7 * Math.pow(Math.sin((currentTime / totalDuration) * Math.PI * 4), 2);
  
  // Combine all factors with their weights
  const { motion, brightness, contrast, facePriority, objectPriority, productFocus, actionIntensity } = config.preferenceWeights;
  
  const weightedScore = 
    (positionFactor * motion) +
    (brightnessFactor * brightness) +
    (contrastFactor * contrast) +
    (faceDetectionProbability * facePriority) +
    (productFocusProbability * objectPriority) +
    (productFocusProbability * productFocus) +
    (actionIntensityFactor * actionIntensity);
  
  // Add a small amount of controlled randomness to avoid too similar segments
  const randomFactor = Math.random() * 0.08;
  
  // Normalize the score between 0 and 1
  const normalizedScore = Math.min(1, Math.max(0, weightedScore + randomFactor));
  
  return normalizedScore;
};

// AI segment selection optimized specifically for advertisements
export const simulateAIAnalysis = (
  clip: VideoClip, 
  count: number, 
  preferMotion: boolean = true
): ClipSegment[] => {
  const segments: ClipSegment[] = [];
  const duration = clip.duration;
  
  // For very short clips, just return the whole clip
  if (duration <= 3) {
    return [{
      id: `segment-${clip.id}-full`,
      originalClipId: clip.id,
      startTime: 0,
      endTime: duration,
      quality: 1
    }];
  }
  
  // Calculate ideal segment duration - prioritize 3-4 second segments
  // This is perfect for advertisement content
  let segmentDuration;
  if (duration <= 8) {
    segmentDuration = Math.min(3.5, Math.max(3, duration / (count * 1.2)));
  } else if (duration <= 20) {
    segmentDuration = 3.5; // Perfect advertisement segment length
  } else {
    segmentDuration = Math.min(4, Math.max(3, duration / (count * 1.8)));
  }
  
  // For advertisements, we want to focus on:
  // 1. Strong opener (first 15%)
  // 2. Product details (middle 40-60%)
  // 3. Call to action (final 15%)
  if (preferMotion) {
    // For motion-focused clips, prefer segments with high movement & product focus
    const patternMap = [
      // Beginning focus (ad intro)
      { position: 0.1, variance: 0.05 },
      // Product reveal focus (main highlight)
      { position: 0.5, variance: 0.1 },
      // End focus (call to action)
      { position: 0.9, variance: 0.05 }
    ];
    
    // Select positions based on count requested
    const positions = count <= 3 ? 
      patternMap.slice(0, count) : 
      [...Array(count)].map((_, i) => {
        return { 
          position: (i / (count - 1)), 
          variance: 0.08 
        };
      });
    
    positions.forEach((pattern, i) => {
      const availableSpace = duration - segmentDuration;
      
      // Position with controlled randomness
      const basePosition = pattern.position * availableSpace;
      const randomOffset = (Math.random() * 2 - 1) * pattern.variance * availableSpace;
      const startTime = Math.max(0, Math.min(availableSpace, basePosition + randomOffset));
      
      segments.push({
        id: `segment-${clip.id}-motion-${i}`,
        originalClipId: clip.id,
        startTime,
        endTime: Math.min(duration, startTime + segmentDuration),
        quality: 0.75 + Math.random() * 0.25 // Higher quality for selected segments
      });
    });
  } else {
    // For aesthetics-focused clips, emphasize product shots and good framing
    for (let i = 0; i < count; i++) {
      // Distribution emphasizing product reveal and call-to-action
      let positionFactor;
      if (i === 0 && count > 1) {
        // First segment: introduction (first 20%)
        positionFactor = 0.1 + (Math.random() * 0.1);
      } else if (i === count - 1 && count > 1) {
        // Last segment: call to action (last 20%)
        positionFactor = 0.8 + (Math.random() * 0.15);
      } else if (i === Math.floor(count / 2) && count > 2) {
        // Middle segment: product highlight (40-60%)
        positionFactor = 0.4 + (Math.random() * 0.2);
      } else {
        // Others evenly distributed
        positionFactor = (i + 0.5) / count;
      }
      
      const position = positionFactor * (duration - segmentDuration);
      const jitter = (Math.random() - 0.5) * (duration / (count * 5));
      const startTime = Math.max(0, Math.min(duration - segmentDuration, position + jitter));
      
      segments.push({
        id: `segment-${clip.id}-aesthetic-${i}`,
        originalClipId: clip.id,
        startTime,
        endTime: startTime + segmentDuration,
        quality: 0.8 + Math.random() * 0.2 // High quality for aesthetics-focused segments
      });
    }
  }
  
  // Ensure we have the requested number of segments, even for edge cases
  while (segments.length < count) {
    const position = Math.random() * (duration - segmentDuration);
    segments.push({
      id: `segment-${clip.id}-filler-${segments.length}`,
      originalClipId: clip.id,
      startTime: position,
      endTime: position + segmentDuration,
      quality: 0.7 + Math.random() * 0.15
    });
  }
  
  return segments.sort((a, b) => a.startTime - b.startTime);
};

// Generate intelligent sequences based on advertisement best practices
export const generateOptimalSequence = (
  segments: ClipSegment[], 
  pattern: string = 'advertisement'
): ClipSegment[] => {
  if (segments.length <= 1) return segments;
  
  const sortedByTime = [...segments].sort((a, b) => a.startTime - b.startTime);
  const sortedByQuality = [...segments].sort((a, b) => (b.quality || 0) - (a.quality || 0));
  
  switch (pattern) {
    case 'forward':
      return sortedByTime;
    
    case 'reverse':
      return [...sortedByTime].reverse();
    
    case 'quality':
      return sortedByQuality;
    
    case 'alternating':
      const alternating: ClipSegment[] = [];
      const firstHalf = sortedByTime.slice(0, Math.ceil(sortedByTime.length / 2));
      const secondHalf = sortedByTime.slice(Math.ceil(sortedByTime.length / 2));
      
      for (let i = 0; i < Math.max(firstHalf.length, secondHalf.length); i++) {
        if (i < firstHalf.length) alternating.push(firstHalf[i]);
        if (i < secondHalf.length) alternating.push(secondHalf[i]);
      }
      return alternating;
    
    case 'random':
      return [...sortedByTime].sort(() => Math.random() - 0.5);
    
    case 'advertisement':
    default:
      // Advertisement mode creates a sequence optimized for commercial flow:
      // 1. Start with highest quality segment (hook/intro)
      // 2. Follow with product details in ascending engagement
      // 3. Build to a climax with second highest quality
      // 4. End with third highest quality (call to action)
      const result: ClipSegment[] = [];
      
      if (segments.length <= 2) {
        return sortedByQuality;
      } else if (segments.length === 3) {
        // For 3 segments, use classic ad structure: hook, details, call-to-action
        return [
          sortedByQuality[0],  // Best for hook
          sortedByQuality[2],  // Least impressive for middle details
          sortedByQuality[1]   // Second best for call-to-action
        ];
      } else {
        // For 4+ segments, create a full ad structure with rising action
        const hook = sortedByQuality[0];
        const callToAction = sortedByQuality[1];
        const climax = sortedByQuality[2];
        
        // Start with the hook
        result.push(hook);
        
        // Add middle segments (product details) in ascending engagement
        const middleSegments = sortedByQuality.slice(3);
        middleSegments.sort((a, b) => (a.quality || 0) - (b.quality || 0)); // Ascending quality
        result.push(...middleSegments);
        
        // Add climax (second best segment)
        result.push(climax);
        
        // End with call to action (third best segment)
        result.push(callToAction);
        
        return result;
      }
  }
};


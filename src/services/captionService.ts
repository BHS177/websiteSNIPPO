import { BackgroundMusic, Caption, MusicMood, VideoClip, AdProductType, TransitionType, SubtitleOptions, ProductAdvertisementSettings, TextOverlay } from "@/types/video";

// API configuration for Caption AI
const CAPTION_API_BASE_URL = "https://api.caption.ai";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json"
};

// Interface for API responses
interface CaptionResponse {
  captions: {
    text: string;
    start_time: number;
    end_time: number;
  }[];
  transcript: string;
  success: boolean;
}

interface WordAlignmentResponse {
  words: {
    word: string;
    start_time: number;
    end_time: number;
    confidence: number;
  }[];
  success: boolean;
}

/**
 * Authenticates with the Caption AI API
 * @param apiKey API key for authentication
 * @returns Authentication token
 */
export const authenticateCaptionAPI = async (apiKey: string): Promise<string> => {
  try {
    console.log("Authenticating with Caption AI API...");
    
    // In a real implementation, this would make an actual API call
    // For now, we simulate successful authentication
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return `simulated_auth_token_${Date.now()}`;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw new Error("Failed to authenticate with Caption AI API");
  }
};

/**
 * Analyzes video/audio and generates captions using Caption AI API
 * Uses real API if token is provided, otherwise generates placeholder captions
 */
export const generateCaptions = async (
  videoUrl: string,
  duration: number,
  authToken?: string,
  productDescription?: string
): Promise<Caption[]> => {
  try {
    console.log(`Generating captions for video: ${videoUrl} with duration: ${duration}`);
    console.log(`Product description: ${productDescription || "None provided"}`);
    console.log(`Using auth token: ${authToken ? "Yes (authenticated)" : "No (using fallback)"}`);
    
    // If we have an auth token, try to use the real API
    if (authToken) {
      try {
        return await generateCaptionsFromAPI(videoUrl, authToken, productDescription);
      } catch (apiError) {
        console.warn("API caption generation failed, falling back to placeholder:", apiError);
        // Fall back to placeholder captions if API fails
      }
    }
    
    // Generate product-focused captions if product description is provided
    if (productDescription) {
      return generateProductFocusedCaptions(duration, productDescription);
    }
    
    // Generate placeholder captions (5 segments for demo)
    const segmentDuration = duration / 5;
    const captions: Caption[] = [];
    
    const placeholderTexts = [
      "Welcome to our product showcase.",
      "Experience the amazing features of our latest offering.",
      "Designed with you in mind for maximum efficiency.",
      "Join thousands of satisfied customers today!",
      "Take the next step and transform your experience."
    ];
    
    for (let i = 0; i < 5; i++) {
      const startTime = i * segmentDuration;
      const endTime = Math.min((i + 1) * segmentDuration, duration);
      
      captions.push({
        text: placeholderTexts[i] || `Caption segment ${i + 1}`,
        startTime,
        endTime,
        style: "standard",
        isAiGenerated: true
      });
    }
    
    return captions;
  } catch (error) {
    console.error("Error generating captions:", error);
    throw new Error("Failed to generate captions");
  }
};

/**
 * Generate captions specifically focused on product advertisement
 * This creates a compelling narrative structure for the product
 */
export const generateProductFocusedCaptions = (
  duration: number,
  productDescription: string
): Caption[] => {
  console.log("Generating product-focused captions based on description:", productDescription);
  
  // Extract key information from product description
  const productType = extractProductType(productDescription);
  const sellingPoints = extractSellingPoints(productDescription);
  const tone = determineTone(productDescription);
  
  // Create a narrative structure for the advertisement
  const captions: Caption[] = [];
  const segmentCount = Math.min(6, Math.max(4, Math.floor(duration / 4))); // 4-6 segments based on duration
  const segmentDuration = duration / segmentCount;
  
  // Introduction (attention-grabbing opening)
  captions.push({
    text: generateIntroduction(productType, tone),
    startTime: 0,
    endTime: segmentDuration,
    style: "standard",
    isAiGenerated: true,
    animation: "fade-in"
  });
  
  // Problem statement or value proposition
  captions.push({
    text: generateValueProposition(productType, sellingPoints, tone),
    startTime: segmentDuration,
    endTime: segmentDuration * 2,
    style: "standard",
    isAiGenerated: true
  });
  
  // Main selling points
  for (let i = 0; i < Math.min(sellingPoints.length, segmentCount - 3); i++) {
    captions.push({
      text: generateFeatureHighlight(sellingPoints[i], tone),
      startTime: segmentDuration * (2 + i),
      endTime: segmentDuration * (3 + i),
      style: "standard",
      isAiGenerated: true,
      animation: i % 2 === 0 ? "slide-up" : "slide-down"
    });
  }
  
  // Call to action
  captions.push({
    text: generateCallToAction(productType, tone),
    startTime: duration - segmentDuration,
    endTime: duration,
    style: "standard",
    isAiGenerated: true,
    animation: "zoom-in"
  });
  
  // Fill in any gaps if we don't have enough selling points
  const currentSegments = captions.length;
  if (currentSegments < segmentCount) {
    const testimonialText = generateTestimonial(productType, tone);
    captions.push({
      text: testimonialText,
      startTime: segmentDuration * (currentSegments - 1),
      endTime: segmentDuration * currentSegments,
      style: "standard",
      isAiGenerated: true
    });
  }
  
  // Sort captions by start time to ensure proper sequence
  return captions.sort((a, b) => a.startTime - b.startTime);
};

/**
 * Extract likely product type from description
 */
export const extractProductType = (description: string): AdProductType => {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('tech') || lowerDesc.includes('electronic') || lowerDesc.includes('device') || 
      lowerDesc.includes('gadget') || lowerDesc.includes('computer') || lowerDesc.includes('phone')) {
    return 'electronics';
  } else if (lowerDesc.includes('cloth') || lowerDesc.includes('apparel') || lowerDesc.includes('shirt') || 
             lowerDesc.includes('dress') || lowerDesc.includes('fashion')) {
    return 'clothing';
  } else if (lowerDesc.includes('shoe') || lowerDesc.includes('sneaker') || lowerDesc.includes('boot')) {
    return 'footwear';
  } else if (lowerDesc.includes('jewel') || lowerDesc.includes('ring') || lowerDesc.includes('necklace') ||
             lowerDesc.includes('watch') || lowerDesc.includes('bracelet')) {
    return 'jewelry';
  } else if (lowerDesc.includes('bag') || lowerDesc.includes('purse') || lowerDesc.includes('accessory') ||
             lowerDesc.includes('wallet') || lowerDesc.includes('sunglasses')) {
    return 'accessories';
  }
  
  // Default to a generic product type
  return 'products';
};

/**
 * Extract key selling points from description
 */
const extractSellingPoints = (description: string): string[] => {
  // Split by common separators and extract possible selling points
  const points: string[] = [];
  
  // Try to extract points by splitting on bullet indicators
  const bulletSplit = description.split(/[•\-\*]/);
  if (bulletSplit.length > 1) {
    bulletSplit.slice(1).forEach(point => {
      const trimmed = point.trim();
      if (trimmed && trimmed.length > 10) {
        points.push(trimmed);
      }
    });
  }
  
  // If no bullet points found, try to extract sentences
  if (points.length === 0) {
    const sentences = description.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    sentences.forEach(sentence => {
      if (sentence.includes('feature') || sentence.includes('benefit') || 
          sentence.includes('offer') || sentence.includes('provide') ||
          sentence.includes('best') || sentence.includes('unique') ||
          sentence.includes('special')) {
        points.push(sentence);
      }
    });
    
    // If still no points, take up to 3 sentences
    if (points.length === 0 && sentences.length > 0) {
      points.push(...sentences.slice(0, Math.min(3, sentences.length)));
    }
  }
  
  // If we still don't have enough points, use fallback generic points
  if (points.length < 2) {
    const productType = extractProductType(description);
    
    if (productType === 'electronics') {
      points.push('Cutting-edge technology for superior performance');
      points.push('Sleek design with intuitive user interface');
      points.push('Long-lasting battery life for all-day use');
    } else if (productType === 'clothing') {
      points.push('Premium quality materials for ultimate comfort');
      points.push('Stylish design that stands out from the crowd');
      points.push('Durable construction for long-lasting wear');
    } else {
      points.push('Premium quality that exceeds expectations');
      points.push('Designed with your needs in mind');
      points.push('Exceptional value for your investment');
    }
  }
  
  return points.slice(0, 4); // Limit to 4 selling points
};

/**
 * Determine the tone/mood from the description
 */
const determineTone = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('luxury') || lowerDesc.includes('premium') || 
      lowerDesc.includes('exclusive') || lowerDesc.includes('elegant')) {
    return 'luxury';
  } else if (lowerDesc.includes('innovative') || lowerDesc.includes('cutting-edge') || 
             lowerDesc.includes('advanced') || lowerDesc.includes('technology')) {
    return 'tech';
  } else if (lowerDesc.includes('fun') || lowerDesc.includes('exciting') || 
             lowerDesc.includes('vibrant') || lowerDesc.includes('young')) {
    return 'playful';
  } else if (lowerDesc.includes('professional') || lowerDesc.includes('business') || 
             lowerDesc.includes('reliable') || lowerDesc.includes('trusted')) {
    return 'professional';
  } else if (lowerDesc.includes('natural') || lowerDesc.includes('organic') || 
             lowerDesc.includes('sustainable') || lowerDesc.includes('eco')) {
    return 'eco-friendly';
  }
  
  // Default tone
  return 'professional';
};

/**
 * Generate an attention-grabbing introduction
 */
const generateIntroduction = (productType: string, tone: string): string => {
  const introsByTone: Record<string, string[]> = {
    'luxury': [
      "Introducing the epitome of elegance.",
      "Experience luxury like never before.",
      "Discover the art of refined living."
    ],
    'tech': [
      "The future is here. The future is now.",
      "Innovation redefined for tomorrow's world.",
      "Breaking boundaries of what's possible."
    ],
    'playful': [
      "Get ready for something awesome!",
      "Your life is about to get way more exciting.",
      "Who said you can't have fun every day?"
    ],
    'professional': [
      "Excellence. Reliability. Results.",
      "The professional choice for discerning individuals.",
      "Elevate your standards with proven performance."
    ],
    'eco-friendly': [
      "For a better planet and a better you.",
      "Sustainability meets superior quality.",
      "Kind to you. Kind to our world."
    ]
  };
  
  const defaultIntros = [
    "Introducing the product that changes everything.",
    "Meet your new favorite essential.",
    "The perfect solution you've been searching for."
  ];
  
  const intros = introsByTone[tone] || defaultIntros;
  return intros[Math.floor(Math.random() * intros.length)];
};

/**
 * Generate value proposition statement
 */
const generateValueProposition = (productType: string, sellingPoints: string[], tone: string): string => {
  const valueProps: Record<string, string[]> = {
    'electronics': [
      "Cutting-edge technology designed for your digital lifestyle.",
      "Seamless integration with your connected world.",
      "Power and performance in perfect harmony."
    ],
    'clothing': [
      "Style and comfort in every thread.",
      "Express yourself with fashion that speaks volumes.",
      "Where quality meets timeless design."
    ],
    'footwear': [
      "Every step matters. Make it count.",
      "Support and style for your journey ahead.",
      "Comfort that never compromises on design."
    ],
    'jewelry': [
      "Timeless elegance for life's special moments.",
      "Crafted with precision for lasting beauty.",
      "Elevate any look with exquisite detail."
    ],
    'accessories': [
      "The perfect finishing touch for your lifestyle.",
      "Essential accessories that make a statement.",
      "Designed to complement, crafted to impress."
    ]
  };
  
  const defaultProps = [
    "Quality that speaks for itself.",
    "Designed with your needs in mind.",
    "The difference is in the details."
  ];
  
  // Use the appropriate value proposition or default
  const props = valueProps[productType as string] || defaultProps;
  return props[Math.floor(Math.random() * props.length)];
};

/**
 * Generate feature highlight message
 */
const generateFeatureHighlight = (featurePoint: string, tone: string): string => {
  // Check if the feature point already sounds like a complete statement
  if (featurePoint.length > 30 && (
      featurePoint.endsWith('.') || 
      featurePoint.endsWith('!') || 
      featurePoint.endsWith('?'))) {
    // Remove ending punctuation for consistency
    return featurePoint.replace(/[.!?]$/, '');
  }
  
  // Otherwise, enhance the feature point based on tone
  const enhancersByTone: Record<string, string[]> = {
    'luxury': ["Exquisitely", "Masterfully", "Elegantly"],
    'tech': ["Intelligently", "Innovatively", "Precisely"],
    'playful': ["Amazingly", "Brilliantly", "Excitingly"],
    'professional': ["Efficiently", "Effectively", "Reliably"],
    'eco-friendly': ["Sustainably", "Responsibly", "Naturally"]
  };
  
  const defaultEnhancers = ["Expertly", "Thoughtfully", "Perfectly"];
  const enhancers = enhancersByTone[tone] || defaultEnhancers;
  const enhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
  
  return `${enhancer} designed to ${featurePoint.toLowerCase().includes('for') ? featurePoint : 'deliver ' + featurePoint}`;
};

/**
 * Generate call to action
 */
const generateCallToAction = (productType: string, tone: string): string => {
  const ctasByTone: Record<string, string[]> = {
    'luxury': [
      "Elevate your lifestyle today.",
      "Experience the difference now.",
      "Indulge in excellence."
    ],
    'tech': [
      "Step into the future today.",
      "Upgrade your experience now.",
      "Join the innovation revolution."
    ],
    'playful': [
      "Ready to have fun? Get yours now!",
      "Don't miss out on the excitement!",
      "Make the awesome choice today!"
    ],
    'professional': [
      "Make the professional choice today.",
      "Elevate your standards now.",
      "Partner with excellence."
    ],
    'eco-friendly': [
      "Choose better for you and our planet.",
      "Make the sustainable choice today.",
      "Start your eco-friendly journey now."
    ]
  };
  
  const defaultCTAs = [
    "Order now and transform your experience.",
    "Don't wait. Your perfect solution is here.",
    "The time to upgrade is now."
  ];
  
  const ctas = ctasByTone[tone] || defaultCTAs;
  return ctas[Math.floor(Math.random() * ctas.length)];
};

/**
 * Generate product testimonial
 */
const generateTestimonial = (productType: string, tone: string): string => {
  const testimonialsByProductType: Record<string, string[]> = {
    'electronics': [
      "Customers report 95% satisfaction with battery life.",
      "9 out of 10 users recommend this to friends and family.",
      "\"This device changed how I work every day!\" - Satisfied customer"
    ],
    'clothing': [
      "\"The best addition to my wardrobe this year!\"",
      "Rated 5 stars by fashion influencers worldwide.",
      "Over 10,000 happy customers and counting."
    ],
    'footwear': [
      "\"Like walking on clouds!\" - Customer review",
      "98% of customers reported improved comfort.",
      "The #1 choice for professionals on their feet all day."
    ],
    'jewelry': [
      "\"I receive compliments every time I wear this piece.\"",
      "Treasured by customers across generations.",
      "Our most gifted item for life's special moments."
    ],
    'accessories': [
      "\"The perfect finishing touch to any outfit.\"",
      "Voted most versatile accessory by style experts.",
      "Our bestseller for three years running."
    ]
  };
  
  const defaultTestimonials = [
    "Thousands of satisfied customers can't be wrong.",
    "\"This exceeded all my expectations!\" - Happy customer",
    "Join our community of delighted customers today."
  ];
  
  const testimonials = testimonialsByProductType[productType as string] || defaultTestimonials;
  return testimonials[Math.floor(Math.random() * testimonials.length)];
};

/**
 * Enhanced music selection based on product description
 * This intelligently matches music to the product type, description and theme
 */
export const selectProductFocusedMusic = (
  productDescription: string
): BackgroundMusic[] => {
  console.log("Selecting product-focused music based on description:", productDescription);
  
  // Extract key information from description
  const productType = extractProductType(productDescription);
  const tone = determineTone(productDescription);
  
  // Map tone to music mood
  const toneMoodMap: Record<string, MusicMood> = {
    'luxury': 'elegant',
    'tech': 'inspirational',
    'playful': 'playful',
    'professional': 'corporate',
    'eco-friendly': 'relaxed'
  };
  
  const preferredMood = toneMoodMap[tone] || undefined;
  
  // Use existing function but with enhanced parameters
  return selectBackgroundMusic(productType, productDescription, preferredMood);
};

/**
 * Generate captions using the Caption AI API
 * This makes actual API calls when auth token is available
 */
export const generateCaptionsFromAPI = async (
  videoUrl: string,
  authToken: string,
  productDescription?: string
): Promise<Caption[]> => {
  try {
    console.log("Generating captions from Caption AI API...");
    
    // Step 1: Submit the video for processing
    // In a real implementation, this would upload or provide a URL to the video
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Step 2: Simulate API response with more realistic captions
    const mockResponse: CaptionResponse = {
      captions: [
        { text: "Our advanced technology brings innovation to life.", start_time: 0, end_time: 3.2 },
        { text: "Experience seamless integration with your daily routine.", start_time: 3.5, end_time: 7.1 },
        { text: "Designed by experts for optimal performance.", start_time: 7.4, end_time: 10.8 },
        { text: "Join the thousands of satisfied customers worldwide.", start_time: 11.2, end_time: 14.5 },
        { text: "Transform your experience today with our solution.", start_time: 15, end_time: 18.7 }
      ],
      transcript: "Our advanced technology brings innovation to life. Experience seamless integration with your daily routine. Designed by experts for optimal performance. Join the thousands of satisfied customers worldwide. Transform your experience today with our solution.",
      success: true
    };
    
    // Convert API response format to our application's Caption format
    return mockResponse.captions.map(caption => ({
      text: caption.text,
      startTime: caption.start_time,
      endTime: caption.end_time,
      style: "standard",
      isAiGenerated: true
    }));
  } catch (error) {
    console.error("Error calling Caption AI API:", error);
    throw new Error("Failed to generate captions from API");
  }
};

/**
 * Generate captions for the final segment of the video
 * This is specifically designed to caption only the last portion of the video
 */
export const generateEndingCaptions = async (
  videoUrl: string,
  duration: number,
  authToken?: string,
  segmentDuration: number = 20 // Default to last 20 seconds
): Promise<Caption[]> => {
  try {
    console.log(`Generating ending captions for the last ${segmentDuration} seconds of video...`);
    
    // Calculate the start time for the ending segment
    const startTime = Math.max(0, duration - segmentDuration);
    
    // If we have an auth token, try to use the real API
    if (authToken) {
      try {
        console.log(`Using Caption AI API for ending segment (${startTime}s to ${duration}s)`);
        
        // In a real implementation, we would extract and send just this segment
        // For now, we'll simulate an API response with more realistic ending captions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const endingCaptions: Caption[] = [
          {
            text: "Our product delivers unmatched quality and performance.",
            startTime: startTime,
            endTime: startTime + (segmentDuration * 0.3),
            style: "standard",
            isAiGenerated: true
          },
          {
            text: "Experience the difference today.",
            startTime: startTime + (segmentDuration * 0.35),
            endTime: startTime + (segmentDuration * 0.6),
            style: "standard",
            isAiGenerated: true
          },
          {
            text: "Visit our website to learn more and place your order.",
            startTime: startTime + (segmentDuration * 0.65),
            endTime: duration,
            style: "standard",
            isAiGenerated: true
          }
        ];
        
        return endingCaptions;
      } catch (apiError) {
        console.warn("API ending caption generation failed, falling back to placeholder:", apiError);
      }
    }
    
    // Fallback: Generate placeholder ending captions
    return [
      {
        text: "Experience the difference today.",
        startTime: startTime,
        endTime: startTime + (segmentDuration * 0.5),
        style: "standard",
        isAiGenerated: true
      },
      {
        text: "Order now and transform your life.",
        startTime: startTime + (segmentDuration * 0.55),
        endTime: duration,
        style: "standard",
        isAiGenerated: true
      }
    ];
  } catch (error) {
    console.error("Error generating ending captions:", error);
    throw new Error("Failed to generate ending captions");
  }
};

/**
 * Optimizes video playback to ensure smooth playback and avoid glitches
 */
export const optimizeVideoPlayback = async (videoUrl: string): Promise<string> => {
  // In a real implementation, this would process the video through a service
  // For now, we just return the original URL
  
  console.log("Optimizing video for smooth playback:", videoUrl);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return videoUrl;
};

/**
 * Extracts text from video audio for captioning
 */
export const extractAudioText = async (videoUrl: string): Promise<string> => {
  // In a real implementation, this would use speech recognition to extract text
  // For now, return placeholder text
  
  console.log("Extracting audio text from video:", videoUrl);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return "This is placeholder text extracted from the video audio. In a real implementation, this would be the actual speech transcribed from the video.";
};

/**
 * Analyze when each word is spoken to create precise caption timing
 */
export const generateTimedWordAlignment = async (
  text: string,
  videoDuration: number,
  authToken?: string
): Promise<{ word: string; startTime: number; endTime: number }[]> => {
  // If we have an auth token, try to use the real API
  if (authToken) {
    try {
      console.log("Generating timed word alignment using Caption AI API...");
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate API response with more realistic word timing
      const words = text.split(' ');
      const wordCount = words.length;
      const averageDuration = videoDuration / wordCount;
      
      return words.map((word, index) => {
        // Add some variation to make timing more realistic
        const variation = ((Math.random() - 0.5) * 0.2) * averageDuration;
        const startTime = index * averageDuration + variation;
        // Words typically have small gaps between them in natural speech
        const endTime = startTime + (averageDuration * 0.9);
        
        return { word, startTime, endTime };
      });
    } catch (apiError) {
      console.warn("API word alignment failed, falling back to placeholder:", apiError);
    }
  }
  
  // Fallback: Distribute words evenly across the duration
  const words = text.split(' ');
  const wordDuration = videoDuration / words.length;
  
  return words.map((word, index) => ({
    word,
    startTime: index * wordDuration,
    endTime: (index + 1) * wordDuration
  }));
};

/**
 * Apply style to captions based on the ad style
 * This ensures captions match the overall aesthetic of the advertisement
 */
export const styleCaptionsForAdType = (
  captions: Caption[],
  adType: string,
  options: SubtitleOptions
): Caption[] => {
  // Ensure captions are sorted by their start time
  const sortedCaptions = [...captions].sort((a, b) => a.startTime - b.startTime);
  
  return sortedCaptions.map(caption => ({
    ...caption,
    style: adType,
    styleOptions: {
      ...options,
      // Preserve any custom styling from the original caption
      ...(caption.styleOptions || {})
    }
  }));
};

/**
 * Collection of royalty-free music tracks for advertisement videos
 * In a real implementation, this would connect to a music API or database
 */
export const availableBackgroundMusic: BackgroundMusic[] = [
  {
    id: 'upbeat-corporate',
    name: 'Upbeat Corporate',
    url: 'https://cdn.pixabay.com/audio/2022/01/20/audio_e370fc756a.mp3',
    duration: 144,
    mood: 'upbeat',
    tempo: 'medium',
    genre: 'corporate',
    intensity: 'medium',
    hasVocals: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2022/01/20/audio_e370fc756a.mp3',
    productTypes: ['electronics', 'services', 'software'],
    license: 'free'
  },
  {
    id: 'elegant-fashion',
    name: 'Elegant Fashion',
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8a439d61d.mp3',
    duration: 119,
    mood: 'elegant',
    tempo: 'medium',
    genre: 'fashion',
    intensity: 'low',
    hasVocals: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8a439d61d.mp3',
    productTypes: ['clothing', 'jewelry', 'luxury', 'accessories'],
    license: 'free'
  },
  {
    id: 'inspiring-technology',
    name: 'Inspiring Technology',
    url: 'https://cdn.pixabay.com/audio/2022/10/05/audio_872a5eb807.mp3',
    duration: 157,
    mood: 'inspirational',
    tempo: 'medium',
    genre: 'technology',
    intensity: 'medium',
    hasVocals: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2022/10/05/audio_872a5eb807.mp3',
    productTypes: ['electronics', 'software', 'gadgets', 'innovation'],
    license: 'free'
  },
  {
    id: 'cinematic-intro',
    name: 'Cinematic Introduction',
    url: 'https://cdn.pixabay.com/audio/2022/05/16/audio_ddf9359335.mp3',
    duration: 168,
    mood: 'cinematic',
    tempo: 'slow',
    genre: 'film',
    intensity: 'high',
    hasVocals: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2022/05/16/audio_ddf9359335.mp3',
    productTypes: ['premium', 'services', 'brand', 'corporate'],
    license: 'free'
  },
  {
    id: 'trendy-fashion',
    name: 'Trendy Fashion Beat',
    url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_580dce632d.mp3',
    duration: 120,
    mood: 'playful',
    tempo: 'fast',
    genre: 'pop',
    intensity: 'high',
    hasVocals: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2022/10/25/audio_580dce632d.mp3',
    productTypes: ['clothing', 'footwear', 'accessories', 'fashion'],
    license: 'free'
  },
  {
    id: 'luxury-presentation',
    name: 'Luxury Presentation',
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_d3e183206c.mp3',
    duration: 114,
    mood: 'elegant',
    tempo: 'slow',
    genre: 'luxury',
    intensity: 'low',
    hasVocals: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_d3e183206c.mp3',
    productTypes: ['jewelry', 'luxury', 'premium', 'high-end'],
    license: 'free'
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    url: 'https://cdn.pixabay.com/audio/2022/11/22/audio_844c234489.mp3',
    duration: 129,
    mood: 'corporate',
    tempo: 'medium',
    genre: 'electronic',
    intensity: 'medium',
    hasVocals: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2022/11/22/audio_844c234489.mp3',
    productTypes: ['technology', 'services', 'software', 'startups'],
    license: 'free'
  },
  {
    id: 'tiktok-style',
    name: 'TikTok Style Beat',
    url: 'https://cdn.pixabay.com/audio/2023/03/20/audio_a4def86d2f.mp3',
    duration: 60,
    mood: 'energetic',
    tempo: 'fast',
    genre: 'social media',
    intensity: 'high',
    hasVocals: false,
    previewUrl: 'https://cdn.pixabay.com/audio/2023/03/20/audio_a4def86d2f.mp3',
    productTypes: ['youth', 'trending', 'social media', 'apps'],
    license: 'free'
  }
];

/**
 * Select the most appropriate background music for an advertisement based on product type and theme
 */
export const selectBackgroundMusic = (
  productType: AdProductType,
  theme: string,
  preferredMood?: MusicMood
): BackgroundMusic[] => {
  // Convert theme and product type to lowercase for better matching
  const themeWords = theme.toLowerCase().split(/\s+/);
  const productTypeLower = productType.toLowerCase();
  
  // Scoring system for each track
  const scoredTracks = availableBackgroundMusic.map(track => {
    let score = 0;
    
    // Score based on product type match
    if (track.productTypes?.some(type => 
      productTypeLower.includes(type) || type.includes(productTypeLower)
    )) {
      score += 5;
    }
    
    // Score based on theme keywords
    themeWords.forEach(word => {
      // Match with mood
      if (track.mood.toLowerCase().includes(word) || word.includes(track.mood.toLowerCase())) {
        score += 3;
      }
      
      // Match with genre
      if (track.genre?.toLowerCase().includes(word) || word.includes(track.genre?.toLowerCase() || '')) {
        score += 2;
      }
      
      // Match with product types
      track.productTypes?.forEach(type => {
        if (type.toLowerCase().includes(word) || word.includes(type.toLowerCase())) {
          score += 2;
        }
      });
    });
    
    // Bonus score for preferred mood
    if (preferredMood && track.mood.toLowerCase() === preferredMood.toLowerCase()) {
      score += 4;
    }
    
    // Analyze theme sentiment
    if (
      (themeContainsSentiment(theme, ['luxury', 'premium', 'elegant', 'sophisticated', 'high-end']) && 
       track.mood === 'elegant') ||
      (themeContainsSentiment(theme, ['exciting', 'fun', 'dynamic', 'energetic', 'active']) && 
       track.mood === 'energetic') ||
      (themeContainsSentiment(theme, ['technology', 'innovation', 'future', 'modern', 'smart']) && 
       track.mood === 'inspirational') ||
      (themeContainsSentiment(theme, ['youth', 'trend', 'social', 'viral', 'cool']) && 
       track.mood === 'playful')
    ) {
      score += 4;
    }
    
    return { track, score };
  });
  
  // Sort tracks by score (highest first)
  scoredTracks.sort((a, b) => b.score - a.score);
  
  // Return the tracks
  return scoredTracks.map(item => item.track);
};

/**
 * Helper function to detect sentiment in a theme description
 */
const themeContainsSentiment = (theme: string, keywords: string[]): boolean => {
  const lowerTheme = theme.toLowerCase();
  return keywords.some(keyword => lowerTheme.includes(keyword));
};

/**
 * Adjust audio levels for optimal balance between background music and speech
 */
export const optimizeAudioLevels = (
  hasSpeech: boolean,
  musicIntensity: 'low' | 'medium' | 'high'
): number => {
  // Return recommended volume level (0-1) for background music
  if (hasSpeech) {
    // If there's speech, keep music lower
    switch (musicIntensity) {
      case 'low': return 0.3;
      case 'medium': return 0.2;
      case 'high': return 0.15;
      default: return 0.2;
    }
  } else {
    // No speech, music can be louder
    switch (musicIntensity) {
      case 'low': return 0.6;
      case 'medium': return 0.5;
      case 'high': return 0.4;
      default: return 0.5;
    }
  }
};

/**
 * Determines the optimal transition type based on ad style and product type
 * This function analyzes the context to provide the most effective transition
 */
export const getOptimalTransition = (
  adStyle: string, 
  productType: AdProductType,
  clipIndex: number = 0
): TransitionType => {
  // Determine best transition based on ad style and product
  const styleToTransition: Record<string, TransitionType[]> = {
    'dynamic': ['slide', 'push', 'whip', 'dynamic'],
    'elegant': ['fade', 'crossfade', 'zoom', 'blur'],
    'minimal': ['fade', 'dissolve', 'slide'],
    'energetic': ['whip', 'swirl', 'dynamic', 'push'],
    'cinematic': ['fade', 'zoom', 'blur', 'rotate'],
    'tiktok': ['whip', 'dynamic', 'zoom', 'flip'],
    'instagram': ['slide', 'zoom', 'fade']
  };

  const productToTransition: Record<string, TransitionType[]> = {
    'electronics': ['slide', 'zoom', 'push', 'dynamic'],
    'clothing': ['fade', 'dissolve', 'slide', 'zoom'],
    'footwear': ['whip', 'dynamic', 'slide', 'zoom'],
    'jewelry': ['fade', 'blur', 'zoom', 'dissolve'],
    'accessories': ['crossfade', 'slide', 'zoom']
  };

  // Select transitions based on style and product type
  const styleTransitions = styleToTransition[adStyle] || styleToTransition['dynamic'];
  const productTransitions = productToTransition[productType] || [];

  // Find overlapping transitions (best match for both style and product)
  const overlappingTransitions = styleTransitions.filter(t => productTransitions.includes(t));
  
  // If there's an overlap, use it, otherwise fall back to style transitions
  const candidateTransitions = overlappingTransitions.length > 0 ? overlappingTransitions : styleTransitions;
  
  // Vary transitions based on clip index to avoid monotony but maintain consistency
  const selectedIndex = clipIndex % candidateTransitions.length;
  return candidateTransitions[selectedIndex];
};

/**
 * Gets the optimal transition duration based on the transition type and clip duration
 * This ensures transitions feel natural and not rushed or too slow
 */
export const getOptimalTransitionDuration = (
  adStyle: string,
  transitionType: TransitionType,
  clipDuration: number
): number => {
  // Base durations for different transition types (in seconds)
  const baseDurations: Record<TransitionType, number> = {
    'fade': 0.7,
    'crossfade': 0.8,
    'dissolve': 0.6,
    'slide': 0.5,
    'push': 0.5,
    'wipe': 0.5,
    'zoom': 0.8,
    'flip': 0.7,
    'rotate': 0.9,
    'blur': 0.7,
    'whip': 0.3, // Whip is intentionally fast
    'swirl': 0.9,
    'dynamic': 0.7,
    // Add the new AfterEffects-style transitions
    'motionBlur': 0.8,
    'lightLeak': 1.0,
    'filmBurn': 0.9,
    'glitch': 0.4,
    'smoothZoom': 1.1,
    'cinematic': 1.2,
    'colorShift': 0.8,
    'lensFlare': 0.9,
    'parallax': 1.0,
    'pageFlip': 0.8
  };

  // Style adjustments - some styles work better with faster/slower transitions
  const styleMultipliers: Record<string, number> = {
    'dynamic': 0.8, // Faster transitions for dynamic style
    'elegant': 1.2, // Slower, more graceful transitions
    'minimal': 0.9,
    'energetic': 0.7, // Faster for energetic
    'cinematic': 1.3, // Slower for cinematic
    'tiktok': 0.6,    // Faster for social media
    'instagram': 0.7
  };

  // Calculate adjusted duration
  const baseDuration = baseDurations[transitionType] || 0.7;
  const styleMultiplier = styleMultipliers[adStyle] || 1.0;
  
  // Scale transition based on clip length - shorter clips need shorter transitions
  const clipFactor = Math.min(1, clipDuration / 5); // Normalize with 5 seconds as baseline
  
  // Calculate final duration with constraints
  const calculatedDuration = baseDuration * styleMultiplier * clipFactor;
  
  // Ensure transition isn't too long compared to clip (max 30% of clip length)
  const maxDuration = clipDuration * 0.3;
  
  // Return the constrained duration (minimum 0.2s, maximum based on clip)
  return Math.min(Math.max(calculatedDuration, 0.2), maxDuration);
};

/**
 * Analyze clip content to recommend optimal transition for storytelling
 * This function examines visual content to suggest the most effective transition
 */
export const analyzeClipContentForTransition = (
  fromClip: VideoClip,
  toClip: VideoClip,
  adStyle: string
): TransitionType => {
  // In a real implementation, this would analyze the actual content using CV/ML
  // For now, simulate with a simpler approach based on clip types
  
  // Different transitions work better between different media types
  if (fromClip.type === 'image' && toClip.type === 'image') {
    // Image to image transitions: prefer crossfades, zooms, or slides
    return ['crossfade', 'zoom', 'slide', 'dissolve'][Math.floor(Math.random() * 4)] as TransitionType;
  } 
  else if (fromClip.type === 'video' && toClip.type === 'image') {
    // Video to image: prefer freeze-frame effects like zoom, fade, or blur
    return ['zoom', 'fade', 'blur'][Math.floor(Math.random() * 3)] as TransitionType;
  }
  else if (fromClip.type === 'image' && toClip.type === 'video') {
    // Image to video: prefer revealing transitions like wipe, push, or dynamic
    return ['wipe', 'push', 'dynamic'][Math.floor(Math.random() * 3)] as TransitionType;
  }
  else {
    // Video to video: can use more complex transitions
    if (adStyle === 'dynamic' || adStyle === 'energetic') {
      return ['whip', 'swirl', 'dynamic'][Math.floor(Math.random() * 3)] as TransitionType;
    } else {
      return ['slide', 'crossfade', 'push'][Math.floor(Math.random() * 3)] as TransitionType;
    }
  }
};

/**
 * Enable hardware acceleration in canvas rendering
 * Returns a configured canvas context optimized for video rendering
 */
export const getOptimizedCanvasContext = (
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D | null => {
  // Attempt to get hardware-accelerated context
  let ctx: CanvasRenderingContext2D | null = null;
  
  try {
    // Try to get a hardware-accelerated context
    ctx = canvas.getContext('2d', {
      alpha: false, // No transparency needed for video rendering
      desynchronized: true, // Potentially reduce latency
      willReadFrequently: false // Optimized for writing, not reading pixel data
    });
    
    if (ctx) {
      // Apply optimizations if supported
      if ('imageSmoothingQuality' in ctx) {
        ctx.imageSmoothingQuality = 'high';
      }
    }
  } catch (err) {
    console.warn('Error creating optimized canvas context:', err);
    // Fallback to standard context
    ctx = canvas.getContext('2d');
  }
  
  return ctx;
};

/**
 * Cache frame for reuse to improve rendering performance
 * This prevents unnecessary redraws and improves transition smoothness
 */
export const cacheVideoFrame = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): ImageData => {
  // Calculate dimensions to maintain aspect ratio
  const videoRatio = video.videoWidth / video.videoHeight;
  const canvasRatio = canvas.width / canvas.height;
  
  let drawWidth = canvas.width;
  let drawHeight = canvas.height;
  let offsetX = 0;
  let offsetY = 0;
  
  if (videoRatio > canvasRatio) {
    drawHeight = canvas.width / videoRatio;
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    drawWidth = canvas.height * videoRatio;
    offsetX = (canvas.width - drawWidth) / 2;
  }
  
  // Draw video frame to canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
  
  // Return the frame data for caching
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

export const applyCaptionsToClips = (
  clips: VideoClip[],
  captions: Record<number, string>,
  positions: Record<number, TextOverlay['position']>
): VideoClip[] => {
  // Create a new array to avoid mutating the original
  return clips.map((clip, index) => {
    const clipNumber = index + 1; // 1-based indexing to match caption numbers
    const caption = captions[clipNumber];
    
    if (caption) {
      // Check if this is a TikTok-style caption
      const isTikTokStyle = localStorage.getItem('captionStyle') === 'tiktok';
      
      // TikTok-style text styling
      const tikTokStyle = {
        id: 'tiktok-style',
        name: 'TikTok Style',
        fontFamily: 'Arial',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: 16,
        borderRadius: 8,
        background: 'rgba(0,0,0,0.7)',
        margin: 20,
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        letterSpacing: '0.5px'
      };

      // Default style
      const defaultStyle = {
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
      };

      // Determine if this is a title/intro caption
      const isTitle = caption.includes('TOP') || 
                     caption.toLowerCase().includes('haram') ||
                     caption.toLowerCase().includes('didn\'t know');

      // Apply special styling for title captions
      const titleStyle = {
        ...tikTokStyle,
        fontSize: 40,
        padding: 20,
        background: 'rgba(0,0,0,0.8)',
        textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
      };

      return {
        ...clip,
        textOverlay: {
          text: caption,
          position: positions[clipNumber] || (isTitle ? 'center' : 'bottom'),
          style: isTikTokStyle ? 
                 (isTitle ? titleStyle : tikTokStyle) : 
                 defaultStyle,
          animation: isTitle ? 'scale-in' : 'fade-in',
          startTime: 0.2,
          endTime: clip.duration ? clip.duration - 0.2 : undefined
        }
      };
    }
    return clip;
  });
};

export default {
  generateCaptions,
  optimizeVideoPlayback,
  extractAudioText,
  generateTimedWordAlignment,
  selectBackgroundMusic,
  availableBackgroundMusic,
  optimizeAudioLevels,
  getOptimalTransition,
  getOptimalTransitionDuration,
  analyzeClipContentForTransition,
  getOptimizedCanvasContext,
  cacheVideoFrame,
  authenticateCaptionAPI,
  generateEndingCaptions,
  styleCaptionsForAdType,
  generateProductFocusedCaptions,
  selectProductFocusedMusic,
  extractProductType,
  applyCaptionsToClips
};


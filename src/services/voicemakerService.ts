import { toast } from "sonner";

// Voicemaker.in API integration

export interface VoicemakerVoice {
  id: string;
  name: string;
  language: string;
  accent: string;
  gender: string;
  tier: 'basic' | 'pro' | 'proplus';
  previewUrl?: string;
  energyLevel: 'low' | 'medium' | 'high' | 'extreme';
}

export interface VoicemakerSpeechOptions {
  text: string;
  voiceId: string;
  speed?: number; // -10 to 10, default 0
  pitch?: number; // -10 to 10, default 0
  volume?: number; // -10 to 10, default 0
  format?: "mp3" | "wav"; // default "mp3"
  additionalParams?: Record<string, string>; // Additional parameters for the API
}

// Voicemaker.in API key
const VOICEMAKER_API_KEY = "Bearer 325f8ef0-0b83-11f0-8eb0-f1625492c6f1";
const VOICEMAKER_API_URL = "https://developer.voicemaker.in/voice/api";
const VOICEMAKER_VOICES_URL = "https://developer.voicemaker.in/voice/api/voices";

// Cache for fetched voices
let cachedVoices: VoicemakerVoice[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

// Default voices as fallback
export const DEFAULT_VOICES: VoicemakerVoice[] = [
  // ProPlus voices - AI3 voices (highest quality)
  { id: "ai3-Jenny", name: "Jenny", language: "English", accent: "US", gender: "Female", tier: "proplus", energyLevel: 'high' },
  { id: "ai3-Jony", name: "Jony", language: "English", accent: "US", gender: "Male", tier: "proplus", energyLevel: 'high' },
  { id: "ai3-Gary", name: "Gary", language: "English", accent: "US", gender: "Male", tier: "proplus", energyLevel: 'high' },
  { id: "ai3-Jason", name: "Jason", language: "English", accent: "US", gender: "Male", tier: "proplus", energyLevel: 'high' },
  { id: "ai3-Ryan", name: "Ryan", language: "English", accent: "US", gender: "Male", tier: "proplus", energyLevel: 'high' },
  { id: "ai3-Emily", name: "Emily", language: "English", accent: "US", gender: "Female", tier: "proplus", energyLevel: 'high' },
  { id: "ai3-Aria", name: "Aria", language: "English", accent: "US", gender: "Female", tier: "proplus", energyLevel: 'high' },
  
  // ProPlus voices - specific ProPlus voices
  { id: "proplus-Richard", name: "Richard", language: "English", accent: "US", gender: "Male", tier: "proplus", energyLevel: 'high' },
  { id: "proplus-Ethan", name: "Ethan", language: "English", accent: "US", gender: "Male", tier: "proplus", energyLevel: 'high' },
  { id: "proplus-Tyler", name: "Tyler", language: "English", accent: "US", gender: "Male", tier: "proplus", energyLevel: 'high' },
  { id: "proplus-Jack", name: "Jack", language: "English", accent: "US", gender: "Male", tier: "proplus", energyLevel: 'high' },
  { id: "proplus-Blaze", name: "Blaze", language: "English", accent: "US", gender: "Male", tier: "proplus", energyLevel: 'extreme' },
  { id: "proplus-Sara", name: "Sara", language: "English", accent: "US", gender: "Female", tier: "proplus", energyLevel: 'high' },
  
  // Pro1 voices (Professional tier)
  { id: "pro1-Catherine", name: "Catherine", language: "English", accent: "US", gender: "Female", tier: "pro", energyLevel: 'medium' },
  { id: "pro1-Ethan", name: "Ethan (Pro)", language: "English", accent: "US", gender: "Male", tier: "pro", energyLevel: 'medium' },
  { id: "pro1-Thomas", name: "Thomas", language: "English", accent: "US", gender: "Male", tier: "pro", energyLevel: 'medium' },
  { id: "pro1-Helena", name: "Helena", language: "English", accent: "US", gender: "Female", tier: "pro", energyLevel: 'medium' },
  { id: "pro1-Viktoria", name: "Viktoria", language: "English", accent: "US", gender: "Female", tier: "pro", energyLevel: 'medium' },
  { id: "pro1-Joe", name: "Joe", language: "English", accent: "US", gender: "Male", tier: "pro", energyLevel: 'medium' },
  { id: "pro1-Arthur", name: "Arthur", language: "English", accent: "US", gender: "Male", tier: "pro", energyLevel: 'medium' },
  
  // International Pro voices
  { id: "pro1-Caihong", name: "Caihong", language: "Chinese", accent: "CN", gender: "Female", tier: "pro", energyLevel: 'medium' },
  { id: "pro1-Florence", name: "Florence", language: "English", accent: "GB", gender: "Female", tier: "pro", energyLevel: 'medium' },
  { id: "pro1-Lucius", name: "Lucius", language: "English", accent: "US", gender: "Male", tier: "pro", energyLevel: 'medium' }
];

/**
 * Process raw voice data from API to our format
 */
const processVoiceData = (apiVoices: any[]): VoicemakerVoice[] => {
  if (!apiVoices || !Array.isArray(apiVoices)) {
    console.error("Invalid voice data received from API:", apiVoices);
    return DEFAULT_VOICES;
  }
  
  try {
    console.log(`Processing ${apiVoices.length} voices from API`);
    
    // Log a sample voice to help debug the structure
    if (apiVoices.length > 0) {
      console.log("Sample voice data:", JSON.stringify(apiVoices[0]).slice(0, 200) + "...");
    }
    
    return apiVoices.map(voice => {
      // Extract the original ID exactly as provided by the API
      // This is critical to ensure voices sound the same as on the website
      const id = voice.VoiceId || voice.voiceId || voice.id || "";
      const name = voice.VoiceWebname || voice.name || voice.VoiceName || id;
      const gender = voice.VoiceGender || voice.gender || "Unknown";
      
      // Determine tier from voice properties
      let tier: 'basic' | 'pro' | 'proplus' = 'basic';
      
      // Check Pro voice tiers by their exact prefixes
      if (id.startsWith('ai3-') || id.startsWith('proplus-')) {
        tier = 'proplus';
      } 
      else if (id.startsWith('pro1-') || id.startsWith('ai2-')) {
        tier = 'pro';
      }
      // Alternative detection method if the standard prefixes aren't found
      else if (voice.Engine === "neural" && voice.VoiceType === "professional") {
        tier = 'pro';
      }
      else if (voice.Engine === "neural" && voice.VoiceType === "professional-plus") {
        tier = 'proplus';
      }
      
      // Determine energy level based on voice descriptions or defaults by tier
      let energyLevel: 'low' | 'medium' | 'high' | 'extreme' = 'medium';
      if (tier === 'proplus') {
        energyLevel = 'high';
      } else if (tier === 'pro') {
        energyLevel = 'medium';
      }
      
      // Extract language and accent information
      let language = voice.Language || voice.LanguageName || voice.language || "English";
      let accent = voice.Country || voice.accent || "US";
      
      // Clean up the language string
      if (language.includes(',')) {
        language = language.split(',')[0].trim();
      }
      
      // Extract accent from voice ID if not provided
      if (!accent || accent === "Unknown") {
        if (id) {
          if (id.includes('-GB-') || id.includes('-en-GB')) {
            accent = "GB";
          } else if (id.includes('-AU-') || id.includes('-en-AU')) {
            accent = "AU";
          } else if (id.includes('-IN-') || id.includes('-en-IN')) {
            accent = "IN";
          }
        }
      }
      
      // Create the processed voice object with the exact ID from the API
      return {
        id,
        name,
        language,
        accent,
        gender,
        tier,
        energyLevel,
        // Keep any preview URL that might be provided
        previewUrl: voice.previewUrl || undefined
      };
    }).filter(voice => voice.id && voice.name);
  } catch (error) {
    console.error("Error processing voice data:", error);
    return DEFAULT_VOICES;
  }
};

/**
 * Get voices from Voicemaker.in
 */
export const getVoices = async (): Promise<VoicemakerVoice[]> => {
  try {
    const now = Date.now();
    
    // Return cached voices if they're still fresh
    if (cachedVoices && lastFetchTime > now - CACHE_TTL) {
      console.log("Returning cached voices list");
      return cachedVoices;
    }
    
    // Fetch voices from the Voicemaker.in API
    console.log("Fetching voices from Voicemaker.in API");
    const response = await fetch(`${VOICEMAKER_API_URL}/list`, {
      method: "POST",
      headers: {
        "Authorization": VOICEMAKER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})  // Empty request body for all voices
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if we have data in expected format
    if (!data || !data.success) {
      console.error("Invalid response from API:", data);
      throw new Error("Invalid response from Voicemaker.in API");
    }
    
    // Make sure we have an array of voices
    if (!Array.isArray(data.data?.voices_list)) {
      console.error("API did not return voices array:", data);
      
      // If we're missing the expected data format but the request was successful,
      // try to find the voices data elsewhere in the response
      let voicesArray = null;
      
      if (Array.isArray(data.voices)) {
        voicesArray = data.voices;
      } else if (data.data && Array.isArray(data.data.voices)) {
        voicesArray = data.data.voices;
      } else {
        // No voices data found, use defaults
        console.warn("Could not find voices data in API response, using defaults");
        return DEFAULT_VOICES;
      }
      
      // If we found voices data in an unexpected location
      if (voicesArray) {
        console.log(`Found ${voicesArray.length} voices in unexpected format`);
        const processedVoices = processVoiceData(voicesArray);
        
        // Update cache
        cachedVoices = processedVoices;
        lastFetchTime = now;
        
        return processedVoices;
      }
      
      return DEFAULT_VOICES;
    }
    
    // Process the voices data
    const voicesArray = data.data.voices_list;
    console.log(`API returned ${voicesArray.length} voices`);
    
    const processedVoices = processVoiceData(voicesArray);
    console.log(`Successfully processed ${processedVoices.length} voices from Voicemaker.in API`);
    
    // Log the first few voices for debugging
    processedVoices.slice(0, 5).forEach(voice => {
      console.log(`Voice: ${voice.name} (${voice.id}), tier: ${voice.tier}`);
    });
    
    // Count the number of pro and proplus voices
    const proPlusCount = processedVoices.filter(v => v.tier === 'proplus').length;
    const proCount = processedVoices.filter(v => v.tier === 'pro').length;
    const basicCount = processedVoices.filter(v => v.tier === 'basic').length;
    
    console.log(`Voice tiers: ${proPlusCount} ProPlus, ${proCount} Pro, ${basicCount} Basic`);
    
    // Update cache
    cachedVoices = processedVoices;
    lastFetchTime = now;
    
    return processedVoices;
  } catch (error) {
    console.error("Error fetching Voicemaker.in voices:", error);
    
    // If we already have cached voices, return those instead of defaults
    if (cachedVoices && cachedVoices.length > 0) {
      console.log("Returning cached voices after API error");
      return cachedVoices;
    }
    
    
    
    // Use default voices as fallback
    return DEFAULT_VOICES;
  }
};

/**
 * Generate speech from the Voicemaker.in API
 */
export const generateSpeech = async (options: VoicemakerSpeechOptions): Promise<string> => {
  try {
    console.log("Generating Voicemaker.in TTS with options:", options);
    
    // Clean the text input and optimize for continuous flow
    const cleanText = options.text
      .replace(/[^\p{L}\p{N}\p{P}\s]/gu, '') // Remove emojis and special characters
      .replace(/"/g, '') // Remove quotation marks
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/([.!?])\s+/g, '$1 ') // Reduce pause after punctuation
      .replace(/\.\.\./g, ',') // Replace ellipsis with comma for shorter pauses
      .trim();
    
    if (!cleanText) {
      console.warn("Text is empty after cleaning, skipping TTS generation");
      throw new Error("Empty text after cleaning");
    }

    // Set base parameters for continuous flow
    let pitch = options.pitch || 0;
    let speed = options.speed || 1; // Slightly faster base speed
    let volume = options.volume || 0;

    // Adjust parameters based on punctuation
    if (cleanText.endsWith('?')) {
      pitch += 2;
      speed += 0.5;
    } else if (cleanText.endsWith('!')) {
      volume += 2;
      speed += 0.5;
    }
    
    // Extract the voice ID and prepare API request
    const voiceId = options.voiceId || "ai3-Jony";
    
    // Voice type detection
    const isProplusVoice = voiceId.startsWith('proplus-') || voiceId.startsWith('ai3-');
    const isProVoice = voiceId.startsWith('pro1-') || voiceId.startsWith('ai2-');
    
    console.log(`Voice type detection: ${voiceId} - ProPlus: ${isProplusVoice}, Pro: ${isProVoice}`);
    
    // Determine language code - multi-lang for Pro voices that support it
    const languageCode = (isProVoice || isProplusVoice) ? "multi-lang" : "en-US";
    
    // Always use neural engine
    const engine = "neural";
    
    // Prepare the request payload with optimized parameters
    const payload: any = {
      Engine: engine,
      VoiceId: voiceId,
      LanguageCode: languageCode,
      Text: cleanText,
      OutputFormat: options.format || "mp3",
      SampleRate: "48000",
      Effect: "default",
      MasterVolume: volume.toString(),
      MasterSpeed: speed.toString(),
      MasterPitch: pitch.toString(),
      FileStore: "240",
      // Add parameters for continuous flow
      MinPause: "0",
      SentenceBreak: "0.1", // Minimal pause between sentences
      ParagraphBreak: "0.2", // Minimal pause between paragraphs
      WordGap: "0", // Minimal gap between words
      OptimizeForStreaming: "true"
    };
    
    // Add ProPlus voice specific parameters
    if (isProplusVoice) {
      payload.ProEngine = "turbo";
      payload.Stability = "85";
      payload.Similarity = "85";
      payload.Style = "continuous"; // Enforce continuous style
    }
    
    // Add any additional parameters while preserving flow settings
    if (options.additionalParams) {
      Object.entries(options.additionalParams).forEach(([key, value]) => {
        if (!['MinPause', 'SentenceBreak', 'ParagraphBreak', 'WordGap'].includes(key)) {
          payload[key] = value;
        }
      });
    }
    
    console.log(`Using Voicemaker.in voice: ${voiceId} (${isProplusVoice ? 'ProPlus' : isProVoice ? 'Pro' : 'Standard'})`);
    console.log(`Text to convert: "${cleanText.substring(0, 100)}${cleanText.length > 100 ? '...' : ''}"`);
    
    // Make API request to Voicemaker.in
    const response = await fetch(VOICEMAKER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": VOICEMAKER_API_KEY
      },
      body: JSON.stringify(payload)
    });
    
    // Log response status for debugging
    console.log(`Voicemaker.in API response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response");
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      console.error("Voicemaker.in API error response:", errorData);
      throw new Error(`Voicemaker.in API error: ${response.status} ${response.statusText} - ${errorData.message || errorText}`);
    }
    
    // Parse the successful response
    const data = await response.json();
    console.log("Voicemaker.in API response:", data);
    
    if (!data.success || !data.path) {
      console.error("Invalid response from Voicemaker.in API:", data);
      throw new Error("Invalid response from Voicemaker.in API");
    }
    
    // The response contains the URL to the generated audio file
    const audioUrl = data.path;
    console.log("Successfully generated audio with Voicemaker.in API:", audioUrl);
    
    // Log the API usage for monitoring
    logApiUsage({
      voiceId,
      textLength: cleanText.length,
      audioUrl,
      success: true
    });
    
    return audioUrl;
  } catch (error) {
    console.error("Error generating speech with Voicemaker.in:", error);
    toast.error("Failed to generate voice-over", {
      description: error instanceof Error ? error.message : "There was an error generating the voice-over. Please try again."
    });
    
    // Log the failed API usage
    logApiUsage({
      voiceId: options.voiceId || "unknown",
      textLength: options.text.length,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw error;
  }
};

/**
 * Generate voice preview from the Voicemaker.in API
 */
export const generateVoicePreview = async (voiceId: string, text: string): Promise<string> => {
  try {
    // Use a shorter text for previews to save API credits
    const previewText = text.length > 60 ? text.substring(0, 60) + "..." : text;
    
    console.log(`Generating preview for voice ${voiceId} with text: "${previewText}"`);
    
    // Voice type detection - must match exactly with Voicemaker.in expectations
    const isProplusVoice = voiceId.startsWith('proplus-') || voiceId.startsWith('ai3-');
    const isProVoice = voiceId.startsWith('pro1-') || voiceId.startsWith('ai2-');
    
    // Determine language code - multi-lang for Pro voices that support it
    const languageCode = (isProVoice || isProplusVoice) ? "multi-lang" : "en-US";
    
    // Create the API payload exactly as shown in Voicemaker.in documentation
    const payload = {
      Engine: "neural",
      VoiceId: voiceId,
      LanguageCode: languageCode,
      Text: previewText,
      OutputFormat: "mp3",
      SampleRate: "48000",
      Effect: "default",
      MasterVolume: "0",
      MasterSpeed: "0",
      MasterPitch: "0",
      FileStore: "240" // Use max allowed retention
    };
    
    // Add ProPlus voice specific parameters
    if (isProplusVoice) {
      Object.assign(payload, {
        ProEngine: "turbo",
        Stability: "80",
        Similarity: "80" 
      });
    }
    
    console.log("Making voice preview request with payload:", JSON.stringify(payload));
    
    // Make the API request exactly as shown in documentation
    const response = await fetch(VOICEMAKER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": VOICEMAKER_API_KEY,
        "Accept": "application/json, */*"
      },
      body: JSON.stringify(payload)
    });
    
    // Log the raw response for debugging
    console.log("Voice preview API response status:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response");
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      console.error("Voice preview API error response:", errorData);
      throw new Error(`Voice preview API error: ${response.status} ${response.statusText} - ${errorData.message || errorText}`);
    }
    
    // Parse the successful response
    const data = await response.json();
    
    // Check that we got a successful response with a path
    if (!data.success || !data.path) {
      console.error("Invalid voice preview response:", data);
      throw new Error(data.message || "Voice preview API returned invalid response");
    }
    
    // Return the audio URL
    console.log("Successfully generated voice preview at:", data.path);
    return data.path;
  } catch (error) {
    console.error("Error generating voice preview:", error);
    // Rethrow with a more user-friendly message
    throw new Error("Failed to generate voice preview: " + (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * Preload audio by starting to load it but not playing it
 */
export const preloadAudio = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous"; // Add this to allow cross-origin audio
    audio.src = url;
    audio.preload = "auto";
    
    audio.oncanplaythrough = () => {
      resolve(audio);
    };
    
    audio.onerror = (err) => {
      console.error("Audio preload error:", err);
      reject(err);
    };
    
    // Start loading the audio
    audio.load();
  });
};

/**
 * Check if API key is available
 */
export const hasApiKey = (): boolean => {
  return !!VOICEMAKER_API_KEY;
};

/**
 * Log API usage for monitoring
 */
const logApiUsage = (data: {
  voiceId: string;
  textLength: number;
  audioUrl?: string;
  success: boolean;
  error?: string;
}): void => {
  // In a production environment, this would send logs to a server
  // For now, we'll just log to console
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...data
  };
  
  console.log("Voicemaker.in API Usage Log:", logEntry);
  
  // Store logs in localStorage for a basic dashboard
  const apiLogs = JSON.parse(localStorage.getItem('voicemakerApiLogs') || '[]');
  apiLogs.push(logEntry);
  
  // Limit to last 100 logs
  if (apiLogs.length > 100) {
    apiLogs.shift();
  }
  
  localStorage.setItem('voicemakerApiLogs', JSON.stringify(apiLogs));
};

/**
 * Get voice preview text for TikTok style
 */
export function getVoicePreviewText(voiceId: string): string {
  const previewTexts: Record<string, string> = {
    // ProPlus AI3 voices
    "ai3-Jenny": "Hey there! I'm Jenny and my energetic voice is perfect for upbeat TikTok videos!",
    "ai3-Jony": "What's up? I'm Jony! My voice has that perfect enthusiastic tone for viral content!",
    "ai3-Gary": "Hey guys! Gary here with a voice that's clear, engaging and perfect for TikTok!",
    "ai3-Jason": "This is Jason. My voice works great for tutorials and how-to content!",
    "ai3-Ryan": "Hey, Ryan here! My voice has that professional yet friendly tone you're looking for!",
    "ai3-Emily": "Hi! I'm Emily and my voice has that perfect mix of energy and clarity for your videos!",
    
    // ProPlus specific voices
    "proplus-Richard": "Hello, I'm Richard! My voice adds a confident, professional tone to your content.",
    "proplus-Ethan": "Hey! Ethan here. My voice is crisp and clear - perfect for educational content!",
    "proplus-Blaze": "THIS IS BLAZE! MY ULTRA ENERGETIC VOICE WILL MAKE YOUR CONTENT POP! 🔥",
    "proplus-Tyler": "Hey, Tyler here! My voice has that casual, relatable quality perfect for TikTok!",
    
    // Pro voices
    "pro1-Catherine": "Hello, I'm Catherine. My professional voice is perfect for business content.",
    "pro1-Ethan": "Hi, this is Ethan. My clear voice works well for tutorials and guides.",
    "ai2-Richard": "Richard here. My voice has a professional tone that's great for business content."
  };

  return previewTexts[voiceId] || 
    "This is a preview of how this voice sounds. Perfect for your TikTok content!";
}

/**
 * Get the best voice recommendations for TikTok content
 */
export function getTikTokRecommendedVoices(): string[] {
  return [
    // Top recommended for TikTok (confirmed working)
    "ai3-Jenny",     // Female, high energy
    "ai3-Gary",      // Male, high energy
  ];
}

export default {
  getVoices,
  generateSpeech,
  preloadAudio,
  hasApiKey,
  getVoicePreviewText,
  getTikTokRecommendedVoices,
  generateVoicePreview
};

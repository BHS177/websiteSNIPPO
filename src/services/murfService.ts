import { toast } from "sonner";

// Using environment variable for OpenAI API key
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface MurfVoice {
  id: string;
  name: string;
  language: string;
  accent: string;
  gender: string;
  previewUrl?: string;
}

export interface MurfSpeechOptions {
  text: string;
  voiceId: string;
  speed?: number; // 0.5 to 2.0, default 1.0
  pitch?: number; // -10 to 10, default 0
  emphasis?: "none" | "moderate" | "strong"; // default "none"
  format?: "mp3" | "wav"; // default "mp3"
}

// OpenAI voice options (mapped to maintain compatibility)
const OPENAI_VOICES: MurfVoice[] = [
  { id: "alloy", name: "Alloy", language: "English", accent: "US", gender: "Neutral", previewUrl: "https://cdn.openai.com/API/docs/audio/alloy.wav" },
  { id: "echo", name: "Echo", language: "English", accent: "US", gender: "Male", previewUrl: "https://cdn.openai.com/API/docs/audio/echo.wav" },
  { id: "fable", name: "Fable", language: "English", accent: "US", gender: "Male", previewUrl: "https://cdn.openai.com/API/docs/audio/fable.wav" },
  { id: "onyx", name: "Onyx", language: "English", accent: "US", gender: "Male", previewUrl: "https://cdn.openai.com/API/docs/audio/onyx.wav" },
  { id: "nova", name: "Nova", language: "English", accent: "US", gender: "Female", previewUrl: "https://cdn.openai.com/API/docs/audio/nova.wav" },
  { id: "shimmer", name: "Shimmer", language: "English", accent: "US", gender: "Female", previewUrl: "https://cdn.openai.com/API/docs/audio/shimmer.wav" },
];

// Valid OpenAI voice IDs array (for validation)
const VALID_OPENAI_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer", "ash", "sage", "coral"];

/**
 * Get voices from OpenAI (replacing Murf voices)
 */
export const getVoices = async (): Promise<MurfVoice[]> => {
  try {
    // Return the predefined OpenAI voice list
    return OPENAI_VOICES;
  } catch (error) {
    console.error("Error fetching voices:", error);
    toast.error("Failed to fetch voice options");
    return OPENAI_VOICES; // Return predefined list as fallback
  }
};

/**
 * Generate speech from text using OpenAI TTS API
 */
export const generateSpeech = async (options: MurfSpeechOptions): Promise<string> => {
  try {
    console.log("Generating OpenAI TTS with options:", options);
    
    // Clean the text input - remove emojis and other problematic characters
    const cleanText = options.text
      .replace(/[^\p{L}\p{N}\p{P}\s]/gu, '') // Remove emojis and special characters
      .replace(/"/g, '') // Remove quotation marks
      .trim();
    
    if (!cleanText) {
      console.warn("Text is empty after cleaning, skipping TTS generation");
      throw new Error("Empty text after cleaning");
    }
    
    // Map speech options to OpenAI format and validate the voice ID
    let voice = options.voiceId || "alloy"; // Default to alloy if not specified
    
    // Validate the voice ID against the allowed OpenAI voices
    if (!VALID_OPENAI_VOICES.includes(voice)) {
      console.warn(`Invalid OpenAI voice ID: ${voice}, defaulting to 'alloy'`);
      voice = "alloy"; // Default to a valid voice
    }
    
    const model = "tts-1"; // Use OpenAI's standard TTS model
    
    console.log(`Using OpenAI voice: ${voice} for text: "${cleanText}"`);
    
    // Make API request to OpenAI using fetch
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        voice: voice,
        input: cleanText,
        speed: options.speed || 1.0,
        response_format: options.format || "mp3"
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("OpenAI TTS API error response:", errorData || response.statusText);
      console.error("Status:", response.status, response.statusText);
      throw new Error(`OpenAI TTS API error: ${response.status} ${response.statusText}`);
    }
    
    // Get the audio data as blob and create URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log("Successfully generated audio with OpenAI TTS API");
    return audioUrl;
  } catch (error) {
    console.error("Error generating speech with OpenAI:", error);
    toast.error("Failed to generate voice-over", {
      description: "There was an error generating the voice-over. Please try again."
    });
    throw error;
  }
};

/**
 * Preload audio by starting to load it but not playing it
 */
export const preloadAudio = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
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
  return !!OPENAI_API_KEY;
};

export default {
  getVoices,
  generateSpeech,
  preloadAudio,
  hasApiKey,
  OPENAI_VOICES
};

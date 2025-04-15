
import { ElevenLabsVoice } from "@/types/video";

// Define API endpoint constants
const API_BASE_URL = "https://api.elevenlabs.io/v1";

// Define the interface for TTS request params
interface TTSRequestParams {
  text: string;
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

/**
 * ElevenLabs TTS service
 * This service handles communication with the ElevenLabs API for text-to-speech
 */
export class ElevenLabsService {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  /**
   * Set the API key for ElevenLabs
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    // Save to localStorage for persistence
    localStorage.setItem('elevenLabsApiKey', apiKey);
    return this;
  }

  /**
   * Get the API key - will attempt to load from localStorage if not set
   */
  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('elevenLabsApiKey');
    }
    return this.apiKey;
  }

  /**
   * Clear the stored API key
   */
  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('elevenLabsApiKey');
  }

  /**
   * Check if the API key is set
   */
  hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        throw new Error("API key not set");
      }

      const response = await fetch(`${API_BASE_URL}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching voices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error("Failed to fetch voices:", error);
      throw error;
    }
  }

  /**
   * Generate speech from text using ElevenLabs API
   */
  async textToSpeech(params: TTSRequestParams): Promise<Blob> {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        throw new Error("API key not set");
      }

      const { text, voiceId, modelId = "eleven_multilingual_v2", stability = 0.5, similarityBoost = 0.75 } = params;

      const response = await fetch(`${API_BASE_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error generating speech: ${response.status} ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Failed to generate speech:", error);
      throw error;
    }
  }

  /**
   * Create a playable audio URL from a text
   */
  async createAudioUrl(params: TTSRequestParams): Promise<string> {
    try {
      const audioBlob = await this.textToSpeech(params);
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error("Failed to create audio URL:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const elevenLabsService = new ElevenLabsService();

// Default export for flexibility
export default elevenLabsService;


import { useState, useEffect } from 'react';
import { generateClipCaption } from '@/services/openaiService';
import { toast } from 'sonner';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MediaChat {
  mediaId: number;
  messages: ChatMessage[];
  description?: string;
  generatedCaption?: string;
}

const useMediaChat = () => {
  const [mediaChats, setMediaChats] = useState<Record<number, MediaChat>>({});
  
  // Load saved chats from localStorage on mount
  useEffect(() => {
    try {
      const savedMediaChats = localStorage.getItem('mediaChats');
      if (savedMediaChats) {
        setMediaChats(JSON.parse(savedMediaChats));
      }
      
      // Also check for media clips and ensure a chat exists for each
      const mediaClips = localStorage.getItem('mediaClips');
      if (mediaClips) {
        const clips = JSON.parse(mediaClips);
        if (Array.isArray(clips)) {
          const chatUpdates: Record<number, MediaChat> = { ...mediaChats };
          
          clips.forEach(clip => {
            if (clip.id && !chatUpdates[clip.id]) {
              chatUpdates[clip.id] = {
                mediaId: clip.id,
                messages: [
                  {
                    role: 'assistant',
                    content: "Hi! Describe what's in this clip and I'll create a unique TikTok caption for it.",
                    timestamp: new Date()
                  }
                ]
              };
            }
          });
          
          if (Object.keys(chatUpdates).length > Object.keys(mediaChats).length) {
            setMediaChats(chatUpdates);
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved media chats:", error);
    }
  }, []);
  
  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(mediaChats).length > 0) {
      localStorage.setItem('mediaChats', JSON.stringify(mediaChats));
    }
  }, [mediaChats]);
  
  // Create a new chat for a media item
  const createMediaChat = (mediaId: number) => {
    if (mediaChats[mediaId]) return;
    
    setMediaChats(prev => ({
      ...prev,
      [mediaId]: {
        mediaId,
        messages: [
          {
            role: 'assistant',
            content: "Hi! Describe what's in this clip and I'll create a unique TikTok caption for it.",
            timestamp: new Date()
          }
        ]
      }
    }));
    
    // Also update the mediaClips in localStorage to ensure sync
    try {
      const mediaClips = localStorage.getItem('mediaClips');
      let clips = [];
      
      if (mediaClips) {
        clips = JSON.parse(mediaClips);
      }
      
      // Check if this mediaId already exists
      const exists = clips.some((clip: any) => clip.id === mediaId);
      
      if (!exists) {
        clips.push({ id: mediaId, name: `Clip ${mediaId}`, type: 'unknown' });
        localStorage.setItem('mediaClips', JSON.stringify(clips));
      }
    } catch (error) {
      console.error("Error updating mediaClips:", error);
    }
  };
  
  // Get chat for a specific media ID
  const getMediaChat = (mediaId: number): MediaChat | undefined => {
    return mediaChats[mediaId];
  };
  
  // Add a message to a specific media chat
  const addMessageToMediaChat = (mediaId: number, message: ChatMessage) => {
    setMediaChats(prev => {
      const mediaChat = prev[mediaId] || {
        mediaId,
        messages: []
      };
      
      return {
        ...prev,
        [mediaId]: {
          ...mediaChat,
          messages: [...mediaChat.messages, message]
        }
      };
    });
  };
  
  // Save description for a specific media
  const saveMediaDescription = (mediaId: number, description: string) => {
    setMediaChats(prev => {
      const mediaChat = prev[mediaId] || {
        mediaId,
        messages: []
      };
      
      return {
        ...prev,
        [mediaId]: {
          ...mediaChat,
          description
        }
      };
    });
  };

  // Save generated caption for a specific media
  const saveGeneratedCaption = (mediaId: number, caption: string) => {
    // Skip if this is the default welcome message
    if (caption === "Hi! Describe what's in this clip and I'll create a unique TikTok caption for it." ||
        caption === "👋 Tell me about this specific media clip! I'll create a unique caption for it that matches its content.") {
      return;
    }
    
    setMediaChats(prev => {
      const mediaChat = prev[mediaId] || {
        mediaId,
        messages: []
      };
      
      return {
        ...prev,
        [mediaId]: {
          ...mediaChat,
          generatedCaption: caption
        }
      };
    });
    
    // Also store in generatedCaptions in localStorage for easy access across components
    try {
      const generatedCaptions = JSON.parse(localStorage.getItem('generatedCaptions') || '{}');
      generatedCaptions[mediaId] = caption;
      localStorage.setItem('generatedCaptions', JSON.stringify(generatedCaptions));
      
      // Set flag that we have new AI content
      localStorage.setItem('hasNewAiCaptions', 'true');
      console.log(`Saved caption for media ${mediaId}: ${caption}`);
    } catch (error) {
      console.error("Error saving generated caption:", error);
    }
  };
  
  // Extract and save caption from assistant message
  const extractCaptionFromMessages = (mediaId: number): string | null => {
    const chat = mediaChats[mediaId];
    if (!chat || !chat.messages || chat.messages.length <= 1) {
      // If chat doesn't exist or only has the welcome message, try to get from localStorage
      try {
        const generatedCaptions = JSON.parse(localStorage.getItem('generatedCaptions') || '{}');
        if (generatedCaptions[mediaId]) {
          return generatedCaptions[mediaId];
        }
      } catch (error) {
        console.error("Error loading generated captions:", error);
      }
      return null;
    }
    
    // First check if we already have a saved generated caption
    if (chat.generatedCaption) {
      return chat.generatedCaption;
    }
    
    // Find the most relevant assistant message
    const messages = chat.messages;
    let lastUserMessage = null;
    let responseMessages = [];
    
    // First find all user messages and their corresponding assistant responses
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user') {
        lastUserMessage = messages[i];
      } else if (lastUserMessage && messages[i].role === 'assistant' && 
                !messages[i].content.includes("Hi! Describe what's in this clip") &&
                !messages[i].content.includes("Tell me about this specific media clip")) {
        responseMessages.push({
          userPrompt: lastUserMessage.content,
          assistantResponse: messages[i].content,
          index: i
        });
        lastUserMessage = null; // Reset so we find the next pair
      }
    }
    
    // Sort responses by index to get the most recent ones first
    responseMessages.sort((a, b) => b.index - a.index);
    
    // Try to extract from the most recent response first
    if (responseMessages.length > 0) {
      for (const response of responseMessages) {
        // Check for quotes which often contain the actual caption
        const quoteMatch = response.assistantResponse.match(/"([^"]+)"/);
        if (quoteMatch && quoteMatch[1]) {
          const extractedCaption = quoteMatch[1];
          saveGeneratedCaption(mediaId, extractedCaption);
          return extractedCaption;
        }
        
        // If no quotes found but the response isn't the welcome message,
        // use the full response as the caption
        if (!response.assistantResponse.includes("Describe what's in this clip") &&
            !response.assistantResponse.includes("Tell me about this specific media clip")) {
          saveGeneratedCaption(mediaId, response.assistantResponse);
          return response.assistantResponse;
        }
      }
    }
    
    // As a last resort, just use the last assistant message if it's not the welcome message
    const assistantMessages = messages.filter(m => 
      m.role === 'assistant' && 
      !m.content.includes("Hi! Describe what's in this clip") &&
      !m.content.includes("Tell me about this specific media clip")
    );
    
    if (assistantMessages.length > 0) {
      const lastContent = assistantMessages[assistantMessages.length - 1].content;
      saveGeneratedCaption(mediaId, lastContent);
      return lastContent;
    }
    
    return null;
  };
  
  // Generate AI response for a specific media using OpenAI
  const generateResponseForMedia = async (mediaId: number, prompt: string) => {
    const mediaChat = mediaChats[mediaId];
    if (!mediaChat) return null;
    
    try {
      console.log(`Generating AI response for media ID ${mediaId} with prompt: ${prompt}`);
      
      // Get information about this media if available
      let clipContext = "";
      try {
        const mediaClips = localStorage.getItem('mediaClips');
        if (mediaClips) {
          const clips = JSON.parse(mediaClips);
          const clip = clips.find((c: any) => c.id === mediaId);
          if (clip) {
            clipContext = `This is a clip named "${clip.name}" of type "${clip.type || 'unknown'}".`;
          }
        }
      } catch (error) {
        console.error("Error getting clip context:", error);
      }
      
      // Add the global description context if available
      const globalDescription = localStorage.getItem('productDescription') || '';
      if (globalDescription) {
        clipContext += ` The overall video is about: ${globalDescription}`;
      }
      
      // Generate the response using OpenAI
      const aiResponse = await generateClipCaption(mediaId, prompt, clipContext);
      console.log("AI response:", aiResponse);
      
      if (!aiResponse) {
        console.error("Failed to get a valid response from OpenAI");
        toast.error("AI service connection failed", {
          description: "Please try again in a moment"
        });
        
        // Add error message to chat
        addMessageToMediaChat(mediaId, {
          role: 'assistant',
          content: "I'm having trouble generating a response right now. Please try again in a moment.",
          timestamp: new Date()
        });
        
        return null;
      }
      
      // Add AI response to the chat
      addMessageToMediaChat(mediaId, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });
      
      // Extract a caption suggestion from the response if possible
      const captionMatch = aiResponse.match(/"([^"]+)"/);
      let extractedCaption = aiResponse;
      
      if (captionMatch && captionMatch[1]) {
        extractedCaption = captionMatch[1];
      }
      
      // Save the generated caption
      saveGeneratedCaption(mediaId, extractedCaption);
      
      return extractedCaption;
      
    } catch (error) {
      console.error("Error generating AI response:", error);
      
      // Add a fallback response in case of error
      addMessageToMediaChat(mediaId, {
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please try again in a moment.",
        timestamp: new Date()
      });
      
      toast.error("Failed to generate AI response", {
        description: "Check console for error details"
      });
      
      return null;
    }
  };

  // Get all generated captions from both chat messages and localStorage
  const getAllGeneratedCaptions = (): Record<number, string> => {
    try {
      const captionsFromChats: Record<number, string> = {};
      
      // First extract captions from chat messages
      Object.entries(mediaChats).forEach(([mediaIdStr, chat]) => {
        const mediaId = parseInt(mediaIdStr);
        
        // First check if there's a stored generatedCaption
        if (chat.generatedCaption) {
          captionsFromChats[mediaId] = chat.generatedCaption;
        } else {
          // Otherwise extract from messages
          const extractedCaption = extractCaptionFromMessages(mediaId);
          if (extractedCaption) {
            captionsFromChats[mediaId] = extractedCaption;
          }
        }
      });
      
      // Also check localStorage for previously saved captions
      const savedCaptions = localStorage.getItem('generatedCaptions');
      let loadedCaptions: Record<number, string> = {};
      
      if (savedCaptions) {
        loadedCaptions = JSON.parse(savedCaptions);
      }
      
      // Merge both sources, prioritizing chat-extracted captions
      const combinedCaptions = { ...loadedCaptions, ...captionsFromChats };
      
      // Filter out any default welcome messages
      Object.keys(combinedCaptions).forEach(key => {
        const caption = combinedCaptions[Number(key)];
        if (caption === "Hi! Describe what's in this clip and I'll create a unique TikTok caption for it." ||
            caption === "👋 Tell me about this specific media clip! I'll create a unique caption for it that matches its content.") {
          delete combinedCaptions[Number(key)];
        }
      });
      
      // Save the combined captions back to localStorage
      localStorage.setItem('generatedCaptions', JSON.stringify(combinedCaptions));
      
      return combinedCaptions;
    } catch (error) {
      console.error("Error processing captions:", error);
      return {};
    }
  };
  
  return {
    mediaChats,
    createMediaChat,
    getMediaChat,
    addMessageToMediaChat,
    saveMediaDescription,
    saveGeneratedCaption,
    generateResponseForMedia,
    getAllGeneratedCaptions,
    extractCaptionFromMessages
  };
};

export default useMediaChat;

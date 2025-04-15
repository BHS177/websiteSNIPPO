
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useMediaChat from '@/hooks/use-media-chat';

interface MediaChatBoxProps {
  mediaId: number;
  onCaptionGenerated?: (caption: string) => void;
}

const MediaChatBox: React.FC<MediaChatBoxProps> = ({ mediaId, onCaptionGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    getMediaChat, 
    createMediaChat,
    saveGeneratedCaption
  } = useMediaChat();

  // Ensure chat exists for this media
  useEffect(() => {
    createMediaChat(mediaId);
    
    // Add this clip to the total count in localStorage
    try {
      const existingMediaClips = JSON.parse(localStorage.getItem('mediaClips') || '[]');
      // Add this clip if not already present
      if (!existingMediaClips.some((clip: any) => clip.id === mediaId)) {
        existingMediaClips.push({ id: mediaId, type: 'media' });
        localStorage.setItem('mediaClips', JSON.stringify(existingMediaClips));
        
        // Update the actual clip count
        localStorage.setItem('actualClipCount', existingMediaClips.length.toString());
      }
    } catch (error) {
      console.error("Error updating media clips in localStorage:", error);
    }
  }, [mediaId, createMediaChat]);

  const mediaChat = getMediaChat(mediaId);

  // Check for existing generated captions
  useEffect(() => {
    const checkExistingCaptions = () => {
      try {
        // Check localStorage for existing captions
        const savedCaptions = localStorage.getItem('generatedCaptions');
        if (savedCaptions) {
          const captions = JSON.parse(savedCaptions);
          if (captions[mediaId]) {
            onCaptionGenerated?.(captions[mediaId]);
            console.log(`Applied caption from localStorage for clip ${mediaId}: ${captions[mediaId].substring(0, 50)}...`);
          }
        }

        // Check chat history
        const chatHistories = localStorage.getItem('mediaChats');
        if (chatHistories) {
          const chats = JSON.parse(chatHistories);
          if (chats[mediaId]?.generatedCaption) {
            onCaptionGenerated?.(chats[mediaId].generatedCaption);
            console.log(`Applied caption from chat history for clip ${mediaId}: ${chats[mediaId].generatedCaption.substring(0, 50)}...`);
          }
        }
      } catch (error) {
        console.error("Error checking existing captions:", error);
      }
    };

    checkExistingCaptions();
    
    // Also set up an interval to periodically check for new captions (in case they're added while this component is mounted)
    const captionCheckInterval = setInterval(checkExistingCaptions, 2000);
    
    return () => {
      clearInterval(captionCheckInterval);
    };
  }, [mediaId, onCaptionGenerated]);

  // Auto-apply global captions when available
  useEffect(() => {
    const handleGlobalCaptionsAvailable = () => {
      try {
        console.log(`Handling global captions event for clip ${mediaId}`);
        const captions = JSON.parse(localStorage.getItem('generatedCaptions') || '{}');
        if (captions[mediaId]) {
          console.log(`Found caption for clip ${mediaId}:`, captions[mediaId].substring(0, 50));
          onCaptionGenerated?.(captions[mediaId]);
          saveGeneratedCaption(mediaId, captions[mediaId]);
        } else {
          console.log(`No caption found for clip ${mediaId} in generatedCaptions`);
          
          // Try to find a caption by position (index)
          const mediaClips = JSON.parse(localStorage.getItem('mediaClips') || '[]');
          const clipIndex = mediaClips.findIndex((clip: any) => clip.id === mediaId);
          
          if (clipIndex !== -1 && captions[clipIndex + 1]) {
            console.log(`Found caption by position ${clipIndex + 1}:`, captions[clipIndex + 1].substring(0, 50));
            onCaptionGenerated?.(captions[clipIndex + 1]);
            saveGeneratedCaption(mediaId, captions[clipIndex + 1]);
          }
        }
      } catch (error) {
        console.error("Error applying global captions:", error);
      }
    };
    
    window.addEventListener('chatgpt-captions-extracted', handleGlobalCaptionsAvailable);
    
    // Also check if there are captions to apply on mount
    if (localStorage.getItem('hasNewAiCaptions') === 'true') {
      handleGlobalCaptionsAvailable();
    }
    
    return () => {
      window.removeEventListener('chatgpt-captions-extracted', handleGlobalCaptionsAvailable);
    };
  }, [mediaId, onCaptionGenerated, saveGeneratedCaption]);

  return null; // No UI rendered as per user request to remove the caption assistant
};

export default MediaChatBox;

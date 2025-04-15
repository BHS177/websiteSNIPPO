import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Video, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { VideoClip } from '@/types/video';
import useMediaChat from '@/hooks/use-media-chat';
import { toast } from 'sonner';

export interface VideoUploaderProps {
  nextId?: number;
  onUpload?: (newClip: VideoClip) => void;
  className?: string;
}

const VideoUploader = ({ nextId = 1, onUpload, className = '' }: VideoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createMediaChat } = useMediaChat();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      // Clear existing captions from localStorage
      localStorage.removeItem('generatedCaptions');
      localStorage.removeItem('hasNewAiCaptions');
      
      // Process each uploaded file in order
      acceptedFiles.forEach((file, index) => {
        const clipId = nextId + index;
        const isVideo = file.type.startsWith('video/');
        const newClip: VideoClip = {
          id: clipId,
          name: file.name,
          duration: isVideo ? 5 : 3, // Default duration
          type: isVideo ? 'video' : 'image',
          url: URL.createObjectURL(file),
          mimeType: file.type,
          file,
          sequence: Number.MAX_SAFE_INTEGER - (acceptedFiles.length - index), // Ensure new clips go to the end
          validationStatus: 'validating'
        };

        // Create a unique chat context for this media
        createMediaChat(clipId);
        
        if (onUpload) {
          onUpload(newClip);
        }
      });
      
      // Notify that media was uploaded
      const mediaPluralText = acceptedFiles.length > 1 ? 'media files' : 'media file';
      toast.success(`${acceptedFiles.length} ${mediaPluralText} uploaded successfully`);
      
      // Automatically scroll to the TikTok Caption AI section
      setTimeout(() => {
        const descriptionForm = document.getElementById('tikTokCaptionAI');
        if (descriptionForm) {
          descriptionForm.scrollIntoView({ behavior: 'smooth' });
          
          // Open all the media chat boxes
          document.querySelectorAll('.media-chat-toggle-button').forEach((button) => {
            const buttonElement = button as HTMLButtonElement;
            if (buttonElement.textContent?.includes('Chat')) {
              buttonElement.click();
            }
          });
          
          // Focus on the first chat input after a short delay
          setTimeout(() => {
            const firstChatInput = document.querySelector('.media-chat-input') as HTMLTextAreaElement;
            if (firstChatInput) {
              firstChatInput.focus();
              firstChatInput.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50');
              setTimeout(() => {
                firstChatInput.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50');
              }, 2000);
            }
          }, 800);
        }
      }, 300);
    },
    [nextId, onUpload, createMediaChat]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
  });

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
        } hover:border-primary/50 hover:bg-primary/5 cursor-pointer`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex space-x-2">
            <Video className="h-8 w-8 text-muted-foreground" />
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Drag & drop video or image files here
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: MP4, WebM, MOV, PNG, JPG, GIF
            </p>
            <p className="text-xs text-purple-400">
              Each media will get its own unique AI assistant!
            </p>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleFileInputClick}>
            <Upload className="h-4 w-4 mr-2" />
            Select Files
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;

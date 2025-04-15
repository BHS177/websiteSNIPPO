import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { VideoClip, TextOverlay } from '@/types/video';
import VideoThumbnail from '../VideoThumbnail';
import { Input } from '../ui/input';
import MediaChatBox from './MediaChatBox';

interface SegmentCardProps {
  segment: VideoClip;
  captions?: Record<number, string>;
  captionPositions?: Record<number, TextOverlay['position']>;
  onRemove: (id: number) => void;
  onUpdateClip: (id: number, field: keyof VideoClip, value: any) => void;
  onCaptionChange?: (id: number, caption: string) => void;
  onPositionChange?: (id: number, position: TextOverlay['position']) => void;
}

const purpleTextStyle = {
  color: '#8B5CF6',
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), -2px -2px 4px rgba(0, 0, 0, 0.8), 2px -2px 4px rgba(0, 0, 0, 0.8), -2px 2px 4px rgba(0, 0, 0, 0.8)'
};

const formatLongText = (text: string): JSX.Element => {
  if (!text) return <></>;
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  const maxChars = 18;
  
  words.forEach(word => {
    if ((currentLine + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  if (lines.length <= 1 && text.length <= maxChars) {
    return <>{text}</>;
  }
  
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))}
    </>
  );
};

const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  captions = {},
  captionPositions = {},
  onRemove,
  onUpdateClip,
  onCaptionChange,
  onPositionChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(captions[segment.id] || '');
  
  const position: TextOverlay['position'] = 'center';
  
  const renderCaptionWithHighlights = (text: string) => {
    if (!text) return null;
    
    text = text.replace(/#+\s*$/g, '').trim();
    text = text.replace(/\*+\s*$/g, '').trim();
    
    if (text.includes('<span class="highlight-green">')) {
      const parts = [];
      let lastIndex = 0;
      let match;
      
      const regex = /<span class="highlight-green">([^<]+)<\/span>/g;
      
      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(formatLongText(text.substring(lastIndex, match.index)));
        }
        
        parts.push(
          <span key={match.index} style={purpleTextStyle}>{formatLongText(match[1])}</span>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < text.length) {
        parts.push(formatLongText(text.substring(lastIndex)));
      }
      
      return <>{parts}</>;
    }
    
    if (text.includes('*')) {
      const parts = [];
      let currentText = '';
      let isHighlighted = false;
      
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '*') {
          if (currentText) {
            parts.push(isHighlighted ? 
              <span key={i} style={purpleTextStyle}>{formatLongText(currentText)}</span> : 
              formatLongText(currentText)
            );
            currentText = '';
          }
          isHighlighted = !isHighlighted;
        } else {
          currentText += text[i];
        }
      }
      
      if (currentText) {
        parts.push(isHighlighted ? 
          <span key="last" style={purpleTextStyle}>{formatLongText(currentText)}</span> : 
          formatLongText(currentText)
        );
      }
      
      return <>{parts}</>;
    }
    
    return formatLongText(text);
  };
  
  const handleSave = () => {
    if (onCaptionChange) {
      onCaptionChange(segment.id, caption);
    }
    
    if (onPositionChange) {
      onPositionChange(segment.id, 'center');
    }
    
    setIsEditing(false);
  };
  
  const handleCaptionGenerated = (generatedCaption: string) => {
    setCaption(generatedCaption);
    if (onCaptionChange) {
      onCaptionChange(segment.id, generatedCaption);
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-700/50 bg-black/40 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:border-indigo-500/30">
      <div className="relative">
        <VideoThumbnail
          clip={segment}
          aspectRatio="16:9"
          className="w-full h-[150px] object-cover"
        />
        
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
          Segment
        </div>
        
        {caption && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 caption-container">
            <div className="caption-text">
              {renderCaptionWithHighlights(caption)}
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium truncate" title={segment.name}>
            {segment.name}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
            onClick={() => onRemove(segment.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <div className="space-y-1">
              <label htmlFor={`caption-${segment.id}`} className="text-xs text-gray-400">
                Caption
              </label>
              <Input
                id={`caption-${segment.id}`}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="h-8 text-xs bg-black/50 border-indigo-500/30"
                placeholder="Add caption..."
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                className="text-xs"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">Caption:</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="bg-black/30 rounded p-2 min-h-[40px] text-xs">
              {caption ? (
                <div className="break-words">
                  {renderCaptionWithHighlights(caption)}
                </div>
              ) : (
                "No caption added yet. Chat with the AI below to generate one."
              )}
            </div>
            
            {caption && (
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Position: Center</span>
              </div>
            )}
          </div>
        )}
        
        <MediaChatBox 
          mediaId={segment.id} 
          onCaptionGenerated={handleCaptionGenerated} 
        />
      </CardContent>
    </Card>
  );
};

export default SegmentCard;

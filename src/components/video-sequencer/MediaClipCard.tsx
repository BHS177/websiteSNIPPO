import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Edit } from "lucide-react";
import { VideoClip, TextOverlay } from '@/types/video';
import VideoThumbnail from '../VideoThumbnail';
import { Input } from '../ui/input';
import { toast } from 'sonner';

const purpleTextStyle = {
  color: '#8B5CF6',
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), -2px -2px 4px rgba(0, 0, 0, 0.8), 2px -2px 4px rgba(0, 0, 0, 0.8), -2px 2px 4px rgba(0, 0, 0, 0.8)'
};

const formatLongText = (text: string): JSX.Element => {
  text = text ? text.replace(/\s*AM\s*/g, '') : '';
  
  if (text.length > 20) {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length > 20) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
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
  }
  
  return <>{text}</>;
};

interface MediaClipCardProps {
  clip: VideoClip;
  index: number;
  totalClips: number;
  resequenceMode?: boolean;
  captions?: Record<number, string>;
  captionPositions?: Record<number, TextOverlay['position']>;
  onRemove: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onUpdateClip: (id: number, field: keyof VideoClip, value: any) => void;
  onCaptionChange?: (id: number, caption: string) => void;
  onPositionChange?: (id: number, position: TextOverlay['position']) => void;
}

const MediaClipCard: React.FC<MediaClipCardProps> = ({
  clip,
  index,
  totalClips,
  resequenceMode = false,
  captions = {},
  captionPositions = {},
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdateClip,
  onCaptionChange,
  onPositionChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(captions[clip.id] || '');
  
  const position: TextOverlay['position'] = 'center';
  
  const renderCaptionWithHighlights = (text: string) => {
    if (!text) return null;
    
    text = text.replace(/\s*AM\s*/g, '');
    
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
  
  useEffect(() => {
    const checkForNewCaptions = () => {
      try {
        const hasNewCaptions = localStorage.getItem('hasNewAiCaptions') === 'true';
        
        if (hasNewCaptions) {
          if (index === 0) {
            const firstClipCaption = localStorage.getItem('firstClipCaption');
            if (firstClipCaption && firstClipCaption.trim()) {
              console.log(`Applying first clip caption from dedicated storage: "${firstClipCaption}"`);
              const cleanedCaption = firstClipCaption.replace(/\s*AM\s*/g, '');
              setCaption(cleanedCaption);
              
              if (onCaptionChange) {
                onCaptionChange(clip.id, cleanedCaption);
              }
              
              if (onPositionChange) {
                onPositionChange(clip.id, 'center');
              }
              
              onUpdateClip(clip.id, 'textOverlay', {
                text: cleanedCaption,
                position: 'center' as TextOverlay['position'],
                style: {
                  id: 'default-style',
                  name: 'Default Style',
                  fontFamily: 'Montserrat, Poppins, Open Sans, Arial',
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  padding: 10,
                  borderRadius: 4,
                  background: 'rgba(0,0,0,0.5)',
                  margin: 0
                }
              });
              
              return;
            }
          }
          
          const savedCaptions = localStorage.getItem('generatedCaptions');
          if (savedCaptions) {
            const parsedCaptions = JSON.parse(savedCaptions);
            
            // First try to get caption by clip ID (preferred)
            let newCaption = parsedCaptions[clip.id];
            
            // Only if no caption found by ID and we're using sequence-based captions,
            // try to get by sequence number
            if (!newCaption && localStorage.getItem('usingSequenceCaptions') === 'true') {
              const clipNumber = index + 1;
              newCaption = parsedCaptions[clipNumber];
            }
            
            if (newCaption) {
              newCaption = newCaption.replace(/\s*AM\s*/g, '');
              
              if (newCaption !== caption) {
                console.log(`Applying caption to clip ${clip.id} (position ${index + 1}): "${newCaption}"`);
                setCaption(newCaption);
                
                if (onCaptionChange) {
                  onCaptionChange(clip.id, newCaption);
                }
                
                if (onPositionChange) {
                  onPositionChange(clip.id, 'center');
                }
                
                onUpdateClip(clip.id, 'textOverlay', {
                  text: newCaption,
                  position: 'center' as TextOverlay['position'],
                  style: {
                    id: 'default-style',
                    name: 'Default Style',
                    fontFamily: 'Montserrat, Poppins, Open Sans, Arial',
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    padding: 10,
                    borderRadius: 4,
                    background: 'rgba(0,0,0,0.5)',
                    margin: 0
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking for new captions:", error);
      }
    };
    
    checkForNewCaptions();
    const interval = setInterval(checkForNewCaptions, 1000);
    
    return () => clearInterval(interval);
  }, [clip.id, index, caption, onCaptionChange, onPositionChange, onUpdateClip]);
  
  useEffect(() => {
    if (captions[clip.id] && captions[clip.id] !== caption) {
      setCaption(captions[clip.id]);
    }
  }, [captions, clip.id, caption]);
  
  const handleSave = () => {
    const cleanedCaption = caption.replace(/\s*AM\s*/g, '');
    const processedCaption = cleanedCaption.replace(/\*([^*]+)\*/g, '<span class="highlight-green">$1</span>');
    
    if (onCaptionChange) {
      onCaptionChange(clip.id, processedCaption);
    }
    
    if (onPositionChange) {
      onPositionChange(clip.id, 'center');
    }
    
    onUpdateClip(clip.id, 'textOverlay', {
      text: processedCaption,
      position: 'center' as TextOverlay['position'],
      style: {
        id: 'default-style',
        name: 'Default Style',
        fontFamily: 'Montserrat, Poppins, Open Sans, Arial',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: 10,
        borderRadius: 4,
        background: 'transparent',
        margin: 0
      }
    });
    
    try {
      const generatedCaptions = JSON.parse(localStorage.getItem('generatedCaptions') || '{}');
      generatedCaptions[clip.id] = processedCaption;
      localStorage.setItem('generatedCaptions', JSON.stringify(generatedCaptions));
    } catch (error) {
      console.error("Error saving caption to localStorage:", error);
    }
    
    toast.success("Caption saved for this clip");
    setIsEditing(false);
  };

  return (
    <Card 
      className="overflow-hidden border border-gray-700/50 bg-black/40 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:border-indigo-500/30 clip-card"
      data-clip-type={clip.type || 'unknown'}
      data-clip-id={clip.id}
      data-clip-index={index + 1}
    >
      <div className="relative">
        <VideoThumbnail
          clip={clip}
          aspectRatio="16:9"
          className="w-full h-[150px] object-cover"
        />
        
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
          {index + 1} of {totalClips}
        </div>
        
        {caption && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 caption-container">
            <div className="caption-text">
              {renderCaptionWithHighlights(caption)}
            </div>
          </div>
        )}
        
        {resequenceMode && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 bg-black/70 hover:bg-black/90"
              onClick={() => onMoveUp(clip.id)}
              disabled={index === 0}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 bg-black/70 hover:bg-black/90"
              onClick={() => onMoveDown(clip.id)}
              disabled={index === totalClips - 1}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium truncate" title={clip.name}>
            {clip.name}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
            onClick={() => onRemove(clip.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <div className="space-y-1">
              <label htmlFor={`caption-${clip.id}`} className="text-xs text-gray-400">
                Caption
              </label>
              <Input
                id={`caption-${clip.id}`}
                value={caption.replace(/<span class="highlight-green">([^<]+)<\/span>/g, '*$1*')}
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
                <div className="text-gray-500 italic">
                  No caption added yet
                </div>
              )}
            </div>
            
            {caption && (
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Position: Center</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaClipCard;

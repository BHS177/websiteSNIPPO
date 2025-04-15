import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Caption } from '@/types/video';
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";
import { formatTikTokStaggeredText } from '@/utils/videoTransitions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Style for highlighted purple text
const purpleTextStyle = {
  color: '#8B5CF6', // Using the vivid purple from the colors
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), -2px -2px 4px rgba(0, 0, 0, 0.8), 2px -2px 4px rgba(0, 0, 0, 0.8), -2px 2px 4px rgba(0, 0, 0, 0.8)'
};

// Function to format text with TikTok-style staggered lines
const formatTikTokDisplay = (text: string): JSX.Element => {
  if (!text) return <></>;
  
  const lines = formatTikTokStaggeredText(text);
  
  if (lines.length === 0) return <>{text}</>;
  
  return (
    <div className="tiktok-staggered-text">
      {lines.map((line, index) => {
        // First and last lines should be shorter than middle line
        const isLongLine = index === 1;
        const className = `line ${isLongLine ? 'line-long' : 'line-short'}`;
        
        return (
          <React.Fragment key={index}>
            <span className={className}>{line.toUpperCase()}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Function to render caption with highlighted text
const renderCaptionWithHighlights = (text: string) => {
  if (!text) return null;
  
  // Remove trailing hashes or asterisks
  text = text.replace(/#+\s*$/g, '').trim();
  text = text.replace(/\*+\s*$/g, '').trim();
  
  // Convert <span class="highlight-green"> syntax to JSX
  if (text.includes('<span class="highlight-green">')) {
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Use regex to find all highlighted parts
    const regex = /<span class="highlight-green">([^<]+)<\/span>/g;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(formatTikTokDisplay(text.substring(lastIndex, match.index)));
      }
      
      // Add the highlighted text
      parts.push(
        <span key={match.index} style={purpleTextStyle}>{formatTikTokDisplay(match[1])}</span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(formatTikTokDisplay(text.substring(lastIndex)));
    }
    
    return <>{parts}</>;
  }
  
  // Handle raw asterisks format if the span wasn't applied
  if (text.includes('*')) {
    const parts = [];
    let currentText = '';
    let isHighlighted = false;
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '*') {
        if (currentText) {
          parts.push(isHighlighted ? 
            <span key={i} style={purpleTextStyle}>{formatTikTokDisplay(currentText)}</span> : 
            formatTikTokDisplay(currentText)
          );
          currentText = '';
        }
        isHighlighted = !isHighlighted;
      } else {
        currentText += text[i];
      }
    }
    
    // Add any remaining text
    if (currentText) {
      parts.push(isHighlighted ? 
        <span key="last" style={purpleTextStyle}>{formatTikTokDisplay(currentText)}</span> : 
        formatTikTokDisplay(currentText)
      );
    }
    
    return <>{parts}</>;
  }
  
  // If no highlights found, just format with TikTok style
  return formatTikTokDisplay(text);
};

// Function to handle asterisks when manually entering text
const processTextWithAsterisks = (text: string): string => {
  // First remove any trailing hash marks or asterisks
  text = text.replace(/#+\s*$/g, '').trim();
  text = text.replace(/\*+\s*$/g, '').trim();
  
  // Replace pairs of asterisks with the highlight span
  return text.replace(/\*([^*]+)\*/g, '<span class="highlight-green">$1</span>');
};

interface CaptionEditorProps {
  captions: Caption[];
  onChange: (captions: Caption[]) => void;
  videoDuration: number;
}

const CaptionEditor: React.FC<CaptionEditorProps> = ({ captions, onChange, videoDuration }) => {
  const [newCaptionText, setNewCaptionText] = useState('');
  
  // Function to handle asterisks when manually entering text
  const processTextWithAsterisks = (text: string): string => {
    // First remove any trailing hash marks or asterisks
    text = text.replace(/#+\s*$/g, '').trim();
    text = text.replace(/\*+\s*$/g, '').trim();
    
    // Replace pairs of asterisks with the highlight span
    return text.replace(/\*([^*]+)\*/g, '<span class="highlight-green">$1</span>');
  };
  
  const addCaption = () => {
    if (!newCaptionText.trim()) return;
    
    // Process the new caption text to handle asterisks
    const processedText = processTextWithAsterisks(newCaptionText);
    
    const newCaption: Caption = {
      text: processedText,
      startTime: Math.max(0, captions.length > 0 ? captions[captions.length - 1].endTime + 0.5 : 0),
      endTime: Math.min(videoDuration, captions.length > 0 ? captions[captions.length - 1].endTime + 2.5 : 2),
      style: "standard"
    };
    
    onChange([...captions, newCaption]);
    setNewCaptionText('');
  };
  
  const removeCaption = (index: number) => {
    const newCaptions = [...captions];
    newCaptions.splice(index, 1);
    onChange(newCaptions);
  };
  
  const updateCaption = (index: number, field: keyof Caption, value: any) => {
    const newCaptions = [...captions];
    newCaptions[index] = { ...newCaptions[index], [field]: value };
    
    // Ensure start time is not after end time
    if (field === 'startTime') {
      newCaptions[index].startTime = Math.min(Number(value), newCaptions[index].endTime - 0.1);
    }
    // Ensure end time is not before start time
    if (field === 'endTime') {
      newCaptions[index].endTime = Math.max(Number(value), newCaptions[index].startTime + 0.1);
    }
    
    onChange(newCaptions);
  };
  
  const moveCaption = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === captions.length - 1)) {
      return;
    }
    
    const newCaptions = [...captions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap positions
    [newCaptions[index], newCaptions[targetIndex]] = 
      [newCaptions[targetIndex], newCaptions[index]];
    
    onChange(newCaptions);
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">TikTok Style Captions</h3>
      
      <div className="space-y-2">
        {captions.map((caption, index) => (
          <div key={index} className="flex flex-col space-y-2 p-3 border rounded-md bg-card">
            <div className="flex justify-between">
              <span className="font-medium">Caption {index + 1}</span>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => moveCaption(index, 'up')}
                  disabled={index === 0}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => moveCaption(index, 'down')}
                  disabled={index === captions.length - 1}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeCaption(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-sm text-muted-foreground mb-1">Preview:</div>
              <div className="caption-container inline-block">
                <div className="caption-text">
                  {renderCaptionWithHighlights(caption.text)}
                </div>
              </div>
            </div>
            
            <Textarea
              value={caption.text.replace(/<span class="highlight-green">([^<]+)<\/span>/g, '*$1*')}
              onChange={(e) => {
                const processedText = processTextWithAsterisks(e.target.value);
                updateCaption(index, 'text', processedText);
              }}
              placeholder="Caption text (use *asterisks* for highlighted text)"
              className="resize-none"
              rows={2}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-muted-foreground">Start Time (s)</label>
                <Input
                  type="number"
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  value={caption.startTime}
                  onChange={(e) => updateCaption(index, 'startTime', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">End Time (s)</label>
                <Input
                  type="number"
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  value={caption.endTime}
                  onChange={(e) => updateCaption(index, 'endTime', parseFloat(e.target.value))}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground">Animation Style</label>
              <Select
                value={caption.style}
                onValueChange={(value) => updateCaption(index, 'style', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="drop-shadow">Drop Shadow</SelectItem>
                  <SelectItem value="tiktok-style">TikTok Style</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Input
          value={newCaptionText}
          onChange={(e) => setNewCaptionText(e.target.value)}
          placeholder="Add a new caption (use *asterisks* for highlighted text)"
          onKeyDown={(e) => e.key === 'Enter' && addCaption()}
        />
        <Button onClick={addCaption} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground p-2 bg-muted/20 rounded-md">
        <p>💡 <strong>Tip:</strong> Use *asterisks* around words to highlight them in purple.</p>
        <p>💡 <strong>Tip:</strong> Captions will automatically be formatted in TikTok staggered style.</p>
      </div>
    </div>
  );
};

export default CaptionEditor;

import React, { useState } from 'react';
import { Caption } from '@/types/video';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlignCenter, 
  MessageSquarePlus, 
  Trash2, 
  Plus, 
  MoveUp,
  MoveDown,
  Copy,
  Clock,
  Sparkles
} from 'lucide-react';
import { sanitizeCaption } from '@/services/openaiIntegration';

interface TikTokCaptionEditorProps {
  captions: Caption[];
  onCaptionsChange: (captions: Caption[]) => void;
  videoDuration: number;
}

const TikTokCaptionEditor: React.FC<TikTokCaptionEditorProps> = ({
  captions,
  onCaptionsChange,
  videoDuration
}) => {
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState<number | null>(null);
  
  // Caption style options with emojis for TikTok feel
  const captionStyles = [
    { value: 'default', label: 'Default', emoji: '📝' },
    { value: 'hook', label: 'Hook (Intro)', emoji: '🔥' },
    { value: 'emphasis', label: 'Emphasis', emoji: '💯' },
    { value: 'highlight', label: 'Highlight', emoji: '✨' },
    { value: 'social', label: 'Social Proof', emoji: '👀' },
    { value: 'cta', label: 'Call to Action', emoji: '🔗' },
  ];
  
  // Animation options
  const animationOptions = [
    { value: 'bounce', label: 'Bounce' },
    { value: 'pop', label: 'Pop' },
    { value: 'shake', label: 'Shake' },
    { value: 'slide', label: 'Slide' },
    { value: 'wave', label: 'Wave' }
  ];
  
  // Template captions for quick insertion
  const captionTemplates = [
    { text: "Hey TikTok! 👋 You NEED to see this!", style: "hook", animation: "bounce" },
    { text: "Wait till you see this... 🤯", style: "hook", animation: "pop" },
    { text: "This is actually INSANE 🔥", style: "emphasis", animation: "shake" },
    { text: "I'm obsessed with this! 😍", style: "emphasis", animation: "pop" },
    { text: "Everyone's talking about this rn", style: "social", animation: "slide" },
    { text: "You won't believe the quality 💯", style: "highlight", animation: "wave" },
    { text: "Link in bio! 🔗 Selling FAST!", style: "cta", animation: "bounce" },
    { text: "Grab yours before they're gone! ⚡️", style: "cta", animation: "shake" }
  ];
  
  // Improved sanitize caption text to remove URLs, long IDs, and ChatGPT phrases
  const sanitizeCaptionText = (text: string): string => {
    if (!text) return "Check out this amazing product! 🔥";
    
    // First use the global sanitize function to remove AM/PM times
    let sanitized = sanitizeCaption(text);
    
    // Remove file IDs that match the pattern seen in screenshots
    sanitized = sanitized.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '');
    
    // Remove file names with extensions
    sanitized = sanitized.replace(/\b\w+\.(mp4|jpg|png|mov|gif|jpeg|webm|avi)\b/gi, '');
    
    // Remove URLs more aggressively
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '');
    sanitized = sanitized.replace(/www\.[^\s]+/g, '');
    
    // Remove alphanumeric strings longer than 15 characters (likely IDs)
    sanitized = sanitized.replace(/[a-zA-Z0-9]{15,}/g, '');
    
    // Remove hexadecimal-like strings (common in IDs)
    sanitized = sanitized.replace(/\b[a-f0-9]{6,}\b/gi, '');
    
    // Remove "is UNMATCHED" text that might come from file name parsing
    sanitized = sanitized.replace(/is UNMATCHED/g, 'is amazing');
    
    // Specifically target the patterns shown in the screenshot
    sanitized = sanitized.replace(/The \S+/g, 'This product');
    
    // ChatGPT phrases to remove
    const chatGptPhrases = [
      "Feel free to let me know",
      "Let me know if you need",
      "I hope this helps",
      "Is there anything else",
      "If you have any questions",
      "If you need any adjustments",
      "If you need more options",
      "Would you like me to",
      "Do you want me to"
    ];
    
    chatGptPhrases.forEach(phrase => {
      if (sanitized.includes(phrase)) {
        // Cut the text at the ChatGPT phrase
        sanitized = sanitized.split(phrase)[0].trim();
      }
    });
    
    // Clean up any double spaces or line breaks left after removal
    sanitized = sanitized.replace(/\s{2,}/g, ' ').trim();
    sanitized = sanitized.replace(/\n{2,}/g, '\n').trim();
    
    // If sanitizing made the caption empty or too short, replace with a default
    if (sanitized.length < 10) {
      return "Check out this amazing product! 🔥 #musthave #trending";
    }
    
    return sanitized;
  };
  
  // Function to check if a caption might contain unwanted content - improve detection
  const mightContainUnwantedContent = (text: string): boolean => {
    const chatGptPhrases = [
      "Feel free to let me know",
      "Let me know if you need",
      "I hope this helps",
      "Is there anything else",
      "If you have any questions",
      "If you need any adjustments",
      "If you need more options",
      "Would you like me to",
      "Do you want me to"
    ];
    
    return (
      text.includes('http') || 
      text.includes('.mp4') ||
      text.includes('.jpg') ||
      text.includes('.png') ||
      text.includes('is UNMATCHED') ||
      text.includes('AM') ||
      text.includes('PM') ||
      chatGptPhrases.some(phrase => text.includes(phrase)) ||
      /[a-zA-Z0-9]{15,}/.test(text) || 
      /[a-f0-9]{6,}/i.test(text) ||
      /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.test(text)
    );
  };
  
  const handleAddCaption = (template?: any) => {
    const newCaption: Caption = template || {
      text: "New Caption",
      startTime: 0,
      endTime: 2,
      style: "default",
      animation: "pop"
    };
    
    // Sanitize the caption text
    if (newCaption.text) {
      newCaption.text = sanitizeCaptionText(newCaption.text);
    }
    
    // Add time information if not in template
    if (!template || !template.startTime) {
      // Place new caption after the last one, or at the beginning
      const lastCaption = captions[captions.length - 1];
      newCaption.startTime = lastCaption ? lastCaption.endTime + 0.5 : 0;
      newCaption.endTime = Math.min(newCaption.startTime + 2, videoDuration);
    }
    
    const newCaptions = [...captions, newCaption];
    onCaptionsChange(newCaptions);
    setSelectedCaptionIndex(newCaptions.length - 1);
  };
  
  const handleDeleteCaption = (index: number) => {
    const newCaptions = captions.filter((_, i) => i !== index);
    onCaptionsChange(newCaptions);
    setSelectedCaptionIndex(null);
  };
  
  const handleCaptionChange = (index: number, field: keyof Caption, value: any) => {
    const newCaptions = [...captions];
    
    // If updating text, sanitize it
    if (field === 'text') {
      value = sanitizeCaptionText(value);
    }
    
    newCaptions[index] = { 
      ...newCaptions[index], 
      [field]: value 
    };
    
    // Make sure endTime is always after startTime
    if (field === 'startTime' && newCaptions[index].endTime <= value) {
      newCaptions[index].endTime = value + 1;
    }
    if (field === 'endTime' && newCaptions[index].startTime >= value) {
      newCaptions[index].startTime = value - 1;
    }
    
    onCaptionsChange(newCaptions);
  };
  
  const handleMoveCaption = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === captions.length - 1)
    ) {
      return;
    }
    
    const newCaptions = [...captions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newCaptions[index], newCaptions[newIndex]] = [newCaptions[newIndex], newCaptions[index]];
    
    onCaptionsChange(newCaptions);
    setSelectedCaptionIndex(newIndex);
  };
  
  const handleDuplicateCaption = (index: number) => {
    const captionToDuplicate = captions[index];
    const newCaption = {
      ...captionToDuplicate,
      startTime: captionToDuplicate.endTime + 0.5,
      endTime: Math.min(captionToDuplicate.endTime + 2.5, videoDuration)
    };
    
    const newCaptions = [...captions];
    newCaptions.splice(index + 1, 0, newCaption);
    
    onCaptionsChange(newCaptions);
    setSelectedCaptionIndex(index + 1);
  };
  
  // Display cleaned captions
  const displayCaptions = captions.map(caption => {
    if (mightContainUnwantedContent(caption.text)) {
      return {
        ...caption,
        text: sanitizeCaptionText(caption.text)
      };
    }
    return caption;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlignCenter className="h-5 w-5" />
          <h3 className="text-lg font-medium">TikTok Captions</h3>
        </div>
        
        <div className="flex space-x-2">
          <Select 
            onValueChange={(value) => {
              const template = captionTemplates.find((t, i) => i === parseInt(value));
              if (template) handleAddCaption(template);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Add template" />
            </SelectTrigger>
            <SelectContent>
              {captionTemplates.map((template, index) => (
                <SelectItem key={index} value={index.toString()}>
                  <div className="flex items-center">
                    <span className="truncate max-w-[150px]">{template.text}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddCaption()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left panel: Captions list */}
        <div className="md:col-span-1 space-y-3">
          {displayCaptions.length === 0 ? (
            <div className="text-center p-4 border rounded-md border-dashed">
              <MessageSquarePlus className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No captions yet.</p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2"
                onClick={() => handleAddCaption()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Caption
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {displayCaptions.map((caption, index) => {
                const style = captionStyles.find(s => s.value === caption.style);
                
                return (
                  <Card 
                    key={index} 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedCaptionIndex === index ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedCaptionIndex(index)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium truncate max-w-[180px] text-sm flex items-center">
                          <span className="mr-1">{style?.emoji || '📝'}</span>
                          {caption.text}
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCaption(index);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {caption.startTime.toFixed(1)}s - {caption.endTime.toFixed(1)}s
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Right panel: Edit selected caption */}
        <div className="md:col-span-2">
          {selectedCaptionIndex !== null && selectedCaptionIndex < captions.length ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Edit TikTok Caption
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Caption Text</label>
                  <Input
                    value={displayCaptions[selectedCaptionIndex].text}
                    onChange={(e) => handleCaptionChange(selectedCaptionIndex, 'text', e.target.value)}
                    placeholder="Enter caption text..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style</label>
                    <Select
                      value={captions[selectedCaptionIndex].style || 'default'}
                      onValueChange={(value) => handleCaptionChange(
                        selectedCaptionIndex, 
                        'style', 
                        value as Caption['style']
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {captionStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            <div className="flex items-center">
                              <span className="mr-2">{style.emoji}</span>
                              <span>{style.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Animation</label>
                    <Select
                      value={captions[selectedCaptionIndex].animation || 'pop'}
                      onValueChange={(value) => handleCaptionChange(
                        selectedCaptionIndex, 
                        'animation', 
                        value as Caption['animation']
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select animation" />
                      </SelectTrigger>
                      <SelectContent>
                        {animationOptions.map((animation) => (
                          <SelectItem key={animation.value} value={animation.value}>
                            {animation.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Start Time (seconds)</label>
                      <span className="text-sm text-muted-foreground">
                        {captions[selectedCaptionIndex].startTime.toFixed(1)}s
                      </span>
                    </div>
                    <Slider
                      value={[captions[selectedCaptionIndex].startTime]}
                      min={0}
                      max={videoDuration}
                      step={0.1}
                      onValueChange={(value) => handleCaptionChange(
                        selectedCaptionIndex, 
                        'startTime', 
                        value[0]
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">End Time (seconds)</label>
                      <span className="text-sm text-muted-foreground">
                        {captions[selectedCaptionIndex].endTime.toFixed(1)}s
                      </span>
                    </div>
                    <Slider
                      value={[captions[selectedCaptionIndex].endTime]}
                      min={0}
                      max={videoDuration}
                      step={0.1}
                      onValueChange={(value) => handleCaptionChange(
                        selectedCaptionIndex, 
                        'endTime', 
                        value[0]
                      )}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveCaption(selectedCaptionIndex, 'up')}
                    disabled={selectedCaptionIndex === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveCaption(selectedCaptionIndex, 'down')}
                    disabled={selectedCaptionIndex === captions.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateCaption(selectedCaptionIndex)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCaption(selectedCaptionIndex)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-6 border rounded-md border-dashed">
              <div className="text-center">
                <MessageSquarePlus className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Select a caption to edit or create a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TikTokCaptionEditor;

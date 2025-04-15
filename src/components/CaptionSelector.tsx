import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sanitizeCaption } from '@/services/openaiIntegration';
import { CheckCircle2, Circle, Pencil, Save, X } from 'lucide-react';

interface CaptionSelectorProps {
  onCaptionSelect: (caption: string, index: number) => void;
  selectedIndices: number[];
}

const CaptionSelector: React.FC<CaptionSelectorProps> = ({
  onCaptionSelect,
  selectedIndices
}) => {
  const [captionsText, setCaptionsText] = useState('');
  const [parsedCaptions, setParsedCaptions] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const parseAndFormatCaptions = (text: string): string[] => {
    // Remove any "Hope these help..." or similar endings
    text = text.replace(/Hope these.*?viral.*?$/i, '').trim();
    
    // Split by numbered items but preserve numbers in the content
    const lines = text.split('\n').filter(Boolean);
    const captions = lines
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line) || line.includes('"')) // Only take numbered lines or quoted content
      .map(line => {
        let caption = line.replace(/^\d+\.\s*/, ''); // Remove the leading number temporarily
        caption = sanitizeCaption(caption)
          .replace(/^["']|["']$/g, '') // Remove surrounding quotes
          .replace(/\s*#\w+/g, '') // Remove hashtags
          .trim();

        // If the caption itself starts with a number (like "1. University..."), preserve it
        if (/^\d+\./.test(caption)) {
          return caption;
        }
        
        return caption;
      })
      .filter(caption => caption.length > 0);

    return captions;
  };

  const handleTextChange = (text: string) => {
    setCaptionsText(text);
    try {
      const captions = parseAndFormatCaptions(text);
      setParsedCaptions(captions);
      
      // Update selected indices to account for removed captions
      const newSelectedIndices = selectedIndices
        .filter(index => index < captions.length)
        .map(index => captions[index] ? index : -1)
        .filter(index => index !== -1);
    } catch (error) {
      console.error('Error parsing captions:', error);
      toast.error('Error parsing captions. Please check the format.');
    }
  };

  const handleEditStart = (index: number, caption: string) => {
    setEditingIndex(index);
    setEditingText(caption);
  };

  const handleEditSave = (index: number) => {
    if (editingText.trim()) {
      const newCaptions = [...parsedCaptions];
      newCaptions[index] = editingText.trim();
      setParsedCaptions(newCaptions);
      setEditingIndex(null);
      setEditingText('');
      toast.success('Caption updated');
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={captionsText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste your captions here..."
          className="min-h-[120px] font-mono text-sm bg-black/20 border-purple-500/20 focus:border-purple-500/50 rounded-xl"
        />
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-200"
            onClick={() => handleTextChange('')}
          >
            Clear
          </Button>
        </div>
      </div>
      
      <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-purple-500/10 hover:scrollbar-thumb-purple-500/70">
        <div className="grid gap-2">
          {parsedCaptions.map((caption, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden transition-all duration-200 ${
                selectedIndices.includes(index) 
                  ? 'bg-purple-500/20 border-purple-500/50' 
                  : 'bg-black/20 border-purple-500/10 hover:bg-purple-500/10'
              } rounded-xl backdrop-blur-sm cursor-pointer group`}
            >
              <div className="flex items-start gap-4 p-4" onClick={() => editingIndex !== index && onCaptionSelect(caption, index)}>
                <div className="flex-shrink-0">
                  {selectedIndices.includes(index) ? (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                      {selectedIndices.indexOf(index) + 1}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-purple-500/50 group-hover:border-purple-500 flex items-center justify-center text-purple-500/50 group-hover:text-purple-500">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {editingIndex === index ? (
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="min-h-[60px] w-full bg-black/30 border-purple-500/30 focus:border-purple-500/50 rounded-lg text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className={`text-sm ${
                      selectedIndices.includes(index) 
                        ? 'text-purple-200' 
                        : 'text-gray-300 group-hover:text-purple-200'
                    }`}>
                      {caption}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  {editingIndex === index ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-green-500/20 hover:bg-green-500/30 text-green-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSave(index);
                        }}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-red-500/20 hover:bg-red-500/30 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCancel();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-purple-500/20 hover:bg-purple-500/30 text-purple-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(index, caption);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {selectedIndices.includes(index) ? (
                        <CheckCircle2 className="w-6 h-6 text-purple-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-purple-500/50 group-hover:text-purple-500" />
                      )}
                    </>
                  )}
                </div>
              </div>
              {selectedIndices.includes(index) && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaptionSelector; 
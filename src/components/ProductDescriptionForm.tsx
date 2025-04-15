
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Mic, MessageSquareText, Check } from "lucide-react";
import { toast } from "sonner";
import VoicemakerVoiceSelector from './VoicemakerVoiceSelector';

const ProductDescriptionForm: React.FC = () => {
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [savedDescription, setSavedDescription] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [useEnhancedVoiceover, setUseEnhancedVoiceover] = useState<boolean>(true);
  const [useTikTokStyle, setUseTikTokStyle] = useState<boolean>(true);

  // Load saved description on mount
  useEffect(() => {
    const saved = localStorage.getItem('productDescription');
    if (saved) {
      setDescription(saved);
      setSavedDescription(saved);
    }
    
    // Load saved voice preference
    const savedVoice = localStorage.getItem('preferredVoiceId');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
    
    // Load saved settings
    const enhancedSetting = localStorage.getItem('useEnhancedVoiceover');
    if (enhancedSetting !== null) {
      setUseEnhancedVoiceover(enhancedSetting === 'true');
    }
    
    const tikTokSetting = localStorage.getItem('useTikTokStyle');
    if (tikTokSetting !== null) {
      setUseTikTokStyle(tikTokSetting === 'true');
    }
  }, []);

  // Generate TikTok-optimized description from plain text
  const generateTikTokDescription = (text: string): string => {
    if (!text) return "";
    
    // Add TikTok style emojis and formatting
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return "";
    
    const emojis = ["🔥", "✨", "🚀", "💯", "🤩", "👀", "🙌", "💪", "😍", "🎯"];
    const enhancers = ["literally", "absolutely", "completely", "totally", "seriously"];
    const tiktokisms = ["no cap", "fr fr", "not clickbait", "game changer", "life hack"];
    
    // Process first line as hook
    let result = `${lines[0]} ${emojis[Math.floor(Math.random() * emojis.length)]}\n\n`;
    
    // Process rest of content
    for (let i = 1; i < lines.length; i++) {
      let line = lines[i];
      
      // 30% chance to add TikTok-style enhancer
      if (Math.random() < 0.3) {
        const enhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
        line = line.replace(/\.$/, ` ${enhancer}.`);
      }
      
      // 40% chance to add emoji
      if (Math.random() < 0.4) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        line = `${line} ${emoji}`;
      }
      
      result += `${line}\n\n`;
    }
    
    // Add viral TikTok ending
    const tiktokism = tiktokisms[Math.floor(Math.random() * tiktokisms.length)];
    result += `${tiktokism} ${emojis[Math.floor(Math.random() * emojis.length)]}`;
    
    return result;
  };

  const handleSaveDescription = () => {
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    
    setLoading(true);
    
    try {
      // Process description if TikTok style is enabled
      const finalDescription = useTikTokStyle ? 
        generateTikTokDescription(description) : 
        description;
      
      // Save to localStorage
      localStorage.setItem('productDescription', finalDescription);
      setSavedDescription(finalDescription);
      
      // Save voice preference
      if (selectedVoice) {
        localStorage.setItem('preferredVoiceId', selectedVoice);
      }
      
      // Save settings
      localStorage.setItem('useEnhancedVoiceover', useEnhancedVoiceover.toString());
      localStorage.setItem('useTikTokStyle', useTikTokStyle.toString());
      
      // Notify success
      toast.success("Description saved successfully", {
        description: "Your content description has been saved."
      });
      
      // Trigger the "hasNewDescription" event for other components to listen to
      window.dispatchEvent(new CustomEvent('hasNewDescription', { 
        detail: { description: finalDescription } 
      }));
    } catch (error) {
      console.error("Error saving description:", error);
      toast.error("Failed to save description");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5" />
          Content Description
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Describe your content</Label>
          <Textarea
            id="description"
            placeholder="Describe your product, service, or content topic. This will help create more relevant captions and voiceovers."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
          />
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">TikTok Style</span>
              <span className="text-sm text-muted-foreground">Format content for viral TikTok</span>
            </div>
            <Switch 
              checked={useTikTokStyle} 
              onCheckedChange={setUseTikTokStyle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">Enhanced Voiceover</span>
              <span className="text-sm text-muted-foreground">Use ProPlus high-energy voices</span>
            </div>
            <Switch 
              checked={useEnhancedVoiceover} 
              onCheckedChange={setUseEnhancedVoiceover}
            />
          </div>
        </div>
        
        <div className="pt-2">
          <VoicemakerVoiceSelector
            selectedVoiceId={selectedVoice}
            onVoiceSelect={setSelectedVoice}
          />
        </div>
        
        <Button 
          onClick={handleSaveDescription} 
          disabled={loading || !description.trim()} 
          className="w-full mt-6"
        >
          {loading ? (
            <>Processing...</>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Save Content Description
            </>
          )}
        </Button>
        
        {savedDescription && (
          <div className="p-3 mt-4 bg-green-500/10 border border-green-500/30 rounded-md">
            <div className="flex items-center gap-2 text-green-500 font-medium mb-1">
              <Check className="h-4 w-4" /> Description Saved
            </div>
            <p className="text-sm text-muted-foreground">
              Your content description will be used to generate captions and voiceovers.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductDescriptionForm;

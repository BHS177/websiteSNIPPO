
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface VoicemakerApiSetupProps {
  onApiKeySet?: (isValid: boolean) => void;
  minimal?: boolean;
}

const VoicemakerApiSetup: React.FC<VoicemakerApiSetupProps> = ({ 
  onApiKeySet,
  minimal = false 
}) => {
  // On component mount, automatically apply default credentials
  useEffect(() => {
    console.log("Default Voicemaker.in credentials automatically applied");
    
    // Toast notification when setup is complete
    toast.success("Voicemaker.in Text-to-Speech is ready", {
      description: "Your voice-overs will be generated using Voicemaker.in's Pro and ProPlus voices"
    });
    
    // Notify parent component
    if (onApiKeySet) {
      onApiKeySet(true);
    }
  }, [onApiKeySet]);

  if (minimal) {
    return (
      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-md">
        <div className="flex items-center gap-2 text-purple-500 font-medium mb-1">
          <Sparkles className="h-4 w-4" /> Voicemaker.in Pro/ProPlus TTS is ready
        </div>
        <p className="text-sm text-muted-foreground">
          Generate high-energy voice-overs perfect for viral TikTok content.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link to="/home">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Button>
        </Link>
      </div>
      
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Voicemaker.in TTS Integration Active</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md">
            <div className="flex items-center gap-2 text-green-500 font-medium mb-1">
              <Check className="h-4 w-4" /> Voicemaker.in API is automatically configured
            </div>
            <p className="text-sm text-muted-foreground">
              The API is pre-configured for high-energy TikTok voice-over generation. No additional setup is required.
            </p>
          </div>
          
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-md">
            <div className="flex items-center gap-2 text-purple-500 font-medium mb-1">
              <Sparkles className="h-4 w-4" /> Pro & ProPlus Voices Available
            </div>
            <p className="text-sm text-muted-foreground">
              Access to both Pro (1x character rate) and ProPlus (3x character rate) voices for optimal TikTok content.
            </p>
          </div>
          
          <Button 
            onClick={() => {
              // Confirm active status
              toast.success("Voicemaker.in TTS API is ready to use", { 
                description: "The API configuration is already applied with high-energy voices."
              });
              
              if (onApiKeySet) {
                onApiKeySet(true);
              }
            }}
            className="w-full"
          >
            Continue to Video Editor
          </Button>
        </CardContent>
      </Card>
      
      <div className="max-w-md mx-auto mt-6 p-4 bg-card border rounded-md">
        <h3 className="font-medium mb-2">About Voicemaker.in Integration</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Voicemaker.in's neural voices create energetic, natural-sounding voices perfect for viral TikTok content.
          This integration allows you to generate professional voice-overs for your captions automatically.
        </p>
        <div className="mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>All audio files are automatically stored for 10 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Voice preview samples included for all voices</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicemakerApiSetup;

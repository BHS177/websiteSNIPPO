
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { elevenLabsService } from "@/services/elevenLabsService";
import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ElevenLabsApiSetupProps {
  onApiKeySet?: (isValid: boolean) => void;
  minimal?: boolean;
}

const ElevenLabsApiSetup: React.FC<ElevenLabsApiSetupProps> = ({ 
  onApiKeySet,
  minimal = false
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { toast } = useToast();

  // Check if API key is already set on mount
  useEffect(() => {
    const savedKey = elevenLabsService.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsValid(true);
      onApiKeySet?.(true);
    }
  }, [onApiKeySet]);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      // Set the API key
      elevenLabsService.setApiKey(apiKey.trim());
      
      // Test the API key by fetching voices
      await elevenLabsService.getVoices();
      
      // If successful, set as valid
      setIsValid(true);
      onApiKeySet?.(true);
      
      toast({
        title: "API Key Valid",
        description: "Your ElevenLabs API key has been saved",
        variant: "default",
      });
      
      // Collapse the form in minimal mode
      if (minimal) {
        setIsExpanded(false);
      }
    } catch (error) {
      console.error("API key validation failed:", error);
      setIsValid(false);
      onApiKeySet?.(false);
      elevenLabsService.clearApiKey();
      
      toast({
        title: "Invalid API Key",
        description: "Please check your ElevenLabs API key and try again",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const clearApiKey = () => {
    elevenLabsService.clearApiKey();
    setApiKey('');
    setIsValid(false);
    onApiKeySet?.(false);
    
    toast({
      title: "API Key Removed",
      description: "Your ElevenLabs API key has been removed",
      variant: "default",
    });
  };

  // Minimal view for when integrated into other components
  if (minimal) {
    return (
      <div className="space-y-2 p-4 rounded-lg bg-background border">
        {isValid && !isExpanded ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">ElevenLabs API Key Set</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsExpanded(true)}>
                Change
              </Button>
              <Button variant="outline" size="sm" onClick={clearApiKey}>
                Clear
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                ElevenLabs API Key
              </Label>
              <div className="flex space-x-2">
                <Input 
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your ElevenLabs API key"
                  className="flex-1"
                />
                <Button onClick={validateApiKey} disabled={isValidating}>
                  {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                You can find your API key in your <a href="https://elevenlabs.io/account" target="_blank" rel="noopener noreferrer" className="underline">ElevenLabs account</a>
              </p>
            </div>
            {isValid && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsExpanded(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full card view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          ElevenLabs API Setup
        </CardTitle>
        <CardDescription>
          Enter your ElevenLabs API key to enable text-to-speech functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex space-x-2">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your ElevenLabs API key"
                className="flex-1"
              />
              <Button 
                onClick={validateApiKey} 
                disabled={isValidating}
                className="min-w-[80px]"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isValid ? (
                  <Check className="h-4 w-4" />
                ) : (
                  "Validate"
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Don't have an API key?</p>
            <a 
              href="https://elevenlabs.io/sign-up" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Sign up for ElevenLabs
            </a>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isValid && (
          <Button variant="outline" onClick={clearApiKey}>
            <X className="h-4 w-4 mr-2" />
            Clear API Key
          </Button>
        )}
        <div className="ml-auto">
          {isValid && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <Check className="h-4 w-4" />
              API Key Valid
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ElevenLabsApiSetup;

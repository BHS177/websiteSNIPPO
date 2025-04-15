
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { VideoClip } from '@/types/video';
import { Toggle } from "@/components/ui/toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkle, Clock, Zap, MessageSquareText, ScreenShare, LightbulbIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VariationGeneratorProps {
  generateVariations: (count: number, useAIOptimization?: boolean, useSeamlessCaptions?: boolean) => void;
  clips: VideoClip[];
}

const VariationGenerator: React.FC<VariationGeneratorProps> = ({ 
  generateVariations,
  clips 
}) => {
  const [variationCount, setVariationCount] = useState(10);
  const [useAIOptimization, setUseAIOptimization] = useState(true);
  const [useSeamlessCaptions, setUseSeamlessCaptions] = useState(true);
  const [useProductFocus, setUseProductFocus] = useState(true);

  return (
    <div className="space-y-6">
      <Card className="bg-muted/50 overflow-hidden">
        <CardContent className="p-6">
          <h3 className="font-medium mb-4 flex items-center">
            <Sparkle className="h-4 w-4 mr-2 text-primary" />
            AI-Powered Video Generation
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6">
            Generate variations using our advanced AI that analyzes your {clips.length} clips 
            to extract the most engaging 3-4 seconds, sequence them optimally, and create 
            seamless captions that flow across transitions.
          </p>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Optimal Segment Extraction</span>
                </div>
                <Toggle 
                  pressed={useAIOptimization} 
                  onPressedChange={setUseAIOptimization}
                  aria-label="Toggle AI clip optimization"
                />
              </div>
              
              <p className="text-xs text-muted-foreground pl-6">
                AI analyzes each clip to extract the most engaging 3-4 second segment,
                prioritizing visual quality, motion dynamics and emotional impact.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  <span className="font-medium">Seamless Caption Flow</span>
                </div>
                <Toggle 
                  pressed={useSeamlessCaptions} 
                  onPressedChange={setUseSeamlessCaptions}
                  aria-label="Toggle seamless captions"
                />
              </div>
              
              <p className="text-xs text-muted-foreground pl-6">
                Generates captions that flow naturally across clip transitions,
                creating a continuous narrative instead of isolated text per clip.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <LightbulbIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium">Product Focus</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center justify-center rounded-full bg-muted px-1 text-xs cursor-help">?</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Uses your product description to generate relevant, product-focused captions with hooks, feature highlights, and CTAs</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Toggle 
                  pressed={useProductFocus} 
                  onPressedChange={setUseProductFocus}
                  aria-label="Toggle product focus"
                />
              </div>
              
              <p className="text-xs text-muted-foreground pl-6">
                Creates product-centric captions with catchy hooks, feature highlights,
                and clear call-to-actions based on your product description.
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ScreenShare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Number of variations:</span>
                </div>
                <span className="text-sm font-bold">{variationCount}</span>
              </div>
              <Slider
                value={[variationCount]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => setVariationCount(value[0])}
                className="my-4"
              />
            </div>
            
            <Button 
              onClick={() => generateVariations(variationCount, useAIOptimization, useSeamlessCaptions)}
              className="w-full"
              disabled={clips.length < 3}
              variant="default"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate {variationCount} AI-Optimized Variations
            </Button>
            
            {clips.length < 3 && (
              <p className="text-sm text-destructive mt-2">
                You need at least 3 clips to generate variations.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VariationGenerator;

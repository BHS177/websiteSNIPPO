
import React, { useState } from 'react';
import { VideoClip } from '@/types/video';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MoveHorizontal, Layers, Scissors, ListRestart, Plus, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { generateMultipleSequences } from '@/utils/sequencePatterns';
import { toast } from "sonner";

interface BatchVariationGeneratorProps {
  clips: VideoClip[];
  setClips: React.Dispatch<React.SetStateAction<VideoClip[]>>;
  onCreateVideo?: (selectedClips: VideoClip[]) => void;
}

const BatchVariationGenerator: React.FC<BatchVariationGeneratorProps> = ({ 
  clips, 
  setClips, 
  onCreateVideo
}) => {
  const [variationCount, setVariationCount] = useState<number>(5);
  const [segmentDuration, setSegmentDuration] = useState<number>(2.5);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [variationMode, setVariationMode] = useState<'sequence' | 'segment'>('sequence');
  const [selectedClips, setSelectedClips] = useState<number[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const originalClips = clips.filter(clip => !clip.isSegment);

  const toggleClipSelection = (id: number) => {
    setSelectedClips(prev => 
      prev.includes(id) 
        ? prev.filter(clipId => clipId !== id) 
        : [...prev, id]
    );
  };

  const selectAllClips = () => {
    setSelectedClips(originalClips.map(clip => clip.id));
  };

  const clearSelection = () => {
    setSelectedClips([]);
  };

  const getNextClipId = (): number => {
    return clips.length > 0 ? Math.max(...clips.map(clip => clip.id)) + 1 : 1;
  };

  const generateVariations = () => {
    if (selectedClips.length === 0) {
      toast.warning("No clips selected", {
        description: "Please select at least one clip to create variations."
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        // Get selected clip objects
        const selectedClipObjects = clips.filter(clip => selectedClips.includes(clip.id));
        
        if (variationMode === 'segment') {
          // First segment the clips
          const segmentedClips: VideoClip[] = [];
          let nextId = getNextClipId();
          
          selectedClipObjects.forEach(clip => {
            const numSegments = Math.ceil(clip.duration / segmentDuration);
            
            for (let i = 0; i < numSegments; i++) {
              const startTime = i * segmentDuration;
              const endTime = Math.min((i + 1) * segmentDuration, clip.duration);
              
              if (endTime - startTime < 1) continue;
              
              segmentedClips.push({
                id: nextId++,
                name: `${clip.name} (Segment ${i + 1})`,
                duration: endTime - startTime,
                type: clip.type,
                url: clip.url,
                mimeType: clip.mimeType,
                originalClipId: clip.id,
                startTime: startTime,
                endTime: endTime,
                isSegment: true,
                sequence: segmentedClips.length
              });
            }
          });
          
          // Generate variations from the segments
          const variations = generateMultipleSequences(segmentedClips, variationCount);
          
          // Update all clips with new segments
          setClips(prevClips => {
            const nonSegmentClips = prevClips.filter(c => !c.isSegment);
            return [...nonSegmentClips, ...segmentedClips];
          });
          
          // Process each variation
          variations.forEach((sequence, index) => {
            if (onCreateVideo) {
              toast.info(`Creating variation #${index + 1}`, {
                description: `Generating variation ${index + 1} of ${variations.length}`
              });
              
              // Update sequence numbers first
              const sequencedClips = sequence.map((clip, seqIndex) => ({
                ...clip,
                sequence: seqIndex
              }));
              
              // Call create video for this variation
              setTimeout(() => {
                onCreateVideo(sequencedClips);
              }, index * 500);
            }
          });
          
        } else {
          // Just resequence without segmenting
          const variations = generateMultipleSequences(selectedClipObjects, variationCount);
          
          // Process each variation
          variations.forEach((sequence, index) => {
            if (onCreateVideo) {
              toast.info(`Creating variation #${index + 1}`, {
                description: `Generating variation ${index + 1} of ${variations.length}`
              });
              
              // Update sequence numbers first
              const sequencedClips = sequence.map((clip, seqIndex) => ({
                ...clip,
                sequence: seqIndex
              }));
              
              // Call create video for this variation
              setTimeout(() => {
                onCreateVideo(sequencedClips);
              }, index * 500);
            }
          });
        }
        
        toast.success("Batch variations created", {
          description: `Generated ${variationCount} different variations of your content.`
        });
        
      } catch (error) {
        console.error("Error generating variations:", error);
        toast.error("Failed to create variations", {
          description: "There was an error during processing. Please try again."
        });
      } finally {
        setIsProcessing(false);
      }
    }, 500);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Batch Variation Generator
          </CardTitle>
          <CardDescription>
            Create multiple variations of your clips automatically for marketing campaigns.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Variation Mode</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={variationMode === 'sequence' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVariationMode('sequence')}
                    className="flex-1 gap-1"
                  >
                    <ListRestart className="h-4 w-4" />
                    Resequence Only
                  </Button>
                  <Button
                    type="button"
                    variant={variationMode === 'segment' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVariationMode('segment')}
                    className="flex-1 gap-1"
                  >
                    <Scissors className="h-4 w-4" />
                    Segment & Resequence
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Number of Variations</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[variationCount]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setVariationCount(value[0])}
                    className="flex-1"
                  />
                  <span className="min-w-[40px] text-center">{variationCount}</span>
                </div>
              </div>
              
              {variationMode === 'segment' && (
                <div>
                  <Label className="mb-2 block">Segment Duration (seconds)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[segmentDuration]}
                      min={1.5}
                      max={3.5}
                      step={0.5}
                      onValueChange={(value) => setSegmentDuration(value[0])}
                      className="flex-1"
                    />
                    <span className="min-w-[40px] text-center">{segmentDuration}s</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="advanced-options" 
                  checked={showAdvanced}
                  onCheckedChange={setShowAdvanced}
                />
                <Label htmlFor="advanced-options">Show Advanced Options</Label>
              </div>
              
              {showAdvanced && (
                <div className="space-y-4 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Advanced options coming soon</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Selected Clips ({selectedClips.length})</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAllClips}>
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                {originalClips.length > 0 ? (
                  originalClips.map((clip) => (
                    <div
                      key={`clip-${clip.id}`}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer mb-1 ${
                        selectedClips.includes(clip.id) ? 'bg-primary/20' : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleClipSelection(clip.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-sm border mr-2 ${
                          selectedClips.includes(clip.id) ? 'bg-primary border-primary' : 'border-muted-foreground'
                        }`}>
                          {selectedClips.includes(clip.id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span className="truncate max-w-[180px]">{clip.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">
                        {clip.duration}s
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No clips uploaded yet. Add clips using the upload option.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Button
            onClick={generateVariations}
            className="w-full"
            size="lg"
            disabled={isProcessing || selectedClips.length === 0}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate {variationCount} Variations
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BatchVariationGenerator;


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Trash } from "lucide-react";
import { VideoClip, VideoVariation } from '@/types/video';
import { toast } from "@/hooks/use-toast";

interface VariationsListProps {
  variations: VideoVariation[];
  clips: VideoClip[];
  setVariations: React.Dispatch<React.SetStateAction<VideoVariation[]>>;
}

const VariationsList: React.FC<VariationsListProps> = ({ 
  variations, 
  clips,
  setVariations
}) => {
  const copyVariation = (variation: VideoVariation) => {
    const clipNames = variation.sequence?.map(id => {
      const clip = clips.find(c => c.id === id);
      return clip ? clip.name : `Unknown Clip (${id})`;
    });
    
    const captionsText = variation.captions?.map(caption => 
      `  - [${caption.startTime}-${caption.endTime}s] "${caption.text}"`
    ).join('\n');
    
    const text = `${variation.name}:
- Sequence: ${clipNames?.join('-') || 'No sequence'}
- Captions:
${captionsText || 'No captions'}
- Final Duration: ${variation.duration || 0}s`;

    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Variation details copied successfully",
        });
      })
      .catch(error => {
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive"
        });
      });
  };
  
  const deleteVariation = (id: string) => {
    setVariations(variations.filter(v => v.id !== id));
    toast({
      title: "Variation deleted",
      description: "The variation has been removed",
    });
  };
  
  const downloadAll = () => {
    const allText = variations.map(variation => {
      const clipNames = variation.sequence?.map(id => {
        const clip = clips.find(c => c.id === id);
        return clip ? clip.name : `Unknown Clip (${id})`;
      });
      
      const captionsText = variation.captions?.map(caption => 
        `  - [${caption.startTime}-${caption.endTime}s] "${caption.text}"`
      ).join('\n');
      
      return `${variation.name}:
- Sequence: ${clipNames?.join('-') || 'No sequence'}
- Captions:
${captionsText || 'No captions'}
- Final Duration: ${variation.duration || 0}s

`;
    }).join('\n');
    
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-variations.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "All variations are being downloaded as a text file",
    });
  };

  return (
    <div className="space-y-4">
      {variations.length > 0 ? (
        <>
          <div className="flex justify-between mb-4">
            <h3 className="font-medium">
              You have {variations.length} variation{variations.length !== 1 ? 's' : ''}
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadAll}
              disabled={variations.length === 0}
            >
              <Download className="mr-2 h-4 w-4" /> Download All
            </Button>
          </div>
          
          <div className="space-y-4">
            {variations.map(variation => (
              <Card key={variation.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{variation.name}</h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyVariation(variation)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteVariation(variation.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="font-medium">Sequence: </span>
                      {variation.sequence?.map(id => {
                        const clip = clips.find(c => c.id === id);
                        return clip ? clip.name : `Unknown (${id})`;
                      }).join(' - ') || 'No sequence'}
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div>
                      <span className="font-medium">Captions:</span>
                      {variation.captions && variation.captions.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {variation.captions.map((caption, index) => (
                            <li key={index}>
                              [{caption.startTime}-{caption.endTime}s] "{caption.text}"
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-muted-foreground">No captions</p>
                      )}
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div>
                      <span className="font-medium">Final Duration: </span>
                      {variation.duration || 0}s
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No variations generated yet. Go to the Variation Generator tab to create some!</p>
        </div>
      )}
    </div>
  );
};

export default VariationsList;

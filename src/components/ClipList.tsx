
import React, { useState } from 'react';
import { VideoClip } from '@/types/video';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface ClipListProps {
  clips: VideoClip[];
  onRemoveClip: (id: number) => void;
  onReorderClip?: (id: number, direction: 'up' | 'down') => void;
  onEditClip?: (id: number) => void;
}

const ClipList: React.FC<ClipListProps> = ({ 
  clips, 
  onRemoveClip, 
  onReorderClip,
  onEditClip
}) => {
  const [hoverClip, setHoverClip] = useState<number | null>(null);
  
  if (!clips || clips.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-lg">
        <p className="text-muted-foreground">
          No clips added yet. Upload videos or images to get started.
        </p>
      </div>
    );
  }
  
  const handleRemove = (id: number) => {
    onRemoveClip(id);
    toast.success("Clip removed from sequence");
  };
  
  const handleReorder = (id: number, direction: 'up' | 'down') => {
    if (onReorderClip) {
      onReorderClip(id, direction);
    }
  };
  
  const handleEdit = (id: number) => {
    if (onEditClip) {
      onEditClip(id);
    }
  };
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-2">Your Clips ({clips.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips.map((clip, index) => (
          <Card 
            key={`${clip.id}-${index}`}
            className="overflow-hidden relative transition-all duration-200 hover:shadow-md"
            onMouseEnter={() => setHoverClip(clip.id)}
            onMouseLeave={() => setHoverClip(null)}
          >
            <CardContent className="p-3 flex flex-col">
              <div className="relative aspect-video bg-black/20 rounded-md mb-2 overflow-hidden">
                {clip.type === 'video' ? (
                  <video 
                    src={clip.url} 
                    className="w-full h-full object-cover"
                    controls={false}
                    muted
                    playsInline
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                ) : (
                  <img 
                    src={clip.url} 
                    alt={clip.name}
                    className="w-full h-full object-cover" 
                  />
                )}
                
                <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {clip.type === 'video' ? 'Video' : 'Image'}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <div className="text-sm font-medium truncate max-w-[180px]">
                  {clip.name}
                </div>
                <div className="flex space-x-1">
                  {hoverClip === clip.id && (
                    <>
                      {onReorderClip && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleReorder(clip.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleReorder(clip.id, 'down')}
                            disabled={index === clips.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {onEditClip && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEdit(clip.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(clip.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClipList;

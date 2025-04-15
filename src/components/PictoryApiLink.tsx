import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wand2, Check, Sparkles, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const PictoryApiLink: React.FC = () => {
  // Always show as configured since we're using default credentials
  const isConfigured = true;
  
  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation and show toast explaining AI is active
    e.preventDefault();
    toast.success("Pictory AI Caption Integration Active", {
      description: "Your captions will be analyzed and optimized using the Pictory AI. Click 'ANALYZE ALL CLIPS & GENERATE CAPTIONS' to use it."
    });
    
    // Set a flag to indicate Pictory was selected
    localStorage.setItem('usePictoryAI', 'true');
    
    // Also store the fact that we're using enhanced understanding
    localStorage.setItem('enhancedUnderstanding', 'true');
    
    // Show a follow-up toast with guidance
    setTimeout(() => {
      toast.info("Enhanced Caption Understanding Active", {
        description: "AI will now understand your requests more accurately and generate tailored captions."
      });
    }, 1500);
  };
  
  return (
    <Link to="#" onClick={handleClick}>
      <div className="flex flex-col space-y-1 items-start">
        <Button 
          variant="default"
          size="sm"
          className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all group relative"
        >
          <div className="absolute -right-1 -top-1">
            <Badge className="bg-yellow-500 text-[10px] px-1 py-0">PRO</Badge>
          </div>
          <Wand2 className="h-3 w-3 group-hover:hidden" />
          <Sparkles className="h-3 w-3 hidden group-hover:block text-yellow-300" />
          <span className="group-hover:hidden">Pictory AI Understanding</span>
          <span className="hidden group-hover:block">Enhanced AI Captions</span>
        </Button>
        <div className="text-[10px] text-emerald-400 flex items-center gap-1 pl-1">
          <Lightbulb className="h-2 w-2" />
          <span>Perfect understanding of your requests</span>
        </div>
      </div>
    </Link>
  );
};

export default PictoryApiLink;

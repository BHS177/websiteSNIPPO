
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

// Simplified component that just shows Voicemaker.in is already configured
const OpenAIConfig: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1 text-xs border-purple-500/30 text-purple-400"
        disabled
      >
        <Sparkles className="h-3 w-3" />
        Voicemaker.in Powered
      </Button>
    </div>
  );
};

export default OpenAIConfig;

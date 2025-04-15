
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { savePictoryCredentials } from "@/services/pictoryService";
import { toast } from "sonner";

const PictoryApiSetup: React.FC = () => {
  // On component mount, automatically apply default credentials
  useEffect(() => {
    // Set credentials that will be used by the Pictory service
    savePictoryCredentials({ 
      apiKey: "https://api.pictory.ai/pictoryapis/v1/oauth2/token",
      userId: "Crivido"
    });
    
    // Set Pictory as the preferred caption service
    localStorage.setItem('usePictoryAI', 'true');
    
    console.log("Default Pictory credentials automatically applied");
    
    // Toast notification when setup is complete
    toast.success("Pictory AI is ready", {
      description: "Your captions will be generated using Pictory's AI engine"
    });
  }, []);

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
          <CardTitle>Pictory AI Integration Active</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md">
            <div className="flex items-center gap-2 text-green-500 font-medium mb-1">
              <Check className="h-4 w-4" /> Pictory API is automatically configured
            </div>
            <p className="text-sm text-muted-foreground">
              The API is pre-configured for all users. No additional setup is required.
            </p>
          </div>
          
          <Button 
            onClick={() => {
              // Confirm active status
              localStorage.setItem('usePictoryAI', 'true');
              
              toast.success("Pictory API is ready to use", { 
                description: "The default API configuration is already applied for all users."
              });
            }}
            className="w-full"
          >
            Continue to Video Editor
          </Button>
        </CardContent>
      </Card>
      
      <div className="max-w-md mx-auto mt-6 p-4 bg-card border rounded-md">
        <h3 className="font-medium mb-2">About Pictory AI Integration</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Pictory is an AI-powered video creation platform that helps optimize captions and video content.
          This integration is available to all users of the application without requiring individual API keys.
        </p>
      </div>
    </div>
  );
};

export default PictoryApiSetup;

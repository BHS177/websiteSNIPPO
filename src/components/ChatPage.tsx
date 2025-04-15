
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, MessageSquare, Wand2, PanelTop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatBot from '@/components/ChatBot';
import { toast } from 'sonner';

const ChatPage = () => {
  const navigate = useNavigate();
  const [showCaption, setShowCaption] = useState(false);
  
  useEffect(() => {
    // Add a clear marker in local storage that we're on the chat page
    localStorage.setItem('onChatPage', 'true');
    
    // Show a guidance toast
    toast.info(
      "Ask for captions for your TikTok clips",
      {
        description: "Try: 'Generate 10 viral captions for my TikTok clips about [your topic]'",
        duration: 5000
      }
    );
    
    // Set flag to show caption button after 2 seconds
    const timer = setTimeout(() => {
      setShowCaption(true);
    }, 500);
    
    return () => {
      localStorage.removeItem('onChatPage');
      clearTimeout(timer);
    };
  }, []);

  // Handler for the "Return & Apply Captions" button
  const handleReturnAndApply = () => {
    // Set a flag that we want to apply captions when returning
    localStorage.setItem('applyCaptionsOnReturn', 'true');
    localStorage.setItem('hasNewAiCaptions', 'true');
    
    // Extract captions from chat history
    try {
      const mediaChats = JSON.parse(localStorage.getItem('mediaChats') || '{}');
      const existingCaptions = JSON.parse(localStorage.getItem('generatedCaptions') || '{}');
      
      // Build captions object
      const updatedCaptions = { ...existingCaptions };
      
      // Look through media chats for generated captions
      Object.entries(mediaChats).forEach(([id, chat]: [string, any]) => {
        if (chat.generatedCaption) {
          updatedCaptions[id] = chat.generatedCaption;
        }
      });
      
      // Save all captions back to localStorage
      localStorage.setItem('generatedCaptions', JSON.stringify(updatedCaptions));
      
      // Trigger event for caption application
      window.dispatchEvent(new Event('chatgpt-captions-extracted'));
      
      toast.success("Captions extracted! Returning to editor...");
    } catch (error) {
      console.error("Error extracting captions:", error);
    }
    
    navigate("/");
  };

  return (
    <div id="chat-section" className="min-h-screen bg-gradient-to-br from-black via-indigo-950/40 to-black">
      <div className="absolute inset-0 overflow-hidden">
        {/* Background particles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-indigo-500/20"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-950/50"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <Button
            variant="always-visible"
            size="lg"
            onClick={handleReturnAndApply}
            className="fixed bottom-6 right-6 z-50 shadow-xl"
          >
            <Wand2 className="h-5 w-5 mr-2" />
            Apply Captions & Return to Editor
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-4 text-white">
          Chat with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">ChatGPT</span>
        </h1>
        
        <div className="max-w-4xl mx-auto mb-8">
          <div className="p-3 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-center mb-6">
            <p className="text-white">Ask for <span className="font-bold text-indigo-300">10 viral captions</span> for your TikTok video clips</p>
            <p className="text-xs text-indigo-300 mt-1">Example: "Generate 10 engaging TikTok captions for my travel videos in Paris"</p>
          </div>
          <ChatBot />
        </div>
        
        {showCaption && (
          <div className="fixed bottom-24 right-6 z-50 max-w-sm">
            <div className="bg-indigo-950/80 p-4 rounded-lg border-2 border-purple-500/50 shadow-lg animate-bounce">
              <h3 className="text-white font-bold flex items-center gap-2 mb-2">
                <PanelTop className="h-5 w-5 text-purple-400" />
                Caption Helper
              </h3>
              <p className="text-indigo-200 text-sm mb-3">
                After ChatGPT generates your captions, click the button below to apply them to your video clips!
              </p>
              <Button 
                variant="always-visible"
                className="w-full"
                onClick={handleReturnAndApply}
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Apply Captions & Return
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-indigo-300/70">
          <p>This enhanced chatbot uses OpenAI's ChatGPT to deliver accurate, helpful responses.</p>
          <div className="mt-4 inline-block text-left bg-indigo-950/20 p-4 rounded-lg border border-indigo-500/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Capabilities:</span>
            </h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
              <li className="flex items-center gap-1">
                <span className="text-green-400">✓</span> Answer complex questions
              </li>
              <li className="flex items-center gap-1">
                <span className="text-green-400">✓</span> Generate video captions
              </li>
              <li className="flex items-center gap-1">
                <span className="text-green-400">✓</span> Explain complex concepts
              </li>
              <li className="flex items-center gap-1">
                <span className="text-green-400">✓</span> Provide creative ideas
              </li>
              <li className="flex items-center gap-1">
                <span className="text-green-400">✓</span> Save and load conversations
              </li>
              <li className="flex items-center gap-1">
                <span className="text-green-400">✓</span> Help with content creation
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

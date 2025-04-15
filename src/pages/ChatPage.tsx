
import React from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatBot from '@/components/ChatBot';

const ChatPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950/40 to-black">
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
        <Button
          variant="ghost"
          className="mb-6 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-950/50"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Chat with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">ChatGPT</span>
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <ChatBot />
        </div>
        
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

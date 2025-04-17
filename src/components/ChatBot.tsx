import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, RefreshCw, Brain, PanelRight, Save, Check, Trash, ListVideo } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { resetContext, saveConversation, loadConversation, deleteConversation, getSavedConversations } from '@/utils/botResponseGenerator';
import { toast } from 'sonner';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isCaption?: boolean;
  needsFeedback?: boolean;
  approved?: boolean;
  isOptions?: boolean;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasPromptPrefix, setHasPromptPrefix] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [conversationName, setConversationName] = useState('');
  const [savedConversations, setSavedConversations] = useState<{id: string, name: string}[]>([]);
  const [showConversationsPanel, setShowConversationsPanel] = useState(false);
  const [clipCount, setClipCount] = useState(0);
  const [showGenerateCaptionsButton, setShowGenerateCaptionsButton] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [awaitingFeedback, setAwaitingFeedback] = useState(false);
  
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      content: "Hello! I'm your AI assistant powered by ChatGPT. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    
    setSavedConversations(getSavedConversations());
    
    // Check for uploaded media clips
    checkForUploadedClips();
    
    // Set up an interval to periodically check for new clips
    const intervalId = setInterval(checkForUploadedClips, 3000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const checkForUploadedClips = () => {
    try {
      // Try to find clip cards in the DOM first
      const clipCards = document.querySelectorAll('.clip-card, [data-clip-type]');
      
      if (clipCards && clipCards.length > 0) {
        console.log(`Found ${clipCards.length} clip cards in the DOM`);
        if (clipCards.length !== clipCount) {
          setClipCount(clipCards.length);
          localStorage.setItem('actualClipCount', clipCards.length.toString());
          
          // Only show the generate button if we have clips and conversation content
          setShowGenerateCaptionsButton(clipCards.length > 0 && messages.length > 1);
        }
        return;
      }
      
      // If no DOM elements found, check localStorage
      const mediaClipsJSON = localStorage.getItem('mediaClips');
      if (mediaClipsJSON) {
        const mediaClips = JSON.parse(mediaClipsJSON);
        if (Array.isArray(mediaClips)) {
          const validClips = mediaClips.filter(clip => clip && typeof clip === 'object');
          console.log(`Found ${validClips.length} valid uploaded clips in localStorage`);
          
          if (validClips.length !== clipCount) {
            setClipCount(validClips.length);
            localStorage.setItem('actualClipCount', validClips.length.toString());
            
            // Only show the generate button if we have clips and conversation content
            setShowGenerateCaptionsButton(validClips.length > 0 && messages.length > 1);
          }
        }
      }
    } catch (error) {
      console.error("Error counting clips:", error);
    }
  };

  useEffect(() => {
    if (clipCount > 0 && messages.length > 1) {
      setShowGenerateCaptionsButton(true);
    }
  }, [clipCount, messages.length]);

  const callChatGPT = async (userMessage: string): Promise<string> => {
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      const clipCountInfo = `[Context: The user has uploaded ${clipCount} video clips that need TikTok-style captions.]`;
      
      const systemPrompt = `You are a professional TikTok storytelling expert. Create a continuous narrative across all clips that:
1. Tells ONE cohesive story from start to finish
2. Makes each caption flow naturally into the next
3. Creates a perfect voiceover-ready script
4. Uses exactly 2 emojis per caption
5. Generate EXACTLY ${clipCount} connected captions, numbered from 1 to ${clipCount}
6. Each caption MUST be exactly 10 words (except the last caption which should be shorter)
7. Match this format, but make it ONE continuous story:

1. "Watch me transform this basic hoodie into something special 🎯 Ready? ✨"
2. "See this clever design feature I added right here 🔥 Amazing! 💫"
${clipCount > 2 ? `${clipCount}. "Get yours now at 75% off! 🛍️ Limited time! 💥"` : ""}

Story Structure Rules:
- First clip: Hook and introduce the topic (10 words)
- Middle clips: Build the story with connected points (10 words)
- Last clip: Short call-to-action (5-7 words)
- Each caption should lead naturally to the next
- Create anticipation for what's coming next
- Make it feel like ONE continuous voiceover

Rules for emojis:
- Place first emoji after 7-8 words
- Place second emoji at the very end
- Use trending emojis like: 🤔 ✨ 🎯 💫 🔥 💪 🎧 ✈️ 😍 💥
- Never use more than 2 emojis per caption

Each caption must be:
- Numbered with a period (1., 2., etc.)
- Wrapped in double quotes
- End with exclamation mark and emoji
- Connected to previous and next captions
- Exactly 10 words (except last caption)
- Separated by newlines

Example of continuous flow with word count:
1. "Let me show you this amazing hoodie I found 🤔 Watch! ✨" (10 words)
2. "Now check out the special feature hidden right here 🎯 Look! 💫" (10 words)
3. "Get yours now at 75% off today! 🛍️ Hurry! 💥" (7 words)`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...conversationHistory,
            {
              role: "user",
              content: userMessage.startsWith("Make TikTok viral captions") 
                ? `${userMessage} (Generate exactly ${clipCount} captions)`
                : `Create exactly ${clipCount} viral TikTok captions in the specified format for: ${userMessage}`
            }
          ],
          temperature: 0.7,
          max_tokens: Math.max(800, clipCount * 100), // Increase token limit for more captions
          presence_penalty: 0.6,
          frequency_penalty: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(errorData.error?.message || "Failed to get response from ChatGPT");
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling ChatGPT:", error);
      return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await callChatGPT(input);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
        needsFeedback: response.includes('1.') && response.includes('"')
      };
      
      setMessages(prev => [...prev, botMessage]);
      setAwaitingFeedback(botMessage.needsFeedback);
      
      // If this response contains captions, automatically apply them
      if (botMessage.needsFeedback && clipCount > 0) {
        await generateCaptionsForClips(botMessage.id);
      }
      
      checkForUploadedClips();
      
      if (clipCount > 0) {
        setShowGenerateCaptionsButton(true);
      }
    } catch (error) {
      toast.error("Something went wrong with the AI response");
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, approved: isPositive, needsFeedback: false }
        : msg
    ));
    setAwaitingFeedback(false);

    if (!isPositive) {
      // If feedback is negative, provide options for regeneration
      const feedbackOptions: ChatMessage = {
        id: Date.now().toString(),
        content: `I can help adjust the captions. What would you like me to do?

Choose an option:
1️⃣ Make captions longer (more detailed)
2️⃣ Make captions shorter (more concise)
3️⃣ Keep same length but different style
4️⃣ Start over with new captions

Or tell me specifically what you'd like to change about them.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, feedbackOptions]);

      // Add the options buttons message
      const optionsMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'OPTION_BUTTONS',
        sender: 'bot',
        timestamp: new Date(),
        isOptions: true
      };
      setMessages(prev => [...prev, optionsMessage]);
    }
  };

  const handleRegenerateCaptions = async (option: string) => {
    setIsGeneratingCaptions(true);
    let prompt = '';
    
    switch(option) {
      case 'longer':
        prompt = `Create ${clipCount} longer, more detailed TikTok captions that tell a continuous story. Add more context and description while keeping the viral style!`;
        break;
      case 'shorter':
        prompt = `Create ${clipCount} shorter, punchier TikTok captions that tell a continuous story. Make them more concise but keep the viral impact!`;
        break;
      case 'same':
        prompt = `Create ${clipCount} fresh TikTok captions with the same length but a different creative approach. Keep the continuous story flow!`;
        break;
      case 'new':
        prompt = `Create ${clipCount} completely new TikTok captions with a fresh perspective and continuous story. Start over with a new creative direction!`;
        break;
    }

    try {
      const response = await callChatGPT(prompt);
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
        needsFeedback: true
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      if (clipCount > 0) {
        await generateCaptionsForClips(botMessage.id);
      }
    } catch (error) {
      toast.error("Failed to regenerate captions. Please try again.");
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.isOptions) {
      return (
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          <Button
            onClick={() => handleRegenerateCaptions('longer')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
            disabled={isGeneratingCaptions}
          >
            1️⃣ Longer Captions
          </Button>
          <Button
            onClick={() => handleRegenerateCaptions('shorter')}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
            disabled={isGeneratingCaptions}
          >
            2️⃣ Shorter Captions
          </Button>
          <Button
            onClick={() => handleRegenerateCaptions('same')}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2"
            disabled={isGeneratingCaptions}
          >
            3️⃣ Same Length, New Style
          </Button>
          <Button
            onClick={() => handleRegenerateCaptions('new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2"
            disabled={isGeneratingCaptions}
          >
            4️⃣ Start Over
          </Button>
        </div>
      );
    }

    return (
      <div
        className={`p-3 rounded-lg ${
          message.sender === 'user'
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : message.isCaption 
              ? 'bg-gradient-to-r from-blue-800 to-indigo-800 text-white rounded-tl-none'
              : 'bg-gray-800 text-gray-100 rounded-tl-none'
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {message.needsFeedback && !message.approved && (
          <div className="mt-2 flex gap-2">
            <Button
              onClick={() => handleFeedback(message.id, true)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1"
            >
              Yes 👍
            </Button>
            <Button
              onClick={() => handleFeedback(message.id, false)}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
            >
              No 👎
            </Button>
          </div>
        )}
      </div>
    );
  };

  const clearChat = () => {
    resetContext();
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      content: "Chat cleared! How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setShowGenerateCaptionsButton(false);
    toast.success("Chat history cleared");
  };

  const handleSaveConversation = () => {
    if (!conversationName.trim()) {
      toast.error("Please enter a name for this conversation");
      return;
    }
    
    const conversationId = saveConversation(messages, conversationName);
    setSavedConversations(getSavedConversations());
    setShowSaveDialog(false);
    setConversationName('');
    toast.success("Conversation saved successfully");
  };

  const handleLoadConversation = (id: string) => {
    const loadedMessages = loadConversation(id);
    if (loadedMessages) {
      setMessages(loadedMessages);
      toast.success("Conversation loaded");
      
      if (clipCount > 0 && loadedMessages.length > 1) {
        setShowGenerateCaptionsButton(true);
      }
    } else {
      toast.error("Failed to load conversation");
    }
    setShowConversationsPanel(false);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
    setSavedConversations(getSavedConversations());
    toast.success("Conversation deleted");
  };
  
  const generateCaptionsForClips = async (messageId?: string) => {
    if (clipCount <= 0) {
      toast.error("No clips found. Please upload video clips first.");
      return;
    }
    
    setIsGeneratingCaptions(true);
    
    try {
      // Get clips from localStorage
      const mediaClipsJSON = localStorage.getItem('mediaClips');
      if (!mediaClipsJSON) {
        toast.error("Could not find uploaded clips data");
        return;
      }

      const mediaClips = JSON.parse(mediaClipsJSON);
      if (!Array.isArray(mediaClips) || mediaClips.length === 0) {
        toast.error("No valid clips found");
        return;
      }

      // Get the specific message if messageId is provided, otherwise get the last bot message
      const targetMessage = messageId 
        ? messages.find(msg => msg.id === messageId)
        : [...messages].reverse().find(msg => msg.sender === 'bot' && msg.content.includes('"'));
      
      if (!targetMessage) {
        toast.error("No captions found in the conversation.");
        return;
      }

      const captionsResponse = targetMessage.content;
      localStorage.setItem('lastCaptionsResponse', captionsResponse);

      const generatedCaptions: {[key: string]: string} = {};
      
      // Split into lines and process each line
      const lines = captionsResponse.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Process each line looking for the exact format: number. "caption with emojis!"
      for (const line of lines) {
        const captionMatch = line.match(/^(\d+)\.\s*[""]([^""]+)[""]/);
        if (captionMatch) {
          const captionNumber = parseInt(captionMatch[1]);
          let captionText = captionMatch[2].trim();
          
          // Ensure the caption has exactly two emojis
          const emojiCount = (captionText.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
          if (emojiCount === 2 && captionNumber <= mediaClips.length) {
            generatedCaptions[captionNumber] = captionText;
          }
        }
      }

      // Ensure we have captions
      if (Object.keys(generatedCaptions).length > 0) {
        localStorage.setItem('generatedCaptions', JSON.stringify(generatedCaptions));
        localStorage.setItem('hasNewAiCaptions', 'true');
        localStorage.setItem('captionStyle', 'tiktok');
        
        // Save the first caption separately
        const firstCaption = generatedCaptions[1];
        if (firstCaption) {
          localStorage.setItem('firstClipCaption', firstCaption);
        }

        // Create a success message showing the parsed captions
        const captionsPreview = Object.entries(generatedCaptions)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([index, caption]) => {
            const clipNumber = parseInt(index);
            return `${clipNumber}. "${caption}"`;
          })
          .join('\n\n');

        const captionsMessage: ChatMessage = {
          id: Date.now().toString(),
          content: `✅ Applied captions to your clips:\n\n${captionsPreview}\n\nAre these captions what you wanted?`,
          sender: 'bot',
          timestamp: new Date(),
          isCaption: true,
          needsFeedback: true
        };
        
        setMessages(prev => [...prev, captionsMessage]);
        setAwaitingFeedback(true);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('chatgpt-captions-extracted'));
        
        toast.success(`Successfully applied ${Object.keys(generatedCaptions).length} captions to your clips!`);
      } else {
        toast.error("Could not extract valid captions. Please ensure each caption has exactly two emojis.");
      }
    } catch (error) {
      console.error("Error generating captions:", error);
      toast.error("Failed to generate captions. Please try again.");
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const captionStyles = [
    {
      icon: "🎬",
      label: "Regular TikTok Style",
      prompt: "Make TikTok viral captions with emojis for: "
    },
    {
      icon: "👀",
      label: "POV Style",
      prompt: "Create POV-style TikTok captions for: "
    },
    {
      icon: "🏆",
      label: "Top 5 List",
      prompt: "Make a Top 5 TikTok list about: "
    },
    {
      icon: "🍿",
      label: "Story Time",
      prompt: "Create Story time TikTok captions about: "
    },
    {
      icon: "🔥",
      label: "Trending Style",
      prompt: "Make trending TikTok captions about: "
    },
    {
      icon: "💡",
      label: "Educational",
      prompt: "Create educational TikTok captions about: "
    },
    {
      icon: "😱",
      label: "Reaction Style",
      prompt: "Make reaction-style TikTok captions for: "
    }
  ];

  // Update the handleInputFocus function to provide better TikTok context
  const handleInputFocus = () => {
    if (!input.trim()) {
      setInput("Make TikTok viral captions with emojis for: ");
      
      // Move cursor to end of input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = inputRef.current.value.length;
          inputRef.current.selectionEnd = inputRef.current.value.length;
        }
      }, 0);
    }
  };

  const handleStyleSelect = (prompt: string) => {
    setInput(prompt);
    // Move cursor to end of input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = inputRef.current.value.length;
        inputRef.current.selectionEnd = inputRef.current.value.length;
      }
    }, 0);
  };

  // Add a handler for when input is cleared
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // Reset hasPromptPrefix when input is cleared
    if (!e.target.value.trim()) {
      setHasPromptPrefix(false);
    }
  };

  return (
    <div className="flex flex-col max-w-[600px] w-full mx-auto rounded-xl border border-indigo-500/30 shadow-xl overflow-hidden bg-black/70 backdrop-blur-sm">
      <div className="bg-indigo-900/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="Bot Avatar" />
            <AvatarFallback className="bg-indigo-600 text-white">AI</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white">ChatGPT</h3>
            <p className="text-xs text-indigo-200">AI-powered conversation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-indigo-200 hover:text-white hover:bg-indigo-800"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save this conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-indigo-200 hover:text-white hover:bg-indigo-800"
                  onClick={() => setShowConversationsPanel(!showConversationsPanel)}
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View saved conversations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-indigo-200 hover:text-white hover:bg-indigo-800"
                  onClick={clearChat}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear chat history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-grow">
        <div className={`flex-grow p-4 overflow-y-auto h-[400px] bg-gradient-to-b from-black/40 to-indigo-950/20 ${showConversationsPanel ? 'w-2/3' : 'w-full'}`}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex gap-2 max-w-[80%]">
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-indigo-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {renderMessage(message)}

                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-purple-600 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-indigo-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-gray-800 text-gray-100 rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {showGenerateCaptionsButton && clipCount > 0 && (
              <div className="flex justify-center my-4">
                <Button
                  onClick={() => generateCaptionsForClips()}
                  disabled={isGeneratingCaptions}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {isGeneratingCaptions ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Generating Captions...
                    </>
                  ) : (
                    <>
                      <ListVideo className="mr-2 h-4 w-4" />
                      Analyze Clips and Generate Captions ({clipCount})
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {showConversationsPanel && (
          <div className="w-1/3 bg-gray-900 border-l border-indigo-500/30 overflow-y-auto h-[400px]">
            <div className="p-3 border-b border-indigo-500/30">
              <h3 className="text-sm font-medium text-white">Saved Conversations</h3>
            </div>
            {savedConversations.length > 0 ? (
              <div className="p-2 space-y-2">
                {savedConversations.map((conv) => (
                  <div 
                    key={conv.id}
                    onClick={() => handleLoadConversation(conv.id)}
                    className="p-2 rounded-md cursor-pointer hover:bg-indigo-900/50 text-indigo-200 flex justify-between items-center"
                  >
                    <span className="text-sm truncate">{conv.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-indigo-300 hover:text-red-400 hover:bg-transparent"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-indigo-300/60 text-sm">
                No saved conversations yet
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-indigo-500/30 bg-gray-900/50">
        <div className="flex gap-2">
          <div className="flex-grow relative flex gap-1">
            <Input
              ref={inputRef}
              placeholder="Describe your video..."
              value={input}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="bg-black/30 border-indigo-500/30 text-white w-full"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-full px-2 text-indigo-200 hover:text-white hover:bg-indigo-800 border border-indigo-500/30"
                >
                  <ListVideo className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[320px] p-2 bg-gray-900 border border-indigo-500/30"
                align="start"
              >
                <div className="space-y-1">
                  {captionStyles.map((style, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-indigo-600/20 text-indigo-200 flex items-center gap-2 transition-colors"
                      onClick={() => handleStyleSelect(style.prompt)}
                    >
                      <span className="text-lg">{style.icon}</span>
                      <span>{style.label}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={isTyping || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-indigo-300/60 text-center">
          <p>Powered by ChatGPT • Try asking for help with your content!</p>
        </div>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-gray-900 border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Save Conversation</DialogTitle>
            <DialogDescription className="text-indigo-300">
              Give this conversation a name to save it for later.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Conversation name..."
            value={conversationName}
            onChange={(e) => setConversationName(e.target.value)}
            className="bg-black/30 border-indigo-500/30 text-white mt-2"
          />
          <DialogFooter>
            <Button
              onClick={handleSaveConversation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatBot;

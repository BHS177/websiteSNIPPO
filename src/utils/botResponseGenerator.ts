
import { generateRandomResponse } from './responseGenerator';

interface ContextInfo {
  lastTopic: string | null;
  conversationCount: number;
  userInfo: Record<string, string>;
}

let lastTopic: string | null = null;
const conversationContext: string[] = [];
const userInfo: Record<string, string> = {};

export const generateBotResponse = (input: string): string => {
  conversationContext.push(`User: ${input}`);
  const response = processInput(input);
  conversationContext.push(`Bot: ${response}`);
  return response;
};

export const getContextInfo = (): ContextInfo => {
  return {
    lastTopic: lastTopic,
    conversationCount: conversationContext.length,
    userInfo: userInfo
  };
};

export const resetContext = (): void => {
  lastTopic = null;
  conversationContext.length = 0;
  Object.keys(userInfo).forEach(key => delete userInfo[key]);
  localStorage.removeItem('savedConversations');
  localStorage.removeItem('tiktokCaptionRequest');
};

export const saveConversation = (messages: any[], name: string): string => {
  const conversationId = Date.now().toString();
  let savedConversations = JSON.parse(localStorage.getItem('savedConversations') || '[]');
  
  savedConversations.push({
    id: conversationId,
    name: name,
    messages: messages
  });
  
  localStorage.setItem('savedConversations', JSON.stringify(savedConversations));
  return conversationId;
};

export const loadConversation = (id: string): any[] | null => {
  let savedConversations = JSON.parse(localStorage.getItem('savedConversations') || '[]');
  const conversation = savedConversations.find((conv: any) => conv.id === id);
  return conversation ? conversation.messages : null;
};

export const deleteConversation = (id: string): void => {
  let savedConversations = JSON.parse(localStorage.getItem('savedConversations') || '[]');
  savedConversations = savedConversations.filter((conv: any) => conv.id !== id);
  localStorage.setItem('savedConversations', JSON.stringify(savedConversations));
};

export const getSavedConversations = (): {id: string, name: string}[] => {
  let savedConversations = JSON.parse(localStorage.getItem('savedConversations') || '[]');
  return savedConversations.map((conv: any) => ({ id: conv.id, name: conv.name }));
};

const countUploadedClips = (): number => {
  try {
    const clipCards = document.querySelectorAll('.clip-card, [data-clip-type]');
    if (clipCards && clipCards.length > 0) {
      console.log(`Found ${clipCards.length} clip cards in the DOM`);
      return clipCards.length;
    }
    
    const mediaClipsJSON = localStorage.getItem('mediaClips');
    if (!mediaClipsJSON) {
      console.log('No media clips found in localStorage');
      return 0;
    }
    
    const mediaClips = JSON.parse(mediaClipsJSON);
    if (!Array.isArray(mediaClips)) {
      console.log('mediaClips is not an array', mediaClips);
      return 0;
    }
    
    const validClips = mediaClips.filter(clip => clip && typeof clip === 'object');
    console.log(`Found ${validClips.length} valid uploaded clips in localStorage`);
    
    const storedCount = parseInt(localStorage.getItem('actualClipCount') || '0');
    if (storedCount > 0 && storedCount !== validClips.length) {
      console.log(`Using stored clip count: ${storedCount} (localStorage count: ${validClips.length})`);
      return storedCount;
    }
    
    return validClips.length;
  } catch (error) {
    console.error("Error counting uploaded clips:", error);
    return 0;
  }
};

const processInput = (input: string): string => {
  input = input.trim();
  
  // Automatically detect if user is describing video content
  // We'll assume most messages are about video content unless they clearly aren't
  const isVideoDescription = !input.toLowerCase().startsWith("my name is") && 
                           !input.toLowerCase().startsWith("i like") &&
                           !input.toLowerCase().includes("what do you remember") &&
                           !input.toLowerCase().includes("clear memory");
  
  if (isVideoDescription) {
    // Extract useful context from input
    lastTopic = input;
    conversationContext.push(`User described video content: ${input}`);
    
    // Count clips automatically
    const actualClipCount = countUploadedClips();
    console.log(`Detected ${actualClipCount} clips for caption generation`);
    
    if (actualClipCount <= 0) {
      return `I'd love to generate TikTok captions for your content about "${input}", but I don't see any clips uploaded yet. Please upload your clips first, then I'll generate perfect captions for each one!`;
    }
    
    // Store the request info
    localStorage.setItem('tiktokCaptionRequest', JSON.stringify({
      topic: input,
      clipCount: actualClipCount,
      timestamp: Date.now()
    }));
    
    // Update clip count in localStorage
    localStorage.setItem('actualClipCount', actualClipCount.toString());
    
    // Generate a response that acknowledges the description and counts the clips
    let response = `Perfect! I'll create ${actualClipCount} viral TikTok-style captions based on your content about "${input}" 🔥\n\n`;
    
    response += generateThemedCaptionsResponse(input, actualClipCount);
    
    // Store the full response for later extraction if needed
    localStorage.setItem('lastCaptionsResponse', response);
    
    return response;
  }
  
  if (input.toLowerCase().startsWith("my name is")) {
    const name = input.substring("my name is".length).trim();
    userInfo["name"] = name;
    return `Nice to meet you, ${name}! I'll remember that. Feel free to describe your TikTok content whenever you're ready, and I'll generate captions for each of your clips.`;
  }
  
  if (input.toLowerCase().startsWith("i like")) {
    const like = input.substring("i like".length).trim();
    userInfo["likes"] = like;
    return `Great! I'll remember that you like ${like}. This will help me create better captions for your TikTok videos. Ready to describe your content?`;
  }

  if (input.toLowerCase().includes("what do you remember")) {
    let response = "I remember:\n";
    if (userInfo["name"]) response += `Your name is ${userInfo["name"]}\n`;
    if (userInfo["likes"]) response += `You like ${userInfo["likes"]}\n`;
    if (lastTopic) response += `Your last video was about: ${lastTopic}\n`;
    return response || "I don't remember anything specific yet. Describe your TikTok content and I'll create captions for each clip!";
  }
  
  if (input.toLowerCase().includes("clear memory")) {
    resetContext();
    return "I've cleared my memory. Let's start fresh with your TikTok content!";
  }

  // Fallback for other inputs
  return generateRandomResponse(input);
};

const generateThemedCaptionsResponse = (topic: string, clipCount: number): string => {
  const responses = [
    `Ready for viral TikTok captions? Here are ${clipCount} professional captions for your video about ${topic} 🚀🔥\n\n`,
    `I've crafted ${clipCount} engaging TikTok captions for your ${topic} content that will boost engagement! ✨\n\n`,
    `About to go viral? Here are ${clipCount} TikTok captions for your ${topic} content that will get you noticed 🔥👇\n\n`
  ];
  
  let response = responses[Math.floor(Math.random() * responses.length)];
  
  // TikTok-optimized caption purposes for each clip
  const clipPurposes = [
    { title: `The Hook 🔥`, desc: `Grab attention in the first 3 seconds` },
    { title: `The Problem 😩`, desc: `Identify the pain point` },
    { title: `The Solution 💡`, desc: `Reveal your amazing answer` },
    { title: `The Proof 📊`, desc: `Show evidence it works` },
    { title: `The Tutorial 📝`, desc: `How-to demonstration` },
    { title: `The Reveal 🤯`, desc: `Surprising outcome or result` },
    { title: `The Testimonial 👍`, desc: `Social proof from others` },
    { title: `The Call-to-Action 🔊`, desc: `What viewers should do next` },
    { title: `Behind the Scenes 🎬`, desc: `Show your process` },
    { title: `Quick Tips 💯`, desc: `Valuable hacks for your audience` }
  ];
  
  for (let i = 1; i <= clipCount; i++) {
    const clipPurpose = clipPurposes[(i - 1) % clipPurposes.length];
    const title = generateClipTitle(topic, i);
    
    if (i === 1) {
      response += `Clip ${i}: ${clipPurpose.title} - ${title} 💯\n`;
      const firstCaption = generateEnhancedCaption(topic, i);
      localStorage.setItem('firstClipCaption', firstCaption);
      response += `${firstCaption} #${topic.replace(/\s+/g, '')} #viral #fyp\n\n`;
    } else {
      response += `Clip ${i}: ${clipPurpose.title} - ${title} 💯\n`;
      response += `${generateEnhancedCaption(topic, i)} #${topic.replace(/\s+/g, '')} #viral #fyp\n\n`;
    }
  }
  
  return response;
};

const generateClipTitle = (topic: string, index: number): string => {
  const titleTemplates = [
    `The ${topic} Everyone's Talking About`,
    `Why ${topic} Is Going Viral on TikTok`,
    `How to Experience ${topic} in 30 Seconds`,
    `${topic} Tips Nobody Tells You`,
    `The Truth About ${topic} Revealed`,
    `${topic} Secrets That Will Change Everything`,
    `${topic} Challenge Blowing Up`,
    `${topic} Transformation That Shocked Everyone`,
    `${topic} Hack That Saved Me`,
    `What ${topic} Looks Like IRL`,
    `How I Found the Best ${topic}`,
    `${topic} Mistakes You're Making`
  ];
  
  return titleTemplates[index % titleTemplates.length];
};

const generateRandomCaption = (topic: string): string => {
  const captions = [
    `Just discovered the real truth about ${topic}! Mind = blown 🤯`,
    `This ${topic} hack is the only one you need! Game-changer 💯`,
    `POV: When ${topic} changes everything overnight 🔥`,
    `The ${topic} secret I've been gatekeeping until now 🤐`,
    `No one is talking about this ${topic} trend and it's WILD 👀`
  ];
  return captions[Math.floor(Math.random() * captions.length)];
};

const generateEnhancedCaption = (topic: string, index: number): string => {
  const captionTypes = [
    // Hook captions (for first clip)
    [
      `🔥 "The ${topic} trend that's about to take over your FYP! Watch till end!"`,
      `👑 "POV: Discovering ${topic} for the first time and it changes EVERYTHING"`,
      `✨ "This ${topic} hack literally made me gasp. Saving you months of time!"`
    ],
    // Middle content captions
    [
      `💡 "I tested this ${topic} method for a week and the results are UNMATCHED"`,
      `✨ "No because why did nobody tell me about ${topic} sooner?? Life-changing."`,
      `📊 "Every single person needs to know this about ${topic} right now"`
    ],
    // Final/CTA captions
    [
      `💯 "This ${topic} approach will blow your mind!! Comments for part 2!"`,
      `🚀 "Don't sleep on this ${topic} technique! Truly changed my life."`,
      `🔔 "The ${topic} secret that took me years to discover. Save this!!"`
    ]
  ];
  
  const emojis = ["🔥", "💯", "🙌", "✨", "👀", "💰", "🚀", "👑", "💪", "🤯"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  let captionSetIndex = 1;
  if (index === 1) captionSetIndex = 0;
  else if (index % 5 === 0) captionSetIndex = 2;
  
  const captionSet = captionTypes[captionSetIndex];
  const baseCaption = captionSet[Math.floor(Math.random() * captionSet.length)];
  
  const trendingPhrases = [
    "No, because seriously...",
    "I was today years old when I found out",
    "POV: When you finally discover",
    "This is your sign to",
    "The way I GASPED when",
    "Living for this",
    "Rent free in my mind:"
  ];
  
  if (index === 1) {
    return baseCaption + " " + randomEmoji;
  }
  
  if (Math.random() < 0.4) {
    const phrase = trendingPhrases[Math.floor(Math.random() * trendingPhrases.length)];
    return `${phrase} ${baseCaption} ${randomEmoji}`;
  }
  
  return baseCaption + " " + randomEmoji;
};

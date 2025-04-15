import { toast } from "sonner";

// Types for caption analysis
interface IntentAnalysis {
  purpose: string;
  audience: string;
  tone: string;
  keyPoints: string[];
  needsClarification: boolean;
  clarificationQuestions?: string[];
  videoType?: string;
  contentCategory?: string;
  includesOffer?: boolean;
  offerDetails?: string;
  location?: string;
  emotion?: string;
}

interface CaptionSuggestion {
  text: string;
  style?: string;
  reason?: string;
}

// Analyze user intent from their description
export const analyzeUserIntent = (userDescription: string): IntentAnalysis => {
  // Initialize with default values
  const analysis: IntentAnalysis = {
    purpose: "unknown",
    audience: "general",
    tone: "casual",
    keyPoints: [],
    needsClarification: false,
    clarificationQuestions: [],
    videoType: "informational",
    contentCategory: "general",
    includesOffer: false
  };

  if (!userDescription || userDescription.trim().length < 5) {
    analysis.needsClarification = true;
    analysis.clarificationQuestions = [
      "Could you provide more details about your video content?",
      "What's the main message you want to convey in your caption?",
      "Who is your target audience for this content?"
    ];
    return analysis;
  }

  // Convert to lowercase for easier pattern matching
  const lowerDesc = userDescription.toLowerCase();

  // Detect purpose
  if (lowerDesc.includes("sell") || lowerDesc.includes("product") || 
      lowerDesc.includes("buy") || lowerDesc.includes("purchase") || 
      lowerDesc.includes("offer")) {
    analysis.purpose = "promotional";
    analysis.videoType = "product";
  } else if (lowerDesc.includes("teach") || lowerDesc.includes("learn") || 
             lowerDesc.includes("how to") || lowerDesc.includes("tutorial")) {
    analysis.purpose = "educational";
    analysis.videoType = "tutorial";
  } else if (lowerDesc.includes("entertain") || lowerDesc.includes("funny") || 
             lowerDesc.includes("laugh") || lowerDesc.includes("comedy")) {
    analysis.purpose = "entertainment";
    analysis.videoType = "entertainment";
  } else if (lowerDesc.includes("motivate") || lowerDesc.includes("inspire") ||
             lowerDesc.includes("success") || lowerDesc.includes("achieve")) {
    analysis.purpose = "motivational";
    analysis.videoType = "motivational";
  }

  // Detect audience
  if (lowerDesc.includes("teen") || lowerDesc.includes("young") || 
      lowerDesc.includes("youth") || lowerDesc.includes("gen z")) {
    analysis.audience = "young adults";
  } else if (lowerDesc.includes("professional") || lowerDesc.includes("business") || 
             lowerDesc.includes("corporate") || lowerDesc.includes("entrepreneur")) {
    analysis.audience = "professionals";
  } else if (lowerDesc.includes("parent") || lowerDesc.includes("mom") || 
             lowerDesc.includes("dad") || lowerDesc.includes("family")) {
    analysis.audience = "parents";
  } else if (lowerDesc.includes("muslim") || lowerDesc.includes("islamic") || 
             lowerDesc.includes("halal")) {
    analysis.audience = "muslim";
    analysis.contentCategory = "islamic";
  }

  // Detect tone
  if (lowerDesc.includes("funny") || lowerDesc.includes("humorous") || 
      lowerDesc.includes("joke") || lowerDesc.includes("laugh")) {
    analysis.tone = "humorous";
  } else if (lowerDesc.includes("serious") || lowerDesc.includes("professional") || 
             lowerDesc.includes("formal")) {
    analysis.tone = "serious";
  } else if (lowerDesc.includes("inspirational") || lowerDesc.includes("motivational") ||
             lowerDesc.includes("inspire") || lowerDesc.includes("motivate")) {
    analysis.tone = "inspirational";
  } else if (lowerDesc.includes("informative") || lowerDesc.includes("educational") ||
             lowerDesc.includes("learn") || lowerDesc.includes("teach")) {
    analysis.tone = "informative";
  }

  // Extract key points
  const sentences = userDescription.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const keyPoints = sentences.map(s => s.trim()).filter(s => s.length > 10);
  
  if (keyPoints.length > 0) {
    analysis.keyPoints = keyPoints.slice(0, Math.min(5, keyPoints.length));
  } else {
    // If we couldn't extract key points, we need clarification
    analysis.needsClarification = true;
    analysis.clarificationQuestions?.push("Could you break down the main points you want to highlight in your video?");
  }

  // Detect content category more extensively
  const categories = {
    islamic: ["muslim", "islam", "halal", "quran", "ramadan", "eid", "masjid", "prayer"],
    business: ["hustle", "business", "entrepreneur", "money", "income", "earnings", "profit", "startup"],
    motivation: ["motivation", "inspire", "success", "achieve", "goals", "dreams", "mindset"],
    fitness: ["workout", "exercise", "gym", "fitness", "health", "muscle", "training", "diet"],
    beauty: ["makeup", "beauty", "skincare", "cosmetic", "fashion", "style", "hair", "outfit"],
    travel: ["travel", "vacation", "trip", "destination", "hotel", "flight", "tourism", "beach"],
    food: ["recipe", "cooking", "food", "meal", "dinner", "breakfast", "ingredient", "chef"],
    tech: ["tech", "gadget", "iphone", "android", "app", "software", "computer", "ai"]
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      analysis.contentCategory = category;
      break;
    }
  }

  // Detect if there's an offer
  const offerTerms = ["discount", "off", "sale", "free", "offer", "limited time", "deal", "promotion"];
  analysis.includesOffer = offerTerms.some(term => lowerDesc.includes(term));
  
  if (analysis.includesOffer) {
    // Extract offer details
    const offerMatches = userDescription.match(/(\$\d+|\d+%|\d+ percent|free|discount)/i);
    if (offerMatches) {
      analysis.offerDetails = offerMatches[0];
    }
  }

  // Detect location if mentioned
  const locationMatches = userDescription.match(/(?:in|at|to|visit|travel to)\s+([A-Z][a-z]+ ?(?:[A-Z][a-z]+)?)/);
  if (locationMatches && locationMatches[1]) {
    analysis.location = locationMatches[1];
  }

  // Detect emotion/feeling
  const emotions = {
    excitement: ["exciting", "amazing", "wow", "incredible", "awesome"],
    urgency: ["hurry", "limited", "don't miss", "act now", "soon"],
    curiosity: ["secret", "discover", "reveal", "hidden", "unknown"],
    satisfaction: ["satisfaction", "happy", "pleased", "content", "enjoy"]
  };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      analysis.emotion = emotion;
      break;
    }
  }

  // Check if we need more clarification
  if (!analysis.purpose || analysis.purpose === "unknown" || analysis.keyPoints.length === 0) {
    analysis.needsClarification = true;
    
    if (!analysis.purpose || analysis.purpose === "unknown") {
      analysis.clarificationQuestions?.push("What's the main purpose of your video - to sell, educate, entertain, or inspire?");
    }
    
    if (analysis.keyPoints.length === 0) {
      analysis.clarificationQuestions?.push("What are the key points or messages you want to highlight in your video?");
    }
  }

  return analysis;
};

// Generate an optimized caption based on analysis
export const analyzeAndGenerateCaption = (
  userDescription: string,
  specificClipContext?: string
): CaptionSuggestion[] => {
  // Analyze user intent
  const analysis = analyzeUserIntent(userDescription);
  
  // If we need clarification, return guidance instead of captions
  if (analysis.needsClarification) {
    toast.info("Need more information to create the perfect caption", {
      description: "Please provide more details about your video content"
    });
    
    return [{
      text: "I need more details to create the perfect caption. Could you tell me more about your video content?",
      style: "clarification",
      reason: "More information needed for a tailored caption"
    }];
  }
  
  // Generate captions based on the analysis
  const suggestions: CaptionSuggestion[] = [];
  
  // Create a hook based on purpose and tone - enhanced for TikTok style
  let hook = "";
  if (analysis.purpose === "promotional") {
    if (analysis.includesOffer && analysis.offerDetails) {
      hook = `Get ${analysis.offerDetails} OFF! Limited time only! 🔥`;
    } else {
      hook = "You NEED to see this! 👀 Game-changer alert!";
    }
  } else if (analysis.purpose === "educational") {
    hook = "This is what NOBODY tells you about... 🤯";
  } else if (analysis.purpose === "entertainment") {
    hook = "Wait for it... 😂 You won't believe what happens next!";
  } else if (analysis.purpose === "motivational") {
    hook = "This changed EVERYTHING for me... ✨ Life-changing!";
  } else {
    hook = "You have to see this! 👀 #viral";
  }
  
  // Add location if available
  if (analysis.location) {
    if (analysis.contentCategory === "travel") {
      hook = `${analysis.location} travel hack NO ONE talks about! 🤯✈️`;
    } else {
      hook = `${analysis.location} ${hook}`;
    }
  }
  
  // Create TikTok-style caption variations based on content category
  if (analysis.contentCategory === "islamic") {
    suggestions.push({
      text: `${hook} ${analysis.keyPoints[0] || "Amazing Islamic content!"} 🕌 #islam #muslim`,
      style: "islamic",
      reason: "Tailored for Islamic content with appropriate emojis and hashtags"
    });
    
    suggestions.push({
      text: `POV: When you discover ${analysis.keyPoints[0] || "beautiful Islamic wisdom"} 💫 #islamic`,
      style: "islamic-alt",
      reason: "Alternative Islamic-focused caption with POV format popular on TikTok"
    });
  } else if (analysis.contentCategory === "business") {
    suggestions.push({
      text: `${hook} ${analysis.keyPoints[0] || "Game-changing business tip!"} 💼 #business #entrepreneur`,
      style: "business",
      reason: "Business-focused with professional tone and relevant hashtags"
    });
    
    suggestions.push({
      text: `The business hack that made me $10k in a week 🤑 ${analysis.keyPoints[0] || "Must-watch for entrepreneurs"}`,
      style: "business-viral",
      reason: "High-engagement business caption with monetary hook"
    });
  } else if (analysis.contentCategory === "travel") {
    suggestions.push({
      text: `${hook} ${analysis.keyPoints[0] || "Must-see travel destination!"} 🌍✈️ #travel #wanderlust`,
      style: "travel",
      reason: "Travel-themed with destination focus and wanderlust appeal"
    });
    
    suggestions.push({
      text: `POV: You discover ${analysis.location || "this hidden gem"} that's not on TikTok yet 😍 #travel`,
      style: "travel-pov",
      reason: "Travel POV format that performs well on TikTok"
    });
  } else {
    // General purpose TikTok caption with viral formatting
    suggestions.push({
      text: `${hook} ${analysis.keyPoints[0] || "You'll thank me later!"} #fyp #viral`,
      style: "general",
      reason: "Attention-grabbing hook with viral hashtags"
    });
    
    // Add a more TikTok-specific format
    suggestions.push({
      text: `No because why did nobody tell me about this sooner?? 😱 ${analysis.keyPoints[0] || "Mind blown!"} #foryou`,
      style: "tiktok-trending",
      reason: "Using trending TikTok speech patterns for higher engagement"
    });
  }
  
  // Add a caption with a question format to engage viewers - TikTok style
  let question = "";
  if (analysis.contentCategory === "fitness") {
    question = "Struggling with your fitness goals?";
  } else if (analysis.contentCategory === "beauty") {
    question = "Want the PERFECT makeup look?";
  } else if (analysis.contentCategory === "business") {
    question = "Tired of the 9-5 grind?";
  } else if (analysis.contentCategory === "islamic") {
    question = "Looking for halal ways to improve your life?";
  } else {
    question = "Ever wondered how to level up your life?";
  }
  
  suggestions.push({
    text: `${question} 👇 ${analysis.keyPoints[0] || "Watch this to find out!"} #learnontiktok`,
    style: "question",
    reason: "Question format to engage viewers and encourage watching"
  });
  
  // Add a highly viral TikTok-style caption that uses trending phrases
  const trendingPhrases = [
    "The way I GASPED when I saw this...",
    "I was today years old when I found out...",
    "POV: When you finally discover...",
    "This is your sign to...",
    "Literally obsessed with this...",
    "Not me discovering that..."
  ];
  
  const randomPhrase = trendingPhrases[Math.floor(Math.random() * trendingPhrases.length)];
  
  suggestions.push({
    text: `${randomPhrase} ${analysis.keyPoints[0] || "game-changing hack"} 🤯 #tiktokmademebuyit`,
    style: "viral-phrase",
    reason: "Using the most current viral TikTok phrases for maximum engagement"
  });
  
  return suggestions;
};

// Function to generate clarifying questions when needed
export const generateClarifyingQuestions = (userDescription: string): string[] => {
  const analysis = analyzeUserIntent(userDescription);
  
  if (analysis.needsClarification && analysis.clarificationQuestions && analysis.clarificationQuestions.length > 0) {
    return analysis.clarificationQuestions;
  }
  
  // Default questions if none were generated
  return [
    "Could you provide more details about your video content?",
    "What's the main message you want to convey?",
    "Who is your target audience for this video?"
  ];
};

export default {
  analyzeUserIntent,
  analyzeAndGenerateCaption,
  generateClarifyingQuestions
};

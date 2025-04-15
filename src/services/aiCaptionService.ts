
import { toast } from "sonner";
import { AdProductType } from "@/types/video";

/**
 * Enhanced AI caption service for creating viral TikTok captions
 * based on content descriptions and clip context
 */

interface CaptionContextData {
  clipPosition: number;
  clipDuration: number;
  clipCount: number;
  isIntro: boolean;
  isOutro: boolean;
  description: string;
}

// Detect content type from description
const detectContentType = (description: string): 'product' | 'travel' | 'experience' | 'review' | 'tutorial' | 'tech' => {
  const lowerDesc = description.toLowerCase();
  
  // Check for travel related keywords
  if (lowerDesc.match(/(travel|vacation|trip|tour|visit|country|city|destination|hotel|flight|beach|mountain|dubai|paris|tokyo|bali)/)) {
    return 'travel';
  }
  
  // Check for experience related keywords
  if (lowerDesc.match(/(experience|event|concert|festival|show|performance|movie|game|party)/)) {
    return 'experience';
  }
  
  // Check for review related keywords
  if (lowerDesc.match(/(review|tried|testing|honest|opinion|thoughts|rating)/)) {
    return 'review';
  }
  
  // Check for tutorial related keywords
  if (lowerDesc.match(/(how to|tutorial|guide|step by step|learn|diy|tips|tricks)/)) {
    return 'tutorial';
  }
  
  // Check for tech/AI related keywords
  if (lowerDesc.match(/(ai|artificial intelligence|tech|technology|app|digital|software|gadget|robot)/)) {
    return 'tech';
  }
  
  // Default to product
  return 'product';
};

// Extract key aspects from content description
const extractKeyAspects = (description: string): string[] => {
  if (!description) return [];
  
  const aspects: string[] = [];
  const contentType = detectContentType(description);
  
  // Extract specific words or phrases based on content type
  const keywords = {
    travel: ['beautiful', 'stunning', 'amazing', 'breathtaking', 'paradise', 'dream', 'bucket list'],
    product: ['quality', 'comfortable', 'convenient', 'affordable', 'stylish', 'effective'],
    experience: ['fun', 'exciting', 'memorable', 'unique', 'unbelievable', 'mind-blowing'],
    tech: ['innovative', 'futuristic', 'powerful', 'game-changing', 'revolutionary'],
    review: ['honest', 'tested', 'tried', 'worth it', 'recommend', 'genuine'],
    tutorial: ['easy', 'simple', 'effective', 'life-changing', 'helpful', 'useful']
  };
  
  // Get keywords for detected content type
  const relevantKeywords = keywords[contentType as keyof typeof keywords] || keywords.product;
  
  // Find matching keywords in description
  relevantKeywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword.toLowerCase())) {
      aspects.push(keyword);
    }
  });
  
  // Extract locations for travel content
  if (contentType === 'travel') {
    const locations = ['Dubai', 'Paris', 'Tokyo', 'New York', 'London', 'Bali', 'Switzerland'];
    locations.forEach(location => {
      if (description.includes(location)) {
        aspects.push(location);
      }
    });
  }
  
  // Extract product types for product content
  if (contentType === 'product') {
    const products = ['phone', 'gadget', 'clothing', 'makeup', 'skincare', 'fitness', 'home'];
    products.forEach(product => {
      if (description.toLowerCase().includes(product)) {
        aspects.push(product);
      }
    });
  }
  
  // Ensure we have at least some aspects
  if (aspects.length === 0) {
    const words = description.split(' ');
    // Find nouns/adjectives (simple approach: words with 4+ letters)
    for (let i = 0; i < words.length && aspects.length < 3; i++) {
      if (words[i].length > 4) {
        aspects.push(words[i]);
      }
    }
  }
  
  return [...new Set(aspects)].slice(0, 5); // Return unique aspects, max 5
};

// Generate hook phrases that stop scrolling
const generateViralHooks = (contentType: string, keyAspects: string[]): string[] => {
  const universalHooks = [
    "WAIT until you see this... 😳🔥",
    "STOP scrolling! You won't believe this! 👀",
    "I was TODAY years old when I found this... 🤯",
    "Nobody is talking about this, but you should! 🤯",
    "This will change how you see everything! 💯"
  ];
  
  const aspect = keyAspects.length > 0 ? keyAspects[0] : contentType;
  
  const typeSpecificHooks: Record<string, string[]> = {
    'product': [
      `This ${aspect} is going VIRAL for a reason! 🔥`,
      `I can't believe I didn't find this ${aspect} sooner! 😱`,
      `If you struggle with anything, you NEED this ${aspect}! 🚀`,
      `The way this ${aspect} works is GENIUS... 🧠`,
      `They tried to gatekeep this ${aspect}... 🤫`
    ],
    'travel': [
      `POV: You just landed in ${aspect} 🌴✨`,
      `${aspect} like you've NEVER seen before... 🤯`,
      `This ${aspect} needs to be on your bucket list! 📝`,
      `First time in ${aspect} and I'm OBSESSED! 😍`,
      `Wait for these ${aspect} views... literally INSANE 🏞️`
    ],
    'experience': [
      "I wasn't going to post this but... 👀",
      `This ${aspect} experience changed EVERYTHING! 🤯`,
      "POV: You're about to witness something INCREDIBLE ✨",
      `I've never seen ${aspect} like this before... 😱`,
      "The way I GASPED when this happened! 😮"
    ],
    'tech': [
      `This AI can do things you won't BELIEVE 🤖`,
      `The future is HERE and it's called ${aspect} 📱`,
      `Watch what happens when I try this new ${aspect} tech... 🔮`,
      `This ${aspect} technology is MIND-BLOWING 🧠💥`,
      `They don't want you to know about this ${aspect} AI hack... 🤫`
    ],
    'review': [
      `I tested this ${aspect} for a week and... 👀`,
      `This ${aspect} is either a 10/10 or a COMPLETE fail... 🧐`,
      `Honest ${aspect} review: I was NOT expecting this... 😳`,
      `Is ${aspect} worth the hype? Let's find out... 🔍`,
      `This ${aspect} has 10M views on TikTok, so I bought it 🛒`
    ],
    'tutorial': [
      `The EASIEST way to ${aspect} (took me years to learn) 💡`,
      `This ${aspect} hack will save you SO much time! ⏱️`,
      `Why did no one tell me this ${aspect} trick before?! 🤦‍♀️`,
      `I wish I knew this ${aspect} hack sooner... game changer! 🔄`,
      `The secret ${aspect} trick professionals don't want you to know 🤫`
    ]
  };
  
  // Select hooks based on content type or use universal ones
  const specificHooks = typeSpecificHooks[contentType] || universalHooks;
  return [...universalHooks, ...specificHooks];
};

// Generate middle section phrases
const generateViralMiddle = (contentType: string, keyAspects: string[]): string[] => {
  const aspect = keyAspects.length > 0 ? keyAspects[0] : contentType;
  
  const universalMiddle = [
    `This is what happened when I tried ${aspect}...`,
    `Here's why everyone is obsessed with ${aspect} 🤯`,
    `POV: You just found the best ${aspect} 🏆`,
    `I finally tested ${aspect}… Here's my honest take 👀`,
    `I wish I knew about ${aspect} before… 😱`
  ];
  
  const typeSpecificMiddle: Record<string, string[]> = {
    'product': [
      `The way this ${aspect} works is GENIUS! ⚡️`,
      `This ${aspect} literally changed my daily routine! 🔄`,
      `The QUALITY of this ${aspect} is insane for the price! 💰`,
      `Using this ${aspect} for a month now and... WOW! 😍`,
      `This ${aspect} is easily in my top 3 purchases of ALL TIME! 🛒`
    ],
    'travel': [
      `The views in ${aspect} are UNREAL! No filter needed 📸`,
      `I can't believe places like ${aspect} actually exist! 🌎`,
      `This spot in ${aspect} had me SPEECHLESS! 😶`,
      `The way the sunset hits in ${aspect}... MAGICAL ✨`,
      `You haven't experienced life until you've visited ${aspect} 💫`
    ],
    'experience': [
      "The vibes here are IMMACULATE! ✨",
      `I've never experienced ${aspect} like this before... 🤯`,
      `The way everyone FROZE when this ${aspect} happened! 😲`,
      `This ${aspect} memory will live in my head rent free FOREVER! 🧠`,
      "Main character energy the entire time! 💁‍♀️"
    ],
    'tech': [
      `Watch what happens when I use this ${aspect} AI... 🤯`,
      `This ${aspect} literally does your work for you in SECONDS ⚡️`,
      `I tested this ${aspect} technology against the competition... 📊`,
      `The way this ${aspect} AI understands exactly what I need... 🧠`,
      `This ${aspect} tool is replacing jobs already... are you ready? 👀`
    ]
  };
  
  // Select middle phrases based on content type
  const specificMiddle = typeSpecificMiddle[contentType] || universalMiddle;
  return [...universalMiddle, ...specificMiddle];
};

// Generate call-to-action phrases
const generateViralCTA = (contentType: string): string[] => {
  const universalCTAs = [
    "Would you try this? Comment below! 👇",
    "Tag a friend who NEEDS to see this! 🏷️",
    "Follow for more 🔥 content like this!",
    "Double-tap if this shocked you! 😲",
    "Drop a '🔥' if you agree!"
  ];
  
  const typeSpecificCTAs: Record<string, string[]> = {
    'product': [
      "Comment YES if you want the link! 💬",
      "Link in bio before it sells out AGAIN! 🏃‍♀️",
      "Save this for later, thank me later! 🙏",
      "Guess the price before watching part 2! 💰",
      "Have you tried this? Thoughts? 🤔"
    ],
    'travel': [
      "Would you visit here? 🧳",
      "Rate this view 1-10! 📸",
      "Save this spot for your next vacation! ✈️",
      "Guess which country this is! 🌍",
      "Next travel plans? Drop them below 👇"
    ],
    'tech': [
      "Future or dystopia? Thoughts? 💭",
      "Are you ready for this technology? 👀",
      "What would YOU create with this AI? 🤖",
      "Tech enthusiasts NEED to share this! ⚡",
      "Rate this tech 1-10! 📱"
    ]
  };
  
  // Add standard hashtags based on content type
  let hashtags = " #fyp #viral #foryou";
  
  if (contentType === 'travel') {
    hashtags = " #travel #wanderlust #traveltok";
  } else if (contentType === 'product') {
    hashtags = " #tiktokmademebuyit #amazonfinds #need";
  } else if (contentType === 'tech') {
    hashtags = " #tech #ai #future";
  }
  
  // Select CTAs based on content type
  const specificCTAs = typeSpecificCTAs[contentType] || universalCTAs;
  
  // Combine CTAs with hashtags
  return [...universalCTAs, ...specificCTAs].map(cta => cta + hashtags);
};

// Generate viral TikTok captions based on clip position
const generateViralTikTokCaption = (context: CaptionContextData): string => {
  if (!context.description) {
    return "You need to add a description first! 🔥 #fyp #viral";
  }
  
  // Analyze content
  const contentType = detectContentType(context.description);
  const keyAspects = extractKeyAspects(context.description);
  
  // Generate caption parts based on content type
  const hooks = generateViralHooks(contentType, keyAspects);
  const middles = generateViralMiddle(contentType, keyAspects);
  const ctas = generateViralCTA(contentType);
  
  // Select caption based on clip position
  if (context.isIntro) {
    // Intro clip gets a hook
    return hooks[Math.floor(Math.random() * hooks.length)];
  } else if (context.isOutro) {
    // Outro clip gets a call-to-action
    return ctas[Math.floor(Math.random() * ctas.length)];
  } else {
    // Middle clips get middle content
    const position = context.clipPosition % middles.length;
    return middles[position];
  }
};

// Main function to generate a caption
export const generateAICaption = async (
  clipPosition: number = 0,
  clipDuration: number = 5,
  clipCount: number = 1
): Promise<string> => {
  try {
    // Get description from localStorage
    const description = localStorage.getItem('productDescription');
    if (!description) {
      toast.error("No description found", {
        description: "Please add a description first to generate viral captions."
      });
      return "";
    }
    
    // Determine if this is an intro or outro clip
    const isIntro = clipPosition === 0;
    const isOutro = clipPosition === clipCount - 1;
    
    // Create context data
    const contextData: CaptionContextData = {
      clipPosition,
      clipDuration,
      clipCount,
      isIntro,
      isOutro,
      description
    };
    
    // Generate viral caption based on context
    return generateViralTikTokCaption(contextData);
  } catch (error) {
    console.error("Error generating AI caption:", error);
    toast.error("Failed to generate caption", {
      description: "Please try again or write your own caption."
    });
    return "";
  }
};

export default {
  generateAICaption,
  detectContentType,
  extractKeyAspects
};

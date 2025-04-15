// src/services/tiktokCaptionGenerator.ts

import { toast } from "sonner";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const MAX_RETRIES = 2;

export const getMaskedApiKey = (): string => "Pre-configured";

// Enhanced sanitization for better caption quality
export const sanitizeCaption = (text: string): string => {
  if (!text) return "";
  
  return text
    // Remove timestamps and time references
    .replace(/\s*AM\s*/gi, '')
    .replace(/\s*PM\s*/gi, '')
    .replace(/\b\d{1,2}:\d{2}\s*[AP]M\b/gi, '')
    
    // Remove AI-style responses
    .replace(/feel\s+free.+/gi, '')
    .replace(/let\s+me\s+know.+/gi, '')
    .replace(/if\s+you\s+need.+/gi, '')
    .replace(/hope\s+this\s+helps.+/gi, '')
    .replace(/is\s+there\s+anything.+/gi, '')
    
    // Remove markdown formatting
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    
    // Clean up quotes and spacing
    .replace(/^\s*["'""'']|["'""'']\s*$/g, '')
    .replace(/\s+/g, ' ')
    
    // Ensure proper emoji spacing
    .replace(/([^\s])([\u{1F300}-\u{1F9FF}])/gu, '$1 $2')
    .replace(/([\u{1F300}-\u{1F9FF}])([^\s])/gu, '$1 $2')
    
    .trim();
};

// Retry wrapper for API calls
const retryApiCall = async (apiCall: () => Promise<Response>): Promise<Response> => {
  const maxRetries = 3;
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw lastError;
};

const detectContentType = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes("business") || lowerDesc.includes("product") || lowerDesc.includes("service")) {
    return "business";
  } else if (lowerDesc.includes("tutorial") || lowerDesc.includes("how to") || lowerDesc.includes("guide")) {
    return "tutorial";
  } else if (lowerDesc.includes("lifestyle") || lowerDesc.includes("day in") || lowerDesc.includes("vlog")) {
    return "lifestyle";
  }
  return "general";
};

const createSystemPrompt = (description: string): string => {
  const contentType = detectContentType(description);
  const prompts = {
    business: `You are a viral TikTok business caption expert. Create engaging captions that:
- Start with powerful hooks (POV, Watch how, The secret to...)
- Use business emojis strategically (💼📈💰🎯💡)
- Keep captions short and punchy (max 8-10 words)
- Focus on value and results
- Match Gen Z business tone`,

    tutorial: `You are a viral TikTok tutorial caption expert. Create engaging captions that:
- Start with tutorial hooks (Life Hack, Pro Tip, Quick Guide...)
- Use teaching emojis strategically (✨💡🔍🎯💪)
- Keep steps clear and concise (max 8-10 words)
- Focus on transformation and benefits
- Match Gen Z learning style`,

    lifestyle: `You are a viral TikTok lifestyle caption expert. Create engaging captions that:
- Start with lifestyle hooks (POV, Day in Life, Watch This...)
- Use trendy emojis strategically (✨🌟💫🤍🫶)
- Keep captions relatable and authentic (max 8-10 words)
- Focus on experiences and emotions
- Match Gen Z lifestyle tone`,

    general: `You are a viral TikTok caption expert. Create engaging captions that:
- Start with viral hooks (POV, Wait for it, The way that...)
- Use relevant emojis strategically (2-3 per caption)
- Keep captions short and impactful (max 8-10 words)
- Focus on emotional connection
- Match Gen Z tone and trends`
  };

  return prompts[contentType] + `

Each caption MUST:
1. Start with a viral hook (POV, Watch how, The secret to...)
2. Include 2-3 strategically placed emojis that match the content
3. Be max 8-10 words for perfect TikTok length
4. Use Gen Z language and tone
5. Focus on emotional impact and relatability
6. NO hashtags - they reduce engagement
7. End with a hook that drives engagement

Format each caption as:
**Caption:** "Main hook + emoji + core message + emoji"
**Clip 1:** "Hook + emoji + message + emoji"
**Clip 2:** "Hook + emoji + message + emoji"

Example captions:
"POV: your boss finds your side hustle 😳💼"
"Watch how I turned $100 into $10k 💰🚀"
"The way he looks at her got me 🥺🫶"
"My toxic trait is literally this 😭✨"
"POV: main character energy hits different 💫🤍"`;
};

export const generateCaptions = async (description: string): Promise<string> => {
  try {
    // Clear previous captions
    void localStorage.removeItem('generatedCaptions');
    void localStorage.removeItem('captionsApplied');
    void localStorage.removeItem('hasNewAiCaptions');

    const systemPrompt = createSystemPrompt(description);

    const response = await retryApiCall(async () => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4",
          temperature: 0.9,
          max_tokens: 800,
          presence_penalty: 0.7,
          frequency_penalty: 0.9,
          messages: [
            { 
              role: "system", 
              content: systemPrompt 
            },
            { 
              role: "user", 
              content: `Create viral TikTok captions about: ${description}. Make them extremely engaging with perfect emoji placement. Focus on emotional impact and Gen Z trends.` 
            }
          ]
        }),
      });
      return res;
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status);
      toast.error("Error generating captions, using creative fallback");
      return getFallbackCaptions(description);
    }

    const data = await response.json();
    let captionContent = sanitizeCaption(data.choices[0].message.content);

    // Store results
    void localStorage.setItem('lastCaptionsResponse', captionContent);
    void localStorage.setItem('hasNewAiCaptions', 'true');
    void localStorage.setItem('captionStyle', 'tiktok');

    const mainCaptionMatch = captionContent.match(/\*\*Caption:\*\*\s*["'""'']?([^"'""''\n]+)["'""'']?/);
    const mainCaption = mainCaptionMatch?.[1]?.trim();

    if (mainCaption) {
      localStorage.setItem('firstClipCaption', mainCaption);
      localStorage.setItem('generatedCaptions', JSON.stringify({ 1: mainCaption }));
    }

    const clipCaptions: Record<number, string> = {};
    const clipRegex = /\*\*Clip\s+(\d+)[:]*\*\*\s*["'""'']?([^"'""''\n]+)["'""'']?/gi;
    let match;

    while ((match = clipRegex.exec(captionContent)) !== null) {
      const num = parseInt(match[1]);
      const text = sanitizeCaption(match[2]);
      clipCaptions[num] = text;
    }

    if (Object.keys(clipCaptions).length > 0) {
      const existing = JSON.parse(localStorage.getItem('generatedCaptions') || '{}');
      localStorage.setItem('generatedCaptions', JSON.stringify({ ...existing, ...clipCaptions }));
    }

    window.dispatchEvent(new CustomEvent('new-captions-generated'));
    return captionContent;
  } catch (error) {
    console.error("Caption generation error:", error);
    toast.error("Failed to connect to OpenAI");
    return getFallbackCaptions(description);
  }
};

export const generateThemedCaptions = async (description: string, clipCount: number): Promise<string[]> => {
  try {
    localStorage.removeItem('generatedCaptions');
    localStorage.removeItem('captionsApplied');
    localStorage.removeItem('hasNewAiCaptions');

    const systemPrompt = createSystemPrompt(description);

    const response = await retryApiCall(() =>
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4",
          temperature: 0.7,
          max_tokens: 800,
          presence_penalty: 0.6,
          frequency_penalty: 0.8,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Create ${clipCount} viral captions about: ${description}` }
          ]
        }),
      })
    );

    if (!response.ok) {
      toast.error("Error generating themed captions, using creative fallback");
      return getFallbackThemedCaptions(description, clipCount);
    }

    const data = await response.json();
    let content = sanitizeCaption(data.choices[0].message.content);
    
    localStorage.setItem('lastCaptionsResponse', content);
    localStorage.setItem('hasNewAiCaptions', 'true');
    localStorage.setItem('captionStyle', 'tiktok');

    const captions: string[] = [];
    const main = content.match(/\*\*Caption:\*\*\s*["'""'']?([^"'""''\n]+)["'""'']?/);
    
    if (main?.[1]) {
      captions.push(sanitizeCaption(main[1].trim()));
    }

    for (let i = 1; i <= clipCount; i++) {
      const match = content.match(new RegExp(`\*\*Clip\s*${i}[:]*\*\*\s*["'""'']?([^"'""''\n]+)["'""'']?`, 'i'));
      
      if (match?.[1]) {
        captions.push(sanitizeCaption(match[1].trim()));
      } else {
        // Creative fallback for missing clips
        captions.push(generateCreativeFallbackCaption(description, i));
      }
    }

    return captions;
  } catch (error) {
    console.error("Themed captions error:", error);
    toast.error("OpenAI connection failed");
    return getFallbackThemedCaptions(description, clipCount);
  }
};

const generateCreativeFallbackCaption = (description: string, clipNumber: number): string => {
  const patterns = [
    `POV: ${description} just changed everything 🤯 #mindblown`,
    `The way this ${description} hack hits different 😤 #viral`,
    `No one talks about this ${description} secret 🤫 #fyp`,
    `Wait until you see this ${description} transformation ✨ #trending`,
    `This ${description} moment will blow your mind 🔥 #foryou`
  ];
  return patterns[clipNumber % patterns.length] || patterns[0];
};

const getFallbackCaptions = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  let templates: string[];

  if (lowerDesc.includes("business") || lowerDesc.includes("product")) {
    templates = [
      `**Caption:** "This ${description} hack will 10x your results 📈💰"
**Clip 1:** "The strategy nobody talks about 🤫 #business"
**Clip 2:** "Watch your success skyrocket 🚀 #entrepreneur"`,
      
      `**Caption:** "How I scaled ${description} to 6 figures 💼🔥"
**Clip 1:** "The game-changing strategy revealed 📊 #success"
**Clip 2:** "Implementation secrets exposed 🎯 #business"`
    ];
  } else if (lowerDesc.includes("tutorial") || lowerDesc.includes("how to")) {
    templates = [
      `**Caption:** "This ${description} trick changed everything 🤯✨"
**Clip 1:** "The secret technique revealed 💡 #tutorial"
**Clip 2:** "Mind-blowing results 🔥 #howto"`,
      
      `**Caption:** "POV: Learning the ${description} hack everyone needs 📝✨"
**Clip 1:** "Step-by-step guide you won't believe 🎯 #learning"
**Clip 2:** "The results speak for themselves 🙌 #educational"`
    ];
  } else {
    templates = [
      `**Caption:** "POV: When you discover ${description} 👀🔥"
**Clip 1:** "No way this actually works 😱 #fyp"
**Clip 2:** "Life will never be the same 🤯 #viral"`,
      
      `**Caption:** "The ${description} secret they don't tell you 🤫✨"
**Clip 1:** "Watch this transformation 💫 #trending"
**Clip 2:** "You won't believe the results 🔥 #foryou"`
    ];
  }

  return templates[Math.floor(Math.random() * templates.length)];
};

const getFallbackThemedCaptions = (description: string, count: number): string[] => {
  const lowerDesc = description.toLowerCase();
  let templates: string[];

  if (lowerDesc.includes("business") || lowerDesc.includes("product")) {
    templates = [
      `${description} success strategy revealed 💼📈 #business`,
      `How to scale ${description} fast 🚀💰 #entrepreneur`,
      `${description} growth hack exposed 📊✨ #success`,
      `Business secrets: ${description} edition 💡💼 #startup`,
      `${description} ROI maximized 📈🎯 #business`
    ];
  } else if (lowerDesc.includes("tutorial") || lowerDesc.includes("how to")) {
    templates = [
      `${description} tutorial you need to see 📝✨ #howto`,
      `Quick guide to mastering ${description} 💡🎯 #tutorial`,
      `${description} secrets revealed 🔍✨ #learning`,
      `Pro tips for ${description} 🏆💫 #education`,
      `${description} masterclass begins 📚🌟 #skills`
    ];
  } else {
    templates = [
      `POV: Discovering ${description} 🤯 #fyp`,
      `This ${description} hack changed everything 😱 #viral`,
      `No one talks about this ${description} trick 🤫 #trending`,
      `${description} will blow your mind 👀🔥 #foryou`,
      `The truth about ${description} revealed ✨ #viral`
    ];
  }

  return Array.from({ length: count }, (_, i) => templates[i % templates.length]);
};

export const configureOpenAI = (): void => toast.success("OpenAI is ready to create viral captions! 🚀");
export const clearOpenAIApiKey = (): void => {};

export default {
  getMaskedApiKey,
  generateCaptions,
  generateThemedCaptions,
  configureOpenAI,
  clearOpenAIApiKey,
  sanitizeCaption
};
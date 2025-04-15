import { toast } from 'sonner';

// Simulated API for development purposes
export const generateClipCaption = async (mediaId: number, userPrompt: string, clipContext: string = ''): Promise<string> => {
  console.log(`Generating caption for media ID ${mediaId} with prompt: "${userPrompt}"`);
  console.log(`Context: ${clipContext}`);
  
  // In production, this would be an actual API call to OpenAI
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Enhanced system prompt based on the provided guidelines
    const systemPrompt = `You are a professional AI assistant specializing in video content creation and captioning.
As an expert in analyzing multimedia content, your task is to generate accurate, engaging, and contextually relevant captions.

The user is describing a media clip (photo or video), and you need to create a unique caption for it based on their description.
The caption should be:
- Dynamic and varied, but consistent with the overall theme
- Well-structured, grammatically correct, and formatted for readability
- Concise yet descriptive, making it easy to understand at a glance
- Adapted to the content type (formal for business, catchy for social media)

${clipContext ? `IMPORTANT CONTEXT ABOUT THIS CLIP: ${clipContext}` : ''}

For your response:
1. Generate a single caption that captures the essence of the media based on the user's description
2. Format the caption text within double-quotes ("Like this")
3. Keep the caption under 150 characters for optimal display`;

    // Connect to the actual OpenAI API
    try {
      // In a real implementation, we would call OpenAI API here
      // For now, we'll simulate a response based on the user prompt
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'sk-demo-key'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 256
        }),
      });
      
      let generatedCaption = "";
      
      if (response.ok) {
        const data = await response.json();
        generatedCaption = data.choices[0].message.content;
        console.log("API generated caption:", generatedCaption);
      } else {
        console.warn("API call failed, using simulated response");
        // Fallback to simulated response if API call fails
        if (userPrompt.toLowerCase().includes('business') || userPrompt.toLowerCase().includes('professional')) {
          generatedCaption = `"${generateBusinessCaption(userPrompt)}"`;
        } else if (userPrompt.toLowerCase().includes('funny') || userPrompt.toLowerCase().includes('humor')) {
          generatedCaption = `"${generateHumorousCaption(userPrompt)}"`;
        } else if (userPrompt.toLowerCase().includes('inspirational') || userPrompt.toLowerCase().includes('motivational')) {
          generatedCaption = `"${generateInspirationalCaption(userPrompt)}"`;
        } else {
          generatedCaption = `"${generateStandardCaption(userPrompt)}"`;
        }
      }
    
      return `Based on your description, here's a caption for this clip: ${generatedCaption}\n\nThis caption has been added to the clip.`;
    } catch (error) {
      console.error("API error:", error);
      // Fallback to simulated response if there's an API error
      let generatedCaption = "";
      
      if (userPrompt.toLowerCase().includes('business') || userPrompt.toLowerCase().includes('professional')) {
        generatedCaption = `"${generateBusinessCaption(userPrompt)}"`;
      } else if (userPrompt.toLowerCase().includes('funny') || userPrompt.toLowerCase().includes('humor')) {
        generatedCaption = `"${generateHumorousCaption(userPrompt)}"`;
      } else if (userPrompt.toLowerCase().includes('inspirational') || userPrompt.toLowerCase().includes('motivational')) {
        generatedCaption = `"${generateInspirationalCaption(userPrompt)}"`;
      } else {
        generatedCaption = `"${generateStandardCaption(userPrompt)}"`;
      }
      
      return `Based on your description, here's a caption for this clip: ${generatedCaption}\n\nThis caption has been added to the clip.`;
    }
  } catch (error) {
    console.error('Error generating caption:', error);
    toast.error('Error generating caption, please try again.');
    return 'Sorry, I encountered an error while generating a caption. Please try again.';
  }
};

// Helper functions to generate various caption styles
function generateBusinessCaption(prompt: string): string {
  const businessCaptions = [
    `Elevating our professional standards through continuous innovation and excellence.`,
    `Building stronger partnerships through transparent communication and shared values.`,
    `Where strategic thinking meets flawless execution. This is how we deliver results.`,
    `Success isn't just about numbers—it's about creating sustainable value for everyone involved.`,
    `Transforming challenges into opportunities with our expert team leading the way.`
  ];
  
  // Customize based on the prompt
  if (prompt.toLowerCase().includes('team')) {
    return `Together we achieve more: Our team turning vision into measurable results daily.`;
  } else if (prompt.toLowerCase().includes('growth')) {
    return `Growth isn't just a goal—it's our continuous journey of improvement and expansion.`;
  } else if (prompt.toLowerCase().includes('innovation')) {
    return `Pioneering tomorrow's solutions with today's innovative thinking and bold actions.`;
  }
  
  return businessCaptions[Math.floor(Math.random() * businessCaptions.length)];
}

function generateHumorousCaption(prompt: string): string {
  const humorousCaptions = [
    `When the coffee kicks in but it's still asking for overtime pay.`,
    `That moment when you realize your weekend plans involve a date with your to-do list.`,
    `Adulting level: Successfully convinced everyone I know what I'm doing.`,
    `My bed is calling and I must go—we have an exclusive relationship.`,
    `I put the "pro" in procrastination and the "mess" in impressive.`
  ];
  
  // Customize based on the prompt
  if (prompt.toLowerCase().includes('work')) {
    return `Working hard or hardly working? Why not exciting third option: pretending to work while daydreaming.`;
  } else if (prompt.toLowerCase().includes('food')) {
    return `My relationship with food is the only stable thing in my life right now.`;
  } else if (prompt.toLowerCase().includes('weekend')) {
    return `Weekend plans: 1% actual plans, 99% thinking about how much I'll miss my bed on Monday.`;
  }
  
  return humorousCaptions[Math.floor(Math.random() * humorousCaptions.length)];
}

function generateInspirationalCaption(prompt: string): string {
  const inspirationalCaptions = [
    `The journey of a thousand miles begins with believing you are worthy of the destination.`,
    `Your potential is endless. Your attitude determines your altitude.`,
    `Don't count the days, make the days count with purpose and passion.`,
    `Fall seven times, stand up eight. Resilience is your superpower.`,
    `Dream bigger, reach higher, become the person you were destined to be.`
  ];
  
  // Customize based on the prompt
  if (prompt.toLowerCase().includes('dream')) {
    return `Dreams don't work unless you do. Turn your vision into reality with daily action.`;
  } else if (prompt.toLowerCase().includes('success')) {
    return `Success isn't owned, it's rented—and the rent is due every day. Keep pushing forward!`;
  } else if (prompt.toLowerCase().includes('challenge')) {
    return `Life's greatest challenges reveal your hidden strengths. Embrace the journey!`;
  }
  
  return inspirationalCaptions[Math.floor(Math.random() * inspirationalCaptions.length)];
}

function generateStandardCaption(prompt: string): string {
  const keywords = prompt.toLowerCase().split(' ');
  
  if (keywords.some(word => ['travel', 'adventure', 'journey', 'explore'].includes(word))) {
    return `Collecting moments, not things. Another adventure in the books! #travelmore`;
  } else if (keywords.some(word => ['food', 'meal', 'dinner', 'lunch', 'breakfast', 'cuisine'].includes(word))) {
    return `Good food, good mood. Savoring every bite of this delicious experience!`;
  } else if (keywords.some(word => ['friend', 'family', 'together', 'celebration'].includes(word))) {
    return `The best memories are made when surrounded by the people who make life worth living.`;
  } else if (keywords.some(word => ['nature', 'outdoor', 'mountain', 'beach', 'forest'].includes(word))) {
    return `Finding peace in nature's embrace. The world has so much beauty to offer.`;
  } else if (keywords.some(word => ['fitness', 'workout', 'exercise', 'gym', 'health'].includes(word))) {
    return `Strong mind, stronger body. Investing in myself one workout at a time.`;
  } else if (keywords.some(word => ['art', 'creative', 'design', 'paint', 'draw'].includes(word))) {
    return `Art is how we decorate space; Music is how we decorate time. Creating beauty everyday.`;
  } else if (keywords.some(word => ['tech', 'technology', 'digital', 'innovation'].includes(word))) {
    return `Embracing the future through technology and innovation. The possibilities are endless.`;
  }
  
  // Default responses for general prompts
  const standardCaptions = [
    `Living my best life one day at a time. Creating memories that will last forever.`,
    `Every moment is a fresh beginning. Embracing all that comes my way!`,
    `The best is yet to come. Stay tuned for the journey ahead!`,
    `Life happens at the edges of your comfort zone. Pushing boundaries daily.`,
    `Authenticity is the daily practice of letting go of who we think we should be and embracing who we are.`
  ];
  
  return standardCaptions[Math.floor(Math.random() * standardCaptions.length)];
}

// Generate themed captions for multiple clips
export const generateThemedCaptions = async (clipCount: number, globalDescription: string): Promise<Record<number, string>> => {
  console.log(`Generating ${clipCount} themed captions about: "${globalDescription}"`);
  
  try {
    // First, check if we have ChatGPT-generated captions already
    const existingCaptions = await getExistingCaptions();
    if (Object.keys(existingCaptions).length > 0) {
      console.log("Using existing captions from ChatGPT conversations:", existingCaptions);
      return existingCaptions;
    }
    
    // If we don't have existing captions, try to generate from OpenAI API
    try {
      // Call OpenAI API to generate themed captions
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'sk-demo-key'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional caption writer for social media and video content. Create engaging, concise captions that will help videos perform well on platforms like TikTok, Instagram, and YouTube. Include relevant hashtags when appropriate.' 
            },
            { 
              role: 'user', 
              content: `Generate ${clipCount} captivating captions for a video about: ${globalDescription}` 
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        console.log("API generated themed captions:", content);
        
        // Parse the API response to extract captions
        const captions: Record<number, string> = {};
        const captionLines = content.split('\n').filter(line => line.trim() !== '');
        
        for (let i = 0; i < Math.min(clipCount, captionLines.length); i++) {
          const line = captionLines[i];
          // Extract caption from numbered list format (like "1. Caption text")
          const match = line.match(/^\d+\.\s*["']?([^"']*)["']?/);
          if (match && match[1]) {
            captions[i + 1] = match[1].trim();
          } else {
            // If not in expected format, just use the whole line
            captions[i + 1] = line.trim();
          }
        }
        
        // Fill in any missing captions if we didn't get enough
        for (let i = 1; i <= clipCount; i++) {
          if (!captions[i]) {
            captions[i] = `${globalDescription} - Part ${i}`;
          }
        }
        
        return captions;
      }
    } catch (error) {
      console.error("API error for themed captions:", error);
    }
    
    // Fallback to simulated captions if API fails
    console.log("Falling back to simulated captions");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const themedCaptions: Record<number, string> = {};
    
    // Determine the theme based on the description
    let captionStyle = 'standard';
    const description = globalDescription.toLowerCase();
    
    if (description.includes('business') || description.includes('professional') || 
        description.includes('corporate') || description.includes('enterprise')) {
      captionStyle = 'business';
    } else if (description.includes('funny') || description.includes('humor') || 
               description.includes('comedy') || description.includes('entertaining')) {
      captionStyle = 'humor';
    } else if (description.includes('inspire') || description.includes('motivate') || 
               description.includes('encourage') || description.includes('uplift')) {
      captionStyle = 'inspirational';
    }
    
    // Generate a different caption for each clip
    for (let i = 1; i <= clipCount; i++) {
      let caption = '';
      
      // First clip often introduces the content
      if (i === 1) {
        if (captionStyle === 'business') {
          caption = `Introducing our innovative approach to ${globalDescription}. Excellence in every detail.`;
        } else if (captionStyle === 'humor') {
          caption = `When ${globalDescription} meets your life... buckle up for the journey! 😂`;
        } else if (captionStyle === 'inspirational') {
          caption = `Embark on a transformative journey with ${globalDescription}. Your potential awaits.`;
        } else {
          caption = `Discover the magic of ${globalDescription}! ✨ #TrendAlert`;
        }
      }
      // Middle clips develop the story
      else if (i < clipCount) {
        if (captionStyle === 'business') {
          const middleBusinessCaptions = [
            `Our commitment to quality makes ${globalDescription} stand out from the competition.`,
            `See how ${globalDescription} can transform your business outcomes.`,
            `The professional choice for ${globalDescription} that delivers results every time.`
          ];
          caption = middleBusinessCaptions[i % middleBusinessCaptions.length];
        } else if (captionStyle === 'humor') {
          const middleHumorCaptions = [
            `Plot twist: ${globalDescription} actually makes life easier! Who knew? 🤯`,
            `Me + ${globalDescription} = a relationship status that's not complicated 😎`,
            `That moment when ${globalDescription} solves all your problems... except finding matching socks.`
          ];
          caption = middleHumorCaptions[i % middleHumorCaptions.length];
        } else if (captionStyle === 'inspirational') {
          const middleInspirationCaptions = [
            `Every step with ${globalDescription} brings you closer to your true potential.`,
            `Transform challenges into opportunities with the power of ${globalDescription}.`,
            `Your journey with ${globalDescription} is uniquely yours. Embrace your path.`
          ];
          caption = middleInspirationCaptions[i % middleInspirationCaptions.length];
        } else {
          const middleStandardCaptions = [
            `Experience the difference with ${globalDescription}! 🙌 #MustTry`,
            `This is how ${globalDescription} changes everything! 💯`,
            `The secret to amazing results? ${globalDescription}! 🔥`
          ];
          caption = middleStandardCaptions[i % middleStandardCaptions.length];
        }
      }
      // Last clip typically has a call to action
      else {
        if (captionStyle === 'business') {
          caption = `Partner with us for ${globalDescription} excellence. Contact us today to elevate your business.`;
        } else if (captionStyle === 'humor') {
          caption = `Don't miss out on ${globalDescription}! Your future self will thank you... and probably laugh too! 😉`;
        } else if (captionStyle === 'inspirational') {
          caption = `Your journey with ${globalDescription} begins now. Take the first step toward transformation today.`;
        } else {
          caption = `Ready to experience ${globalDescription} for yourself? Let's connect! ✨ #LinkInBio`;
        }
      }
      
      themedCaptions[i] = caption;
    }
    
    return themedCaptions;
  } catch (error) {
    console.error('Error generating themed captions:', error);
    toast.error('Failed to generate captions for your clips');
    return {};
  }
};

// New function to get existing captions from chat history and localStorage
const getExistingCaptions = async (): Promise<Record<number, string>> => {
  try {
    const userGeneratedCaptions: Record<number, string> = {};
    let hasRealCaptions = false;
    
    // First check localStorage for previously generated captions
    const savedCaptions = localStorage.getItem('generatedCaptions');
    if (savedCaptions) {
      const parsedCaptions = JSON.parse(savedCaptions);
      
      // Filter out any default welcome messages
      for (const clipId in parsedCaptions) {
        const caption = parsedCaptions[clipId];
        if (caption !== "Hi! Describe what's in this clip and I'll create a unique TikTok caption for it." &&
            caption !== "👋 Tell me about this specific media clip! I'll create a unique caption for it that matches its content.") {
          userGeneratedCaptions[clipId] = caption;
          hasRealCaptions = true;
        }
      }
    }
    
    // Also check chat histories
    const chatHistories = localStorage.getItem('mediaChats');
    if (chatHistories) {
      const parsedChats = JSON.parse(chatHistories);
      
      for (const [mediaIdStr, chatData] of Object.entries(parsedChats)) {
        const mediaId = Number(mediaIdStr);
        const chat = chatData as { 
          messages: Array<{role: string, content: string}>, 
          generatedCaption?: string 
        };
        
        // First check if we have a stored generated caption
        if (chat.generatedCaption && 
            chat.generatedCaption !== "Hi! Describe what's in this clip and I'll create a unique TikTok caption for it." &&
            chat.generatedCaption !== "👋 Tell me about this specific media clip! I'll create a unique caption for it that matches its content.") {
          userGeneratedCaptions[mediaId] = chat.generatedCaption;
          hasRealCaptions = true;
          continue;
        }
        
        // If no stored caption, try to extract from messages
        if (chat.messages && chat.messages.length > 1) {
          for (let i = chat.messages.length - 1; i >= 0; i--) {
            const msg = chat.messages[i];
            if (msg.role === 'assistant' && 
                !msg.content.includes("Hi! Describe what's in this clip") &&
                !msg.content.includes("Tell me about this specific media clip")) {
              // Try to extract caption from quotes
              const captionMatch = msg.content.match(/"([^"]+)"/);
              if (captionMatch && captionMatch[1]) {
                userGeneratedCaptions[mediaId] = captionMatch[1];
                hasRealCaptions = true;
                break;
              } else if (msg.content) {
                // If no quotes, look for "here's a caption" pattern
                const captionPattern = msg.content.match(/here's a caption[^:]*:\s*(.+?)(?:\n|$)/i);
                if (captionPattern && captionPattern[1]) {
                  userGeneratedCaptions[mediaId] = captionPattern[1].trim();
                  hasRealCaptions = true;
                  break;
                } else {
                  // As a last resort, use the entire message
                  userGeneratedCaptions[mediaId] = msg.content;
                  hasRealCaptions = true;
                  break;
                }
              }
            }
          }
        }
      }
    }
    
    return hasRealCaptions ? userGeneratedCaptions : {};
  } catch (error) {
    console.error("Error getting existing captions:", error);
    return {};
  }
};

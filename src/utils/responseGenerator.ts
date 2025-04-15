
// Simple response generator for fallback bot responses

const responseTemplates = [
  "That's interesting! Tell me more about {topic}.",
  "I understand you're interested in {topic}. How can I help?",
  "Thanks for sharing that! What else would you like to know about {topic}?",
  "I'm here to help with {topic}. What specific information are you looking for?",
  "I'd love to learn more about your interest in {topic}.",
  "Got it! {topic} is an interesting topic. What aspect are you most curious about?",
  "I see you're talking about {topic}. How can I assist you with that today?"
];

export const generateRandomResponse = (input: string): string => {
  // Extract a potential topic from the input
  const words = input.split(/\s+/).filter(word => word.length > 3);
  const topic = words.length > 0 
    ? words[Math.floor(Math.random() * words.length)] 
    : "that";
  
  // Select a random template
  const template = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
  
  // Replace the {topic} placeholder with the extracted topic
  return template.replace('{topic}', topic);
};

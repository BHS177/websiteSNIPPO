
import React, { useState } from 'react';
import { BotPersona } from '@/types/video';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Sparkles, 
  Briefcase, 
  SmilePlus, 
  UserCircle2 
} from 'lucide-react';

interface TikTokBotPersonaProps {
  selectedPersona: BotPersona | null;
  onPersonaChange: (persona: BotPersona) => void;
}

// Define the allowed persona style types
type PersonaStyle = 'energetic' | 'casual' | 'professional' | 'funny';

const TikTokBotPersona: React.FC<TikTokBotPersonaProps> = ({ 
  selectedPersona,
  onPersonaChange
}) => {
  // Predefined bot personas inspired by popular TikTok creators
  const botPersonas: BotPersona[] = [
    {
      id: 'energetic-lisa',
      name: 'Energetic Lisa',
      style: 'energetic',
      voiceType: 'female-energetic',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'casual-jake',
      name: 'Casual Jake',
      style: 'casual',
      voiceType: 'male-casual',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'professional-emma',
      name: 'Professional Emma',
      style: 'professional',
      voiceType: 'female-professional',
      avatar: 'https://randomuser.me/api/portraits/women/23.jpg'
    },
    {
      id: 'funny-mike',
      name: 'Funny Mike',
      style: 'funny',
      voiceType: 'male-funny',
      avatar: 'https://randomuser.me/api/portraits/men/51.jpg'
    }
  ];

  const getPersonaIcon = (style: PersonaStyle) => {
    switch (style) {
      case 'energetic': return <Sparkles className="h-4 w-4" />;
      case 'professional': return <Briefcase className="h-4 w-4" />;
      case 'funny': return <SmilePlus className="h-4 w-4" />;
      case 'casual': return <UserCircle2 className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Bot className="h-5 w-5" />
        <h3 className="text-lg font-medium">Choose Your TikTok Bot Persona</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {botPersonas.map(persona => (
          <Card 
            key={persona.id}
            className={`cursor-pointer hover:bg-muted/50 transition-colors ${
              selectedPersona?.id === persona.id ? 'border-primary bg-primary/10' : ''
            }`}
            onClick={() => onPersonaChange(persona)}
          >
            <CardContent className="p-3 flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={persona.avatar} alt={persona.name} />
                <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{persona.name}</div>
                <div className="text-xs flex items-center text-muted-foreground">
                  {getPersonaIcon(persona.style as PersonaStyle)}
                  <span className="ml-1 capitalize">{persona.style} Style</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TikTokBotPersona;

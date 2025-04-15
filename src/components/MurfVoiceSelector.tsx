
import React from 'react';
import VoicemakerVoiceSelector from './VoicemakerVoiceSelector';

interface MurfVoiceSelectorProps {
  selectedVoiceId: string | undefined;
  onVoiceSelect: (voiceId: string) => void;
  disabled?: boolean;
  className?: string;
}

// This component is now just a wrapper around VoicemakerVoiceSelector
// to maintain backward compatibility
const MurfVoiceSelector: React.FC<MurfVoiceSelectorProps> = (props) => {
  return <VoicemakerVoiceSelector {...props} />;
};

export default MurfVoiceSelector;

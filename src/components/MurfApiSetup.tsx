
import React from 'react';
import VoicemakerApiSetup from './VoicemakerApiSetup';

interface MurfApiSetupProps {
  onApiKeySet?: (isValid: boolean) => void;
  minimal?: boolean;
}

// This component is now just a wrapper around VoicemakerApiSetup
// to maintain backward compatibility
const MurfApiSetup: React.FC<MurfApiSetupProps> = (props) => {
  return <VoicemakerApiSetup {...props} />;
};

export default MurfApiSetup;

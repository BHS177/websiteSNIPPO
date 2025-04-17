import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-24',
    xl: 'h-32'
  };

  return (
    <motion.div 
      className={`flex items-center justify-center ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        filter: [
          'brightness(1) drop-shadow(0 0 20px rgba(196, 181, 253, 0.3))',
          'brightness(1.2) drop-shadow(0 0 25px rgba(196, 181, 253, 0.4))',
          'brightness(1) drop-shadow(0 0 20px rgba(196, 181, 253, 0.3))'
        ]
      }}
      transition={{ 
        duration: 1,
        filter: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <motion.div
        whileHover={{ 
          scale: 1.05,
          filter: 'brightness(1.2) drop-shadow(0 0 30px rgba(196, 181, 253, 0.5))'
        }}
        transition={{ duration: 0.3 }}
      >
        <img 
          src="/snippo-logo.svg" 
          alt="SNIPPO.IO" 
          className={`${sizeClasses[size]} w-auto`}
          style={{
            maxWidth: 'none',
            filter: 'brightness(1.1)'
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Logo; 
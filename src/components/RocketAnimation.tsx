
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, animate } from 'framer-motion';
import { Rocket } from 'lucide-react';

const RocketAnimation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const rocketRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  
  const { scrollY } = useScroll();
  
  // Track when we've reached the target section
  const [hasReachedTarget, setHasReachedTarget] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get the factory section element
  useEffect(() => {
    // Type assertion to HTMLDivElement or null to fix the type error
    targetRef.current = document.getElementById('video-factory') as HTMLDivElement | null;
  }, []);

  // Calculate scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!targetRef.current) return;
      
      const factorySection = targetRef.current;
      const factorySectionTop = factorySection.getBoundingClientRect().top + window.scrollY;
      const triggerStart = 0;
      const triggerEnd = factorySectionTop;
      
      // Calculate a smooth progress value between 0 and 1
      const currentProgress = Math.min(Math.max((window.scrollY - triggerStart) / (triggerEnd - triggerStart), 0), 1);
      setProgress(currentProgress);
      
      // When we get close to the target section
      if (window.scrollY >= factorySectionTop - 300) {
        setHasReachedTarget(true);
      } else {
        setHasReachedTarget(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initialize with current scroll position
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transform values based on scroll position - smoother interpolation
  const rocketX = useTransform(
    scrollY,
    [0, document.documentElement.scrollHeight * 0.6],  // Use a percentage of the document height for smoother transitions
    [20, window.innerWidth - 150]  // Adjusted end position to accommodate larger rocket
  );

  const rocketRotate = useTransform(
    scrollY,
    [0, document.documentElement.scrollHeight * 0.6],
    [0, 45]
  );

  // Vertical position that's slightly affected by scroll
  const rocketY = useTransform(
    scrollY,
    [0, document.documentElement.scrollHeight * 0.6],
    [100, 80]  // Move up slightly as it moves right
  );

  return (
    <motion.div
      ref={rocketRef}
      className="fixed z-50 text-purple-500"
      style={{
        top: rocketY,
        x: rocketX,
        rotate: rocketRotate,
      }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut"
      }}
    >
      <motion.div
        className="relative"
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          },
          scale: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }
        }}
      >
        {/* Increased rocket size from 40 to 70 */}
        <Rocket size={70} strokeWidth={1.5} className="text-purple-500" />
        
        {/* Rocket trail/flames with smoother animation - adjusted size */}
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-16"
          initial={{ opacity: 0.7 }}
          animate={{
            height: [16, 24, 16],
            opacity: [0.7, 0.9, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
        >
          <div className="w-full h-full bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full blur-sm" />
        </motion.div>
        
        {/* More dynamic star particles - adjusted for larger rocket */}
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-white rounded-full"
            initial={{ 
              y: 0, 
              x: 0,
              opacity: 0 
            }}
            animate={{ 
              y: [0, Math.random() * 40 + 30], 
              x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 1 + 1,
              repeat: Infinity,
              ease: "easeOut",
              delay: Math.random() * 0.5,
              times: [0, 0.5, 1]
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default RocketAnimation;

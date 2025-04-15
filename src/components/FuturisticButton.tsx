import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from "lucide-react";

interface FuturisticButtonProps extends ButtonProps {
  glowColor?: string;
  hoverScale?: number;
  pulseEffect?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
  persistent?: boolean; // New prop to force visibility
  loading?: boolean;
}

const FuturisticButton = React.forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  ({ 
    glowColor = "rgba(168, 85, 247, 0.8)", 
    hoverScale = 1.03, 
    pulseEffect = true,
    glowIntensity = 'medium',
    className, 
    children,
    persistent = false, // Default to false
    loading = false,
    ...props 
  }, ref) => {
    // Adjust glow settings based on intensity
    const getGlowSettings = () => {
      switch (glowIntensity) {
        case 'low':
          return {
            opacity: [0, 0.6, 0],
            blur: "blur-md",
            boxShadow: [
              "0 0 5px 0px rgba(168, 85, 247, 0.3)",
              "0 0 10px 2px rgba(168, 85, 247, 0.5)",
              "0 0 5px 0px rgba(168, 85, 247, 0.3)"
            ]
          };
        case 'high':
          return {
            opacity: [0, 1, 0],
            blur: "blur-2xl",
            boxShadow: [
              "0 0 15px 2px rgba(168, 85, 247, 0.6)",
              "0 0 30px 8px rgba(168, 85, 247, 0.9)",
              "0 0 15px 2px rgba(168, 85, 247, 0.6)"
            ]
          };
        case 'medium':
        default:
          return {
            opacity: [0, 0.9, 0],
            blur: "blur-xl",
            boxShadow: [
              "0 0 10px 0px rgba(168, 85, 247, 0.4)",
              "0 0 20px 5px rgba(168, 85, 247, 0.7)",
              "0 0 10px 0px rgba(168, 85, 247, 0.4)"
            ]
          };
      }
    };
    
    const glowSettings = getGlowSettings();
    
    return (
      <div className="relative group">
        {/* Enhanced galaxy glow effect */}
        <motion.div
          className={cn(
            `absolute inset-0 rounded-md ${glowSettings.blur} transition-opacity duration-300`,
            persistent ? "opacity-80" : "opacity-0 group-hover:opacity-100"
          )}
          style={{ backgroundColor: glowColor }}
          initial={false}
          animate={
            pulseEffect && !persistent
              ? { 
                  scale: [1, 1.2, 1], 
                  opacity: glowSettings.opacity,
                  boxShadow: glowSettings.boxShadow
                }
              : persistent 
                ? { opacity: 0.8, scale: 1.1 } 
                : { opacity: 0.7 }
          }
          transition={
            pulseEffect && !persistent
              ? { repeat: Infinity, duration: 2 }
              : { duration: 0.3 }
          }
        />
        
        {/* Button with enhanced hover animations */}
        <motion.div 
          whileHover={{ scale: hoverScale }} 
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          whileTap={{ scale: 0.98 }}
          className={persistent ? "animate-pulse" : ""}
        >
          <Button
            ref={ref}
            className={cn(
              "relative overflow-hidden backdrop-blur-sm border-purple-500/50 bg-gradient-to-r from-indigo-900/80 via-purple-800/80 to-indigo-900/80",
              persistent ? "border-2 border-purple-400/80 shadow-lg shadow-purple-600/50" : "",
              className
            )}
            disabled={loading}
            {...props}
          >
            {/* Enhanced shimmer effect */}
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
            </div>
            
            {/* Pulsing border effect */}
            <div className={cn(
              "absolute inset-0 rounded-md border",
              persistent 
                ? "border-purple-500/70 animate-pulse" 
                : "border-purple-500/0 group-hover:border-purple-500/70"
            )} />
            
            {/* Interactive highlight on click */}
            <motion.div 
              className="absolute inset-0 bg-white/0"
              whileTap={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              transition={{ duration: 0.1 }}
            />
            
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              children
            )}
          </Button>
        </motion.div>
      </div>
    );
  }
);

FuturisticButton.displayName = 'FuturisticButton';

export default FuturisticButton;


import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  text?: string;
  className?: string;
}

const AnimatedLogo = ({ 
  size = 'md', 
  color = 'rgba(139, 92, 246, 1)', 
  text = 'Ajwad AI Editor  ', // Added extra space after "Editor"
  className = '' 
}: AnimatedLogoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // Determine dimensions based on size
  const getDimensions = () => {
    switch(size) {
      case 'sm': return { width: 40, height: 40, fontSize: '1rem' };
      case 'lg': return { width: 80, height: 80, fontSize: '1.75rem' };
      case 'xl': return { width: 100, height: 100, fontSize: '2rem' };
      case 'md':
      default: return { width: 60, height: 60, fontSize: '1.5rem' };
    }
  };
  
  const { width, height, fontSize } = getDimensions();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // For retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Logo animation parameters
    const points: { x: number, y: number, vx: number, vy: number, size: number }[] = [];
    const numPoints = 12;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    // Create initial points in a circle
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = Math.random() * 1.5 + 1;
      
      points.push({
        x,
        y,
        vx: Math.random() * 0.4 - 0.2,
        vy: Math.random() * 0.4 - 0.2,
        size
      });
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw connections
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < radius * 1.2) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.strokeStyle = `${color.replace('1)', `${0.2 - (distance / (radius * 1.2)) * 0.2})}`)}`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      // Draw and update points
      for (const point of points) {
        // Keep points within bounds and moving
        if (point.x <= point.size || point.x >= width - point.size) {
          point.vx *= -1;
        }
        if (point.y <= point.size || point.y >= height - point.size) {
          point.vy *= -1;
        }
        
        // Calculate distance from center
        const dx = point.x - centerX;
        const dy = point.y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        // Apply force toward center if too far
        if (distFromCenter > radius * 1.2) {
          point.vx -= dx * 0.001;
          point.vy -= dy * 0.001;
        }
        
        // Apply slight randomness
        if (Math.random() < 0.01) {
          point.vx += (Math.random() - 0.5) * 0.2;
          point.vy += (Math.random() - 0.5) * 0.2;
        }
        
        // Limit velocity
        const maxVel = 0.5;
        const vel = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
        if (vel > maxVel) {
          point.vx = (point.vx / vel) * maxVel;
          point.vy = (point.vy / vel) * maxVel;
        }
        
        // Update position
        point.x += point.vx;
        point.y += point.vy;
        
        // Draw point
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [width, height, color]);
  
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <motion.div 
        className="absolute inset-0" 
        animate={{ 
          boxShadow: [
            `0 0 10px 2px ${color.replace('1)', '0.3)')}`,
            `0 0 20px 5px ${color.replace('1)', '0.5)')}`,
            `0 0 10px 2px ${color.replace('1)', '0.3)')}`
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        style={{ width: `${width}px`, height: `${height}px` }}
        className="rounded-full"
      />
      {text && (
        <motion.span 
          className="ml-3 font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-fuchsia-400 to-purple-400 pr-4" 
          style={{ fontSize }}
          animate={{ 
            textShadow: [
              '0 0 5px rgba(139, 92, 246, 0.3)',
              '0 0 10px rgba(139, 92, 246, 0.6)',
              '0 0 5px rgba(139, 92, 246, 0.3)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
};

export default AnimatedLogo;

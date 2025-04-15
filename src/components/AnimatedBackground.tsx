
import React from 'react';
import { motion } from 'framer-motion';

interface ParticleProps {
  size: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
  delay: number;
}

const Particle: React.FC<ParticleProps> = ({ size, color, position, delay }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top: `${position.y}%`,
        left: `${position.x}%`,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      initial={{ opacity: 0.5, scale: 0.6 }}
      animate={{ 
        opacity: [0.5, 0.9, 0.5],
        scale: [0.6, 1.2, 0.6],
        y: [0, -70, -140],
        x: [0, Math.random() * 30 - 15],
      }}
      transition={{
        duration: 8 + Math.random() * 5,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
    />
  );
};

const GlowingOrb: React.FC<{position: {x: number, y: number}, color: string, size: number, delay: number}> = ({ position, color, size, delay }) => {
  return (
    <motion.div
      className="absolute rounded-full blur-2xl"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top: `${position.y}%`,
        left: `${position.x}%`,
        filter: `blur(${size/8}px)`,
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.7, 0.9, 0.7],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
    />
  );
};

// Star component for the galaxy background
const Star: React.FC<{position: {x: number, y: number}, size: number, opacity: number}> = ({ position, size, opacity }) => {
  return (
    <div 
      className="absolute rounded-full bg-white"
      style={{
        width: size,
        height: size,
        top: `${position.y}%`,
        left: `${position.x}%`,
        opacity: opacity,
        boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)`,
      }}
    />
  );
};

// Nebula component for cosmic clouds
const Nebula: React.FC<{position: {x: number, y: number}, color: string, size: number}> = ({ position, color, size }) => {
  return (
    <motion.div
      className="absolute rounded-full opacity-20 blur-3xl"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top: `${position.y}%`,
        left: `${position.x}%`,
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

const AnimatedLuxuryElements: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-black opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-black/40 to-purple-950/50 opacity-80 animate-gradient-shift" />
      
      {/* Stars - small bright dots */}
      {Array.from({ length: 100 }).map((_, index) => (
        <Star
          key={`star-${index}`}
          position={{
            x: Math.random() * 100,
            y: Math.random() * 100,
          }}
          size={Math.random() * 2 + 1}
          opacity={Math.random() * 0.5 + 0.5}
        />
      ))}
      
      {/* Nebulas - colorful cosmic clouds */}
      <Nebula position={{ x: 20, y: 30 }} color="#bf83ff" size={400} />
      <Nebula position={{ x: 70, y: 60 }} color="#5d3fd3" size={500} />
      <Nebula position={{ x: 30, y: 70 }} color="#a865f7" size={450} />
      
      {/* Glowing orbs with higher opacity and more vibrant colors */}
      <GlowingOrb position={{ x: 10, y: 10 }} color="rgba(168, 85, 247, 0.7)" size={200} delay={0} />
      <GlowingOrb position={{ x: 80, y: 20 }} color="rgba(139, 92, 246, 0.6)" size={300} delay={1} />
      <GlowingOrb position={{ x: 20, y: 70 }} color="rgba(192, 132, 252, 0.7)" size={250} delay={2} />
      <GlowingOrb position={{ x: 70, y: 85 }} color="rgba(216, 180, 254, 0.7)" size={180} delay={1.5} />
      <GlowingOrb position={{ x: 40, y: 40 }} color="rgba(147, 51, 234, 0.6)" size={220} delay={0.5} />
      
      {/* Particles with higher visibility and vibrant colors */}
      {Array.from({ length: 30 }).map((_, index) => {
        const hue = Math.floor(Math.random() * 60) + 240; // Purple-blue hues
        return (
          <Particle
            key={index}
            size={Math.random() * 6 + 4}
            color={`hsla(${hue}, 90%, 70%, ${Math.random() * 0.4 + 0.6})`}
            position={{
              x: Math.random() * 100,
              y: Math.random() * 100,
            }}
            delay={index * 0.2}
          />
        );
      })}
      
      {/* Grid lines with enhanced purple glow */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTY4LDg1LDI0NywwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />
      
      {/* Animated glowing lines */}
      <motion.div 
        className="absolute h-px w-full bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"
        style={{ top: '30%' }}
        animate={{ 
          opacity: [0.5, 0.9, 0.5],
          y: [-5, 5, -5],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute h-px w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"
        style={{ top: '70%' }}
        animate={{ 
          opacity: [0.5, 0.9, 0.5],
          y: [5, -5, 5],
        }}
        transition={{ 
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Vertical glowing lines */}
      <motion.div 
        className="absolute w-px h-full bg-gradient-to-b from-transparent via-purple-500/60 to-transparent"
        style={{ left: '20%' }}
        animate={{ 
          opacity: [0.5, 0.9, 0.5],
          x: [-5, 5, -5],
        }}
        transition={{ 
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute w-px h-full bg-gradient-to-b from-transparent via-indigo-500/60 to-transparent"
        style={{ left: '80%' }}
        animate={{ 
          opacity: [0.5, 0.9, 0.5],
          x: [5, -5, 5],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {/* Cosmic diagonal energy beams */}
      <motion.div 
        className="absolute w-full h-full overflow-hidden"
      >
        <motion.div 
          className="absolute w-px h-[200%] bg-gradient-to-b from-transparent via-purple-500/50 to-transparent origin-top-left"
          style={{ top: '0', left: '30%', transform: 'rotate(45deg)' }}
          animate={{ 
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute w-px h-[200%] bg-gradient-to-b from-transparent via-violet-500/50 to-transparent origin-top-right"
          style={{ top: '0', right: '30%', transform: 'rotate(-45deg)' }}
          animate={{ 
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ 
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </motion.div>
    </div>
  );
};

export default AnimatedLuxuryElements;

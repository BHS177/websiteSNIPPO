import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Atom, Gem, Video, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from '@/components/AnimatedLogo';

const LoadingPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Set up loading progress animation
    const duration = 3000; // 3 seconds
    const interval = 30; // Update every 30ms
    const steps = duration / interval;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep += 1;
      const newProgress = Math.min(100, Math.floor((currentStep / steps) * 100));
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(timer);
        navigate('/home');
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [navigate]);

  // Animated circles
  const circles = Array.from({ length: 8 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full bg-purple-500/10"
      style={{
        width: `${Math.random() * 300 + 100}px`,
        height: `${Math.random() * 300 + 100}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        transform: 'translate(-50%, -50%)'
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.3, 0.1],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: Math.random() * 5 + 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  ));
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {circles}
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
      </div>
      
      <div className="relative z-10 max-w-md w-full text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.div 
            className="inline-flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full p-5 mb-8 backdrop-blur-lg border border-purple-500/20"
            animate={{ 
              boxShadow: [
                "0 0 10px 2px rgba(168, 85, 247, 0.3)", 
                "0 0 20px 5px rgba(139, 92, 246, 0.5)", 
                "0 0 10px 2px rgba(168, 85, 247, 0.3)"
              ]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              ease: "easeInOut" 
            }}
          >
            <AnimatedLogo size="lg" color="rgba(139, 92, 246, 0.8)" text="" />
          </motion.div>
          
          <motion.h1 
            className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut" 
            }}
          >
            SNIPPO.IO
          </motion.h1>
          
          <motion.p 
            className="text-slate-300 mb-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Preparing your premium video experience...
          </motion.p>
        </motion.div>
        
        <div className="relative w-full h-1 mb-8 overflow-hidden rounded-full bg-gray-900">
          <motion.div 
            className="absolute inset-0 h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #4F46E5, #8B5CF6, #A78BFA, #8B5CF6, #4F46E5)",
              backgroundSize: "200% 100%"
            }}
            initial={{ width: 0, backgroundPosition: "0% 0%" }}
            animate={{ 
              width: `${progress}%`,
              backgroundPosition: ["0% 0%", "100% 0%"]
            }}
            transition={{ 
              width: { duration: 0.1, ease: "linear" },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          />
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4">
          <motion.div 
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-purple-500/20"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <Globe className="h-5 w-5 text-purple-400" />
            </motion.div>
            <span className="text-slate-300 text-sm">Initializing luxury video systems</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-indigo-500/20"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <Video className="h-5 w-5 text-indigo-400" />
            </motion.div>
            <span className="text-slate-300 text-sm">Loading premium transitions</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-violet-500/20"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.6 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Sparkles className="h-5 w-5 text-violet-400" />
            </motion.div>
            <span className="text-slate-300 text-sm">Polishing visual effects</span>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-xl" />
    </div>
  );
};

export default LoadingPage;

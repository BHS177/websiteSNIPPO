import React, { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Video, LogIn, LogOut, Bot, Crown, LayoutDashboard } from "lucide-react";
import { Toaster } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import VideoCreativeFactory from "@/components/VideoCreativeFactory";
import Footer from "@/components/Footer";
import FuturisticButton from "@/components/FuturisticButton";
import AnimatedLogo from "@/components/AnimatedLogo";
import RocketAnimation from "@/components/RocketAnimation";
import ChatBot from "@/components/ChatBot";
import SubscriptionModal from "@/components/SubscriptionModal";

// Memoize static components
const MemoizedRocketAnimation = memo(RocketAnimation);
const MemoizedAnimatedLogo = memo(AnimatedLogo);
const MemoizedVideoCreativeFactory = memo(VideoCreativeFactory);
const MemoizedChatBot = memo(ChatBot);
const MemoizedFooter = memo(Footer);

// Optimize background elements
const BackgroundElements = memo(() => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Large glowing orbs */}
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-3xl"
        style={{
          width: Math.random() * 300 + 150,
          height: Math.random() * 300 + 150,
          background: `radial-gradient(circle, rgba(${Math.random() * 100 + 100}, ${Math.random() * 50}, ${Math.random() * 200 + 55}, 0.15), rgba(${Math.random() * 50}, ${Math.random() * 50}, ${Math.random() * 150 + 100}, 0.1))`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        initial={{ opacity: 0 }}
        animate={{
          x: [0, Math.random() * 40 - 20],
          y: [0, Math.random() * 40 - 20],
          scale: [1, Math.random() * 0.4 + 0.8, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: Math.random() * 15 + 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
    
    {/* Reduce number of particles for better performance */}
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={`star-${i}`}
        className="absolute rounded-full bg-white"
        style={{
          width: Math.random() * 2 + 1,
          height: Math.random() * 2 + 1,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.1, 0.8, 0.1],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 3,
        }}
      />
    ))}
  </div>
));

const Index = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, logout } = useAuth();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Memoize callback functions
  const scrollToChat = useCallback(() => {
    document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToVideoFactory = useCallback(() => {
    document.getElementById('video-factory')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="cosmic-bg relative">
      <MemoizedRocketAnimation />
      <BackgroundElements />

      <div className="relative z-10">
        {/* Top buttons */}
        <div className="absolute top-4 right-4 flex gap-3">
          <FuturisticButton
            onClick={scrollToChat} 
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
          >
            <Bot className="h-4 w-4" />
            Chat with Bot
          </FuturisticButton>

          {user ? (
            <>
              <FuturisticButton
                onClick={() => navigate('/dashboard')}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-none"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </FuturisticButton>

              {!user.isSubscribed && user.freeVideosRemaining < 2 && (
                <FuturisticButton
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade ({user.freeVideosRemaining} videos left)
                </FuturisticButton>
              )}
              
              <FuturisticButton
                onClick={logout}
                variant="outline"
                className="gap-2 bg-black/50 border-indigo-500/30 hover:border-indigo-400 text-white"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </FuturisticButton>
            </>
          ) : (
            <FuturisticButton
              onClick={signInWithGoogle}
              variant="outline"
              className="gap-2 bg-black/50 border-indigo-500/30 hover:border-indigo-400 text-white"
            >
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </FuturisticButton>
          )}
        </div>

        <AnimatePresence>
          {/* Hero Section - Full Height */}
          <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
            <div className="flex flex-col items-center justify-center h-full w-full max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center w-full"
              >
                <motion.div
                  className="mb-10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <MemoizedAnimatedLogo 
                    size="xl" 
                    color="rgba(139, 92, 246, 0.8)" 
                    text="Ajwad AI Editor " 
                    className="mx-auto"
                  />
                </motion.div>
                
                <motion.h1 
                  className="text-6xl md:text-8xl font-bold mb-6 mx-auto text-center"
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                  }}
                  transition={{ duration: 1.2 }}
                >
                  <motion.span 
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-fuchsia-400 to-purple-400"
                  >
                    Create
                  </motion.span>{" "}
                  <motion.span 
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-300"
                  >
                    Magic
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto font-light mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  Transform your ideas into stunning video content
                </motion.p>
                
                <motion.div
                  className="flex flex-wrap justify-center gap-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  <FuturisticButton 
                    size="lg" 
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none purple-glow" 
                    onClick={scrollToVideoFactory}
                  >
                    <Video className="h-5 w-5" />
                    Start Creating
                  </FuturisticButton>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Chat Bot Section */}
          <section id="chat-section" className="min-h-screen flex items-center justify-center px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full max-w-6xl relative z-10"
            >
              <div className="mb-10 text-center">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-fuchsia-400 to-purple-400 mb-4">
                  AI Assistant Chat
                </h2>
                <p className="text-xl text-purple-200 max-w-2xl mx-auto">
                  Get creative suggestions and assistance with your video projects
                </p>
              </div>
              <div className="rounded-2xl backdrop-blur-lg p-8 bg-black/40 border border-indigo-500/20 shadow-2xl mb-20"
                   style={{ boxShadow: "0 0 50px rgba(139, 92, 246, 0.3)" }}>
                <MemoizedChatBot />
              </div>
            </motion.div>
          </section>

          {/* Video Factory Section */}
          <section id="video-factory" className="min-h-screen flex items-center justify-center px-4 py-16">
            <MemoizedVideoCreativeFactory />
          </section>
        </AnimatePresence>

        <MemoizedFooter />

        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default memo(Index);

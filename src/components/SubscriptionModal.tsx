import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const handleSubscribe = () => {
    // Replace with your Whop product URL
    window.location.href = `https://whop.com/checkout/${import.meta.env.VITE_WHOP_PRODUCT_ID}?user_id=${user?.uid}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg p-8 rounded-2xl bg-gradient-to-br from-purple-900/90 to-black/90 border border-purple-500/30 shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-fuchsia-300 mb-4">
                Upgrade to Premium
              </h2>
              <p className="text-purple-200 text-lg mb-6">
                Unlock unlimited video creation with our premium subscription
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-purple-200">
                <div className="flex-1 border-b border-purple-500/30"></div>
                <span className="text-2xl font-bold">$30/month</span>
                <div className="flex-1 border-b border-purple-500/30"></div>
              </div>

              <ul className="space-y-4 text-purple-200">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Unlimited video creation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Premium support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Access to all future features
                </li>
              </ul>

              <button
                onClick={handleSubscribe}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 
                         hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold 
                         shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 
                         transition-all duration-300"
              >
                Subscribe Now
              </button>

              <p className="text-center text-purple-300/70 text-sm">
                Secure payment powered by Whop
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal; 
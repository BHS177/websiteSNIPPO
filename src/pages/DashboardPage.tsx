import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Crown, Video, Calendar, AlertCircle, Home, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedLogo from '@/components/AnimatedLogo';
import { useNavigate } from 'react-router-dom';

interface SubscriptionDetails {
  startDate: string;
  endDate: string;
  status: string;
}

const DashboardPage = () => {
  const { user, checkSubscriptionStatus } = useAuth();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!user) return;

      try {
        const response = await fetch(`https://api.whop.com/api/v2/memberships/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_WHOP_API_KEY}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionDetails({
            startDate: new Date(data.created_at).toLocaleDateString(),
            endDate: new Date(data.expires_at).toLocaleDateString(),
            status: data.status
          });
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
    checkSubscriptionStatus();
  }, [user, checkSubscriptionStatus]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-b from-purple-900/50 via-purple-800/30 to-transparent pt-8 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 border border-white/10"
            >
              <Home className="h-5 w-5" />
              <span className="font-semibold">Home</span>
            </motion.button>
            <AnimatedLogo 
              size="md" 
              color="rgba(139, 92, 246, 0.9)" 
              text="Dashboard" 
              className="mx-auto scale-110"
            />
            <div className="w-[100px]" />
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Enhanced Subscription Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-black/50 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:shadow-purple-500/10 transition-shadow duration-500"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <Crown className="h-8 w-8 text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Subscription Status
              </h2>
            </div>
            
            {user?.isSubscribed ? (
              <>
                <div className="flex items-center gap-2 text-green-400 font-medium mb-6">
                  <Star className="h-5 w-5" fill="currentColor" />
                  <span className="text-lg">Premium Member</span>
                </div>
                {subscriptionDetails && (
                  <div className="space-y-4 bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-300" />
                      <span>Started: {subscriptionDetails.startDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-300" />
                      <span>Expires: {subscriptionDetails.endDate}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-yellow-400 font-medium text-lg">
                  <Zap className="h-5 w-5" fill="currentColor" />
                  <span>Free Plan</span>
                </div>
                <div className="flex items-center gap-3 bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                  <Video className="h-5 w-5 text-purple-300" />
                  <span className="text-lg">{user?.freeVideosRemaining} videos remaining</span>
                </div>
                <Button
                  onClick={() => window.location.href = `https://whop.com/checkout/${import.meta.env.VITE_WHOP_PRODUCT_ID}?user_id=${user?.uid}`}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  Upgrade to Premium ($30/month)
                </Button>
              </div>
            )}
          </motion.div>

          {/* Enhanced Usage Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-black/50 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:shadow-purple-500/10 transition-shadow duration-500"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <Video className="h-8 w-8 text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Video Generation
              </h2>
            </div>

            {!user?.isSubscribed && user?.freeVideosRemaining === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-purple-900/20 rounded-xl border border-purple-500/20 p-6">
                <AlertCircle className="h-14 w-14 text-yellow-400 mb-4" />
                <p className="text-yellow-400 font-medium text-lg mb-2">You've used all your free videos</p>
                <p className="text-purple-200/80">Upgrade to premium for unlimited access</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                  <span className="text-lg">Videos Available</span>
                  <span className="font-medium text-lg text-purple-300">
                    {user?.isSubscribed ? 'Unlimited' : `${user?.freeVideosRemaining} remaining`}
                  </span>
                </div>
                {!user?.isSubscribed && (
                  <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
                    <p className="text-lg font-medium mb-4 text-purple-200">Free plan includes:</p>
                    <ul className="space-y-3 text-purple-200/90">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                        2 video generations
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                        Basic features
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                        Standard quality
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 
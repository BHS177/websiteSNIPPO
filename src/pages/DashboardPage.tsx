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
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900/20 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/50 via-purple-800/30 to-transparent pt-8 pb-16 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 border border-purple-500/20"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </motion.button>
            <AnimatedLogo 
              size="md" 
              color="rgba(139, 92, 246, 0.8)" 
              text="Dashboard" 
              className="mx-auto"
            />
            <div className="w-[100px]" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Subscription Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-black/60 rounded-2xl p-8 border border-purple-500/30 shadow-xl hover:shadow-purple-500/10 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Crown className="h-8 w-8 text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Subscription Status
              </h2>
            </div>
            
            {user?.isSubscribed ? (
              <>
                <div className="flex items-center gap-2 text-green-400 font-medium mb-6">
                  <Star className="h-5 w-5" />
                  <span>Premium Member</span>
                </div>
                {subscriptionDetails && (
                  <div className="space-y-4 text-sm bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-purple-300" />
                      <span className="text-purple-100">Started: {subscriptionDetails.startDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-purple-300" />
                      <span className="text-purple-100">Expires: {subscriptionDetails.endDate}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-yellow-400 font-medium">
                  <Star className="h-5 w-5" />
                  <span>Free Plan</span>
                </div>
                <div className="flex items-center gap-3 bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
                  <Video className="h-5 w-5 text-purple-300" />
                  <span className="text-purple-100">{user?.freeVideosRemaining} videos remaining</span>
                </div>
                <Button
                  onClick={() => window.location.href = `https://whop.com/checkout/${import.meta.env.VITE_WHOP_PRODUCT_ID}?user_id=${user?.uid}`}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Upgrade to Premium ($30/month)
                </Button>
              </div>
            )}
          </motion.div>

          {/* Usage Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-black/60 rounded-2xl p-8 border border-purple-500/30 shadow-xl hover:shadow-purple-500/10 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Video className="h-8 w-8 text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Video Generation
              </h2>
            </div>

            {!user?.isSubscribed && user?.freeVideosRemaining === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-purple-900/20 rounded-lg p-6 border border-purple-500/20">
                <AlertCircle className="h-16 w-16 text-yellow-400 mb-4" />
                <p className="text-yellow-400 font-medium text-lg mb-2">You've used all your free videos</p>
                <p className="text-purple-200 mt-2">Upgrade to premium for unlimited access</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <span className="text-purple-200">Videos Available</span>
                  <span className="font-medium text-lg bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    {user?.isSubscribed ? 'Unlimited' : `${user?.freeVideosRemaining} remaining`}
                  </span>
                </div>
                {!user?.isSubscribed && (
                  <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-500/20">
                    <p className="text-lg font-medium text-purple-200 mb-4">Free plan includes:</p>
                    <ul className="space-y-3 text-purple-100">
                      <li className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-purple-400" />
                        2 video generations
                      </li>
                      <li className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-purple-400" />
                        Basic features
                      </li>
                      <li className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-purple-400" />
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
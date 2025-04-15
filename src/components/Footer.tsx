
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Mail, Music, Github, Linkedin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2, rotate: 5, transition: { type: "spring", stiffness: 500 } }
  };

  const confettiVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: (i: number) => ({
      opacity: [1, 0],
      y: [0, -100],
      x: [0, i * 20 - 50],
      rotate: [0, i % 2 === 0 ? 360 : -360],
      transition: { 
        duration: 1.5,
        ease: "easeOut"
      }
    })
  };
  
  return (
    <motion.footer 
      className="relative z-10 pt-16 pb-10 overflow-hidden border-t border-slate-800/50 backdrop-blur-md"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top section with logo and links */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Brand section */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <div className="relative">
              <motion.h3 
                className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
                onClick={() => setShowEasterEgg(true)}
              >
                Ajwad AI Editor
              </motion.h3>
              
              {/* Easter Egg Animation */}
              {showEasterEgg && (
                <div className="absolute top-0 left-0 w-full h-40 overflow-hidden pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{ left: `${i * 10}%`, top: 0 }}
                      custom={i}
                      variants={confettiVariants}
                      initial="hidden"
                      animate="visible"
                      onAnimationComplete={() => {
                        if (i === 9) setShowEasterEgg(false);
                      }}
                    >
                      <Sparkles className={`h-6 w-6 text-${
                        ['purple', 'indigo', 'pink', 'blue', 'green'][i % 5]
                      }-400`} />
                    </motion.div>
                  ))}
                  
                  <motion.div
                    className="absolute top-0 left-0 w-full"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.8],
                      y: [0, -30, -60]
                    }}
                    transition={{ duration: 1.5 }}
                  >
                    <p className="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                      Thank you for visiting! 🎉
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
            <p className="text-slate-400 mb-4">
              Create professional videos with AI assistance in seconds.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-full w-10 h-10 p-0 bg-black/30 hover:bg-black/50 border-white/10">
                <motion.span variants={iconVariants} initial="initial" whileHover="hover">
                  <Music className="h-4 w-4" />
                </motion.span>
              </Button>
              <Button size="sm" variant="outline" className="rounded-full w-10 h-10 p-0 bg-black/30 hover:bg-black/50 border-white/10">
                <motion.span variants={iconVariants} initial="initial" whileHover="hover">
                  <Instagram className="h-4 w-4" />
                </motion.span>
              </Button>
              <Button size="sm" variant="outline" className="rounded-full w-10 h-10 p-0 bg-black/30 hover:bg-black/50 border-white/10">
                <motion.span variants={iconVariants} initial="initial" whileHover="hover">
                  <Twitter className="h-4 w-4" />
                </motion.span>
              </Button>
            </div>
          </motion.div>
          
          {/* Quick links */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <h4 className="font-medium text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Features", "Pricing", "Contact", "About Us"].map((item) => (
                <motion.li key={item} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          {/* Resources */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <h4 className="font-medium text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {["Documentation", "Tutorials", "API", "Support", "Blog"].map((item) => (
                <motion.li key={item} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          {/* Stay updated */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <h4 className="font-medium text-white mb-4">Stay Updated</h4>
            <p className="text-slate-400 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-2 rounded-md bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <Button 
                size="sm" 
                className="absolute right-1 top-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Subscribe
              </Button>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Divider */}
        <motion.div 
          className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        />
        
        {/* Bottom section with copyright */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.p 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            © {currentYear} Ajwad AI Editor. All rights reserved.
          </motion.p>
          
          <div className="flex gap-6">
            {["Terms", "Privacy", "Cookies", "Contact"].map((item) => (
              <motion.a 
                key={item} 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;

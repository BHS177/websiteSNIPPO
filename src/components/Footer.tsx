import React from 'react';
import { motion } from 'framer-motion';
import { Video, Instagram, Twitter, Heart } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
    { name: 'About Us', href: '/about' },
  ];

  const resources = [
    { name: 'Documentation', href: '/docs' },
    { name: 'Tutorials', href: '/tutorials' },
    { name: 'API', href: '/api' },
    { name: 'Support', href: '/support' },
    { name: 'Blog', href: '/blog' },
  ];

  const socialLinks = [
    { name: 'TikTok', icon: Video, href: 'https://tiktok.com/@snippo.io' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/snippo.io' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/snippoio' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-purple-500/20 bg-black/40 backdrop-blur-xl">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-fuchsia-900/20 to-purple-900/20 animate-gradient-x"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo size="sm" className="w-32" />
            <p className="text-purple-200/80 text-sm">
              Describe to AI Assistant your video. Choose shortcuts like "POV" to instantly create engaging content.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-purple-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    className="text-purple-200/70 hover:text-purple-100 text-sm transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-purple-100 mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <motion.a
                    href={resource.href}
                    className="text-purple-200/70 hover:text-purple-100 text-sm transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {resource.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-purple-100 mb-4">Stay Updated</h3>
            <p className="text-purple-200/70 text-sm mb-4">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg 
                         text-purple-100 placeholder-purple-300/50 focus:outline-none focus:border-purple-400
                         transition-colors"
              />
              <motion.button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 
                         hover:from-purple-500 hover:to-fuchsia-500 rounded-lg text-white font-medium
                         transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-purple-200/60">
              <span>© 2024 SNIPPO.IO.</span>
              <span>All rights reserved.</span>
              <span className="flex items-center">
                Made with <Heart className="h-4 w-4 mx-1 text-pink-500" /> by SNIPPO Team
              </span>
            </div>
            <div className="flex space-x-6">
              {['Terms', 'Privacy', 'Cookies', 'Contact'].map((item) => (
                <motion.a
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-sm text-purple-200/60 hover:text-purple-100 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

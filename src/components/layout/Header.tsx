import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg"
          >
            <Heart className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-xl font-semibold text-gray-900">Empathetic Sky</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Button variant="ghost" className="text-gray-600 hover:text-primary">Home</Button>
          <Button variant="ghost" className="text-gray-600 hover:text-primary">Features</Button>
          <Button variant="ghost" className="text-gray-600 hover:text-primary">About</Button>
          <Button variant="ghost" className="text-gray-600 hover:text-primary">Contact</Button>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-gray-600 hover:text-primary hidden md:flex">
            Sign In
          </Button>
          <Button className="bg-primary text-white hover:bg-primary/90 hidden md:flex">
            Get Started
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
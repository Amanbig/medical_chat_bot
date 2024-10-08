import React from 'react';
import { motion } from 'framer-motion';

function AiBot() {
  return (
    <motion.div 
    whileHover={{ scale: 1.5 }}
    whileTap={{ scale: 0.9 }}
    className="flex items-center justify-center w-40 h-40 bg-white dark:bg-gray-800 rounded-full shadow-black shadow-lg border border-black dark:border-white relative dark:shadow-lg dark:shadow-white">
      <div className="absolute inset-0 flex items-center justify-between px-6">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="w-4 h-4 bg-black dark:bg-white rounded-full animate-blink"></div>
        </div>
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="w-4 h-4 bg-black dark:bg-white rounded-full animate-blink"></div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-1 bg-black dark:bg-white rounded-full"></div>
      </div>
    </motion.div>
  );
}

export default AiBot;
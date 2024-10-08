"use client";

import Chatbot from "@/components/parts/ChatBot"; // Adjust the import path as necessary
import { motion } from 'framer-motion';

export default function ChatPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }} // Customize duration if needed
    >
      <Chatbot />
    </motion.div>
  );
}

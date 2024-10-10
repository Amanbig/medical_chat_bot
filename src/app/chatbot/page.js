// pages/ChatPage.js

"use client";

import { motion } from 'framer-motion';
import FileUploadDialog from "@/components/parts/FileUpload";
import ChatBot from "@/components/parts/ChatBot";

export default function ChatPage() {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }} // Customize duration if needed
    >
          <FileUploadDialog/>
        <ChatBot/>
      {/* Add your chatbot or other components here if needed */}
       {/* <p>File uploaded successfully!</p> Show a message or other content after upload */}
    </motion.div>
  );
}

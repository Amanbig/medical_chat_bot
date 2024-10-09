"use client";

import React, { useState, useEffect, useContext, createContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Button } from "../ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";

// Create ChatContext to handle state
const ChatContext = createContext();

const ChatBot = () => {
  const [chats, setChats] = useState([]);
  const showAiBot = chats.length === 0;

  return (
    <ChatContext.Provider value={{ chats, setChats }}>
      <div className="h-screen flex flex-col justify-center text-center p-8">
        <div className="flex justify-center text-center mt-5">
          <AnimatePresence>
            {showAiBot && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <AiBot />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!showAiBot &&
        <motion.div
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ChatList />
        </motion.div>
        }
        <div>
          <UserBar />
        </div>
      </div>
    </ChatContext.Provider>
  );
};

// ChatList to display user and AI messages with animation
const ChatList = () => {
  const { chats } = useContext(ChatContext);

  return (
    <div className="overflow-y-auto p-4">
      {chats.map((chat, index) => (
        <motion.div
          key={index}
          className={`flex ${chat.from === "user" ? "justify-end" : "justify-start"} mb-4`}
          initial={chat.from === "user" ? { opacity: 0, x: 100 } : { opacity: 0, scale: 0 }}
          animate={chat.from === "user" ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
          }}
        >
          <div
            className={`max-w-xs shadow-lg shadow-gray-600 rounded-xl p-4 ${
              chat.from === "user"
                ? "text-right bg-blue-500 dark:bg-blue-700"
                : "text-left bg-cyan-500 dark:bg-teal-600"
            }`}
          >
            <p className="text-white font-bold dark:text-white">{chat.value}</p>
            <p className="text-xs text-white dark:text-gray-300">{chat.from}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// UserBar for sending messages
const UserBar = () => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { chats, setChats } = useContext(ChatContext);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/predicts", { value });
      // Ensure response.data.prediction is a valid value
      const aiMessage = response.data.prediction || "Sorry, I couldn't respond.";
      setChats((prevChats) => [
        ...prevChats,
        { value: aiMessage, from: "ai" },
      ]);
    } catch (error) {
      console.error("Error:", error);
      // Fallback in case of an error
      setChats((prevChats) => [
        ...prevChats,
        { value: "Sorry, there was an error processing your request.", from: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSendMessage = () => {
    if (value) {
      setChats((prevChats) => [...prevChats, { value: value, from: "user" }]);
      handlePredict();
      setValue("");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-center text-center gap-2">
        {/* Use ShadCN Input */}
        <Input
          type="text"
          placeholder="Type your message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={loading}
          className="flex-grow transition-all duration-150 ease-in-out border-4 p-4"
        />

        <div className="rounded-full">
          {!loading ? (
            <Button
              className="flex justify-center text-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-150"
              onClick={handleSendMessage}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <div className="flex justify-center items-center">
              <Loader className="animate-spin w-10 h-10 text-blue-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AiBot = () => {
    const [displayedText, setDisplayedText] = useState("");
    const fullText = "Hoow may I help you?";
  
    useEffect(() => {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        // Check if the current index is less than the full text length
        if (currentIndex < fullText.length-1) {
          setDisplayedText((prev) => prev + fullText[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 100); // Typing speed
  
      return () => clearInterval(typingInterval); // Cleanup interval
    }, []);
  
    return (
      <motion.div
        className="flex justify-center items-center h-full text-2xl font-bold text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {displayedText}
      </motion.div>
    );
  };
    
  

export default ChatBot;

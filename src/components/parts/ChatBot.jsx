"use client";

import React, { useState, useEffect, useContext, createContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Button } from "../ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
        {!showAiBot && (
          <motion.div
            className="flex-1 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ChatList />
          </motion.div>
        )}
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
          className={`flex m-8 ${chat.from === "user" ? "justify-end" : "justify-start"}`}
          initial={
            chat.from === "user" ? { opacity: 0, x: 100 } : { opacity: 0, scale: 0 }
          }
          animate={
            chat.from === "user" ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1 }
          }
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
          }}
        >
          <div
            className={`${
              chat.from === "user" ? "max-w-xs w-full" : "w-full"
            } shadow-lg shadow-gray-600 rounded-xl p-2 ${
              chat.from === "user"
                ? "text-right bg-gray-700 dark:bg-gray-800"
                : "text-left bg-gray-700 dark:bg-gray-800"
            }`}
          >
            <p className={`text-white dark:text-white p-2 text-sm ${chat.from === "user" ? "truncate" : ""}`}>
              {chat.value}
            </p>
            <Badge className="rounded-full">
              {chat.from}
            </Badge>
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
      const response = await axios.post("http://127.0.0.1:5000/ask", { question: value });
      const aiMessage = response.data.answer || "Sorry, I couldn't respond.";
      
      setChats((prevChats) => [...prevChats, { value: aiMessage, from: "AI Bot" }]);
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      setChats((prevChats) => [
        ...prevChats,
        { value: "Sorry, there was an error processing your request.", from: "AI Bot" },
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


// AI Bot with typing animation
const AiBot = () => {
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "How may I help you?";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length - 1) {
        setDisplayedText((prev) => prev + fullText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
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
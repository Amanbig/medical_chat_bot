"use client";

import React, { useState, useEffect, useContext, createContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Button } from "../ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { URL } from "../../../urls";
import Linkify from "react-linkify"; // Install with `npm install react-linkify`

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

const ChatList = () => {
  const { chats } = useContext(ChatContext);
  const [expandedIndex, setExpandedIndex] = useState(null); // Track expanded messages

  const renderMessage = (message, sources = []) => {
    // Patterns for detecting list items
    const listPatterns = [
      /^\s*(•|\-|\*)\s+(.+)/,  // Bullet points: •, -, *
      /^\s*(\d+\.)\s+(.+)/,   // Numbered: 1., 2., etc.
    ];

    // Split message into lines
    const lines = message.split("\n").filter((line) => line.trim());
    let content = [];
    let currentList = null;

    lines.forEach((line, index) => {
      let matched = false;

      // Check each pattern
      for (const pattern of listPatterns) {
        const match = line.match(pattern);
        if (match) {
          const [, prefix, text] = match;
          if (!currentList || (pattern === listPatterns[0] && currentList.type !== "bullet") || (pattern === listPatterns[1] && currentList.type !== "numbered")) {
            if (currentList) content.push(currentList);
            currentList = { type: pattern === listPatterns[0] ? "bullet" : "numbered", items: [] };
          }
          currentList.items.push(text.trim());
          matched = true;
          break;
        }
      }

      // If no list pattern matched, treat as paragraph
      if (!matched) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        content.push({ type: "paragraph", text: line.trim() });
      }
    });

    // Push the last list if it exists
    if (currentList) content.push(currentList);

    // Render the content
    return (
      <div>
        {content.map((block, idx) => {
          if (block.type === "bullet") {
            return (
              <ul key={idx} className="list-disc pl-6 my-2">
                {block.items.map((item, i) => (
                  <li key={i} className="text-sm leading-relaxed">{item}</li>
                ))}
              </ul>
            );
          } else if (block.type === "numbered") {
            return (
              <ol key={idx} className="list-decimal pl-6 my-2">
                {block.items.map((item, i) => (
                  <li key={i} className="text-sm leading-relaxed">{item}</li>
                ))}
              </ol>
            );
          } else {
            return <p key={idx} className="text-sm my-2">{block.text}</p>;
          }
        })}
        {/* Render sources if present */}
        {sources.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            <span>Sources: </span>
            {sources.map((source, i) => (
              <span key={i}>
                {source.source} (Page {source.page}, {source.type})
                {i < sources.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleToggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index); // Toggle expand/collapse
  };

  return (
    <div className="overflow-y-auto p-4">
      {chats.map((chat, index) => (
        <motion.div
          key={index}
          className={`flex m-8 ${chat.from === "user" ? "justify-end" : "justify-start"}`}
          initial={chat.from === "user" ? { opacity: 0, x: 1 } : { opacity: 0, scale: 0 }}
          animate={chat.from === "user" ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
          }}
        >
          <div
            className={`${
              chat.from === "user" ? "max-w-xs w-full" : "w-full"
            } shadow-lg rounded-xl p-2 dark:border-2 dark:border-white border-black border-4 ${
              chat.from === "user" ? "text-right" : "text-left"
            }`}
            onClick={() => handleToggleExpand(index)}
          >
            <Linkify
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <a
                  href={decoratedHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={key}
                  className="text-blue-500 underline"
                >
                  {decoratedText}
                </a>
              )}
            >
              <div
                className={`p-2 text-sm cursor-pointer ${
                  chat.from === "user" && index !== expandedIndex ? "truncate" : ""
                }`}
              >
                {renderMessage(chat.value, chat.sources || [])}
              </div>
            </Linkify>
            <Badge className="rounded-full">{chat.from}</Badge>
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
  const [sessionId, setSessionId] = useState(null); // To store session ID
  const { chats, setChats } = useContext(ChatContext);

  useEffect(() => {
    // Initialize the chat session on component mount
    const fetchSession = async () => {
      const response = await axios.get(`${URL}/chatbot`);
      setSessionId(response.data.session_id);
    };

    fetchSession();
  }, []);

  const handlePredict = async () => {
    if (!sessionId) return; // Ensure session ID is available

    setLoading(true);
    try {
      const response = await axios.post(`${URL}/ask`, {
        question: value,
        session_id: sessionId,
      });
      const aiMessage = response.data.response || "Sorry, I couldn't respond.";
      const sources = response.data.sources || []; // Extract sources from response

      setChats((prevChats) => [
        ...prevChats,
        { value: aiMessage, from: "AI Bot", sources: sources }, // Include sources in chat object
      ]);
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      setChats((prevChats) => [
        ...prevChats,
        { value: "Sorry, there was an error processing your request.", from: "AI Bot", sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (value) {
      setChats((prevChats) => [...prevChats, { value: value, from: "user", sources: [] }]);
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
          className="flex-grow transition-all duration-150 ease-in-out dark:border-2 dark:border-white border-4 bg-gray-200 dark:bg-gray-900 border-black p-6"
        />
        <div className="rounded-full p-2">
          {!loading ? (
            <Button
              className="flex justify-center text-center rounded-full transition-all duration-150"
              onClick={handleSendMessage}
            >
              <ArrowRight />
            </Button>
          ) : (
            <div className="flex justify-center items-center">
              <Loader className="animate-spin w-10 h-10" />
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
      className="flex justify-center items-center h-full text-2xl font-bold"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {displayedText}
    </motion.div>
  );
};

export default ChatBot;
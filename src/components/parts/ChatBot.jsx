"use strict";

import React, { useState, useEffect, useContext, createContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Button } from "../ui/button";
import { ArrowRight, Loader, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { URL } from "../../../urls";
import Linkify from "react-linkify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Format text with markdown-style formatting
  const processText = (text) => {
    if (!text) return text;
    
    // Process text for various formatting
    const parts = [];
    let currentText = text;
    
    // Regex patterns for formatting
    const boldPattern = /\*\*(.+?)\*\*/g;
    const italicPattern = /(?:_|\*)([^*_]+?)(?:_|\*)/g;
    const codeInlinePattern = /`([^`]+?)`/g;
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const strikethroughPattern = /~~(.+?)~~/g;
    
    // Replace patterns with React components
    const processedText = currentText
      .replace(boldPattern, (_, text) => `<strong>${text}</strong>`)
      .replace(italicPattern, (_, text) => `<em>${text}</em>`)
      .replace(codeInlinePattern, (_, text) => `<code>${text}</code>`)
      .replace(linkPattern, (_, text, url) => `<a href="${url}">${text}</a>`)
      .replace(strikethroughPattern, (_, text) => `<s>${text}</s>`)
      .replace(/\*\s/g, "• "); // Convert asterisk+space to bullet
    
    // Parse the HTML-like string into React elements
    const parseHtml = (html) => {
      const container = document.createElement('div');
      container.innerHTML = html;
      
      const convertNodeToReact = (node, index = 0) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const children = Array.from(node.childNodes).map((child, i) => 
            convertNodeToReact(child, i)
          );
          
          switch (node.tagName.toLowerCase()) {
            case 'strong': return <strong key={index}>{children}</strong>;
            case 'em': return <em key={index}>{children}</em>;
            case 'code': return <code key={index} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{children}</code>;
            case 'a': return <a key={index} href={node.getAttribute('href')} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{children}</a>;
            case 's': return <s key={index}>{children}</s>;
            default: return <span key={index}>{children}</span>;
          }
        }
        
        return null;
      };
      
      return Array.from(container.childNodes).map((node, i) => convertNodeToReact(node, i));
    };
    
    return parseHtml(processedText);
  };

  // Function to detect and format different content types in messages
  const detectContentType = (line) => {
    // Patterns for detecting content types
    const bulletPattern = /^\s*(•|\-|\*)\s+(.+)/;
    const numberedPattern = /^\s*(\d+\.)\s+(.+)/;
    const tableRowPattern = /^(.+\s*\|\s*.+)$/;
    const tableSeparatorPattern = /^[\s\-+|]+$/;
    const codeBlockPattern = /^```(\w*)$/;
    const keyValuePattern = /^(.+?)\s*:\s*(.+)$/;
    const headingPattern = /^(#{1,6})\s+(.+)$/;
    const horizontalRulePattern = /^(\-{3,}|\*{3,}|_{3,})$/;
    const blockquotePattern = /^>\s*(.+)$/;
    const checkboxPattern = /^\s*\[([ x])\]\s+(.+)$/i;

    // Check for each pattern
    if (headingPattern.test(line)) {
      const [, hashes, text] = line.match(headingPattern);
      return { type: "heading", level: hashes.length, text };
    } 
    else if (bulletPattern.test(line)) {
      const [, , text] = line.match(bulletPattern);
      return { type: "bullet", text };
    } 
    else if (numberedPattern.test(line)) {
      const [, number, text] = line.match(numberedPattern);
      return { type: "numbered", number, text };
    } 
    else if (tableRowPattern.test(line) && !tableSeparatorPattern.test(line)) {
      const cells = line.split("|").map(cell => cell.trim()).filter(Boolean);
      return { type: "tableRow", cells };
    } 
    else if (tableSeparatorPattern.test(line)) {
      return { type: "tableSeparator" };
    } 
    else if (codeBlockPattern.test(line)) {
      const [, language] = line.match(codeBlockPattern);
      return { type: "codeBlockMarker", language };
    } 
    else if (keyValuePattern.test(line)) {
      const [, key, value] = line.match(keyValuePattern);
      return { type: "keyValue", key, value };
    }
    else if (horizontalRulePattern.test(line)) {
      return { type: "horizontalRule" };
    }
    else if (blockquotePattern.test(line)) {
      const [, text] = line.match(blockquotePattern);
      return { type: "blockquote", text };
    }
    else if (checkboxPattern.test(line)) {
      const [, checked, text] = line.match(checkboxPattern);
      return { type: "checkbox", checked: checked.toLowerCase() === 'x', text };
    }
    else {
      return { type: "paragraph", text: line };
    }
  };

  // Render a message with proper formatting
  const renderMessage = (message, sources = []) => {
    if (!message) return null;

    // Split message into lines
    const lines = message.split("\n");
    const content = [];
    
    let currentList = null;
    let currentTable = null;
    let currentCodeBlock = null;
    let currentBlockquote = null;
    let isInCodeBlock = false;
    
    // Add any pending list, table or code block to content
    const finalizeCurrent = () => {
      if (currentList) {
        content.push(currentList);
        currentList = null;
      }
      if (currentTable) {
        content.push(currentTable);
        currentTable = null;
      }
      if (currentBlockquote) {
        content.push(currentBlockquote);
        currentBlockquote = null;
      }
    };

    // Process each line
    lines.forEach((line, index) => {
      // Handle code blocks separately
      if (line.trim().startsWith("```")) {
        if (!isInCodeBlock) {
          finalizeCurrent();
          
          // Start new code block
          const contentType = detectContentType(line);
          currentCodeBlock = { 
            type: "codeBlock", 
            language: contentType.language || "", 
            code: ""
          };
          isInCodeBlock = true;
        } else {
          // End code block
          content.push(currentCodeBlock);
          currentCodeBlock = null;
          isInCodeBlock = false;
        }
        return;
      }
      
      // If in code block, just add the line
      if (isInCodeBlock) {
        currentCodeBlock.code += (currentCodeBlock.code ? "\n" : "") + line;
        return;
      }

      // Process normal (non-code) content
      const contentType = detectContentType(line.trim());
      
      switch (contentType.type) {
        case "bullet":
          if (!currentList || currentList.type !== "bullet") {
            finalizeCurrent();
            currentList = { type: "bullet", items: [] };
          }
          currentList.items.push(contentType.text);
          break;
          
        case "numbered":
          if (!currentList || currentList.type !== "numbered") {
            finalizeCurrent();
            currentList = { type: "numbered", items: [] };
          }
          currentList.items.push(contentType.text);
          break;
          
        case "tableRow":
          if (!currentTable) {
            finalizeCurrent();
            currentTable = { headers: null, rows: [] };
          }
          if (!currentTable.headers && index > 0 && lines[index-1].trim().match(/^[\s\-+|]+$/)) {
            currentTable.headers = contentType.cells;
          } else {
            currentTable.rows.push(contentType.cells);
          }
          break;
          
        case "tableSeparator":
          // Just keep track of separator for table formatting
          break;
          
        case "blockquote":
          if (!currentBlockquote) {
            finalizeCurrent();
            currentBlockquote = { type: "blockquote", lines: [] };
          }
          currentBlockquote.lines.push(contentType.text);
          break;
          
        case "heading":
          finalizeCurrent();
          content.push({ 
            type: "heading", 
            level: contentType.level, 
            text: contentType.text 
          });
          break;
          
        case "horizontalRule":
          finalizeCurrent();
          content.push({ type: "horizontalRule" });
          break;
          
        case "keyValue":
          finalizeCurrent();
          content.push({ 
            type: "keyValue", 
            key: contentType.key, 
            value: contentType.value 
          });
          break;
          
        case "checkbox":
          finalizeCurrent();
          content.push({ 
            type: "checkbox", 
            checked: contentType.checked, 
            text: contentType.text 
          });
          break;
          
        case "paragraph":
        default:
          // Skip empty lines
          if (!line.trim()) {
            finalizeCurrent();
            break;
          }
          
          // If the previous line was a paragraph and this line isn't empty,
          // append to the previous paragraph
          const lastContent = content[content.length - 1];
          if (lastContent && lastContent.type === "paragraph" && !currentList && !currentTable && !currentBlockquote) {
            lastContent.text += "\n" + contentType.text;
          } else {
            finalizeCurrent();
            content.push({ type: "paragraph", text: contentType.text });
          }
          break;
      }
    });
    
    // Add any remaining blocks
    finalizeCurrent();
    if (currentCodeBlock) {
      content.push(currentCodeBlock);
    }

    // Render the processed content
    return (
      <div className="message-content">
        {content.map((block, idx) => {
          switch (block.type) {
            case "bullet":
              return (
                <ul key={idx} className="list-disc pl-6 my-2">
                  {block.items.map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed mb-1">
                      <Linkify
                        componentDecorator={(href, text, key) => (
                          <a href={href} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            {text}
                          </a>
                        )}
                      >
                        {processText(item)}
                      </Linkify>
                    </li>
                  ))}
                </ul>
              );
              
            case "numbered":
              return (
                <ol key={idx} className="list-decimal pl-6 my-2">
                  {block.items.map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed mb-1">
                      <Linkify
                        componentDecorator={(href, text, key) => (
                          <a href={href} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            {text}
                          </a>
                        )}
                      >
                        {processText(item)}
                      </Linkify>
                    </li>
                  ))}
                </ol>
              );
              
            case "heading":
              const HeadingTag = `h${block.level}`;
              return (
                <HeadingTag 
                  key={idx} 
                  className={`font-bold my-2 ${
                    block.level === 1 ? 'text-xl' : 
                    block.level === 2 ? 'text-lg' : 
                    'text-base'
                  }`}
                >
                  <Linkify
                    componentDecorator={(href, text, key) => (
                      <a href={href} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {text}
                      </a>
                    )}
                  >
                    {processText(block.text)}
                  </Linkify>
                </HeadingTag>
              );
              
            case "horizontalRule":
              return <hr key={idx} className="my-4 border-t-2 border-gray-300" />;
              
            case "keyValue":
              return (
                <div key={idx} className="flex my-2">
                  <span className="font-semibold mr-2">
                    {processText(block.key)}:
                  </span>
                  <span>{processText(block.value)}</span>
                </div>
              );
              
            case "checkbox":
              return (
                <div key={idx} className="flex items-center my-1">
                  <div className={`w-4 h-4 border mr-2 flex items-center justify-center ${block.checked ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                    {block.checked && <Check size={12} className="text-white" />}
                  </div>
                  <span>{processText(block.text)}</span>
                </div>
              );
              
            case "blockquote":
              return (
                <blockquote key={idx} className="border-l-4 border-gray-300 pl-4 py-1 my-2 italic">
                  {block.lines.map((line, i) => (
                    <p key={i} className="text-sm leading-relaxed">
                      <Linkify
                        componentDecorator={(href, text, key) => (
                          <a href={href} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            {text}
                          </a>
                        )}
                      >
                        {processText(line)}
                      </Linkify>
                    </p>
                  ))}
                </blockquote>
              );
              
            case "codeBlock":
              return (
                <div key={idx} className="my-2 relative group">
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(block.code);
                        setCopiedIndex(idx);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                      className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      {copiedIndex === idx ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <SyntaxHighlighter 
                    language={block.language || 'text'} 
                    style={vscDarkPlus}
                    customStyle={{ borderRadius: '0.375rem' }}
                    wrapLongLines={true}
                  >
                    {block.code}
                  </SyntaxHighlighter>
                </div>
              );
              
            case "paragraph":
              return (
                <p key={idx} className="text-sm my-2 leading-relaxed">
                  <Linkify
                    componentDecorator={(href, text, key) => (
                      <a href={href} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {text}
                      </a>
                    )}
                  >
                    {processText(block.text)}
                  </Linkify>
                </p>
              );
              
            default:
              if (block.headers || block.rows) { // Table
                return (
                  <div key={idx} className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-gray-300">
                      {block.headers && (
                        <thead>
                          <tr className="bg-gray-100">
                            {block.headers.map((header, i) => (
                              <th key={i} className="border border-gray-300 px-4 py-2 text-sm font-semibold text-left">
                                <Linkify
                                  componentDecorator={(href, text, key) => (
                                    <a href={href} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                      {text}
                                    </a>
                                  )}
                                >
                                  {processText(header)}
                                </Linkify>
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {block.rows.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            {row.map((cell, j) => (
                              <td key={j} className="border border-gray-300 px-4 py-2 text-sm">
                                <Linkify
                                  componentDecorator={(href, text, key) => (
                                    <a href={href} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                      {text}
                                    </a>
                                  )}
                                >
                                  {processText(cell)}
                                </Linkify>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return null;
          }
        })}
        
        {/* Render sources if present */}
        {sources.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            <span>Sources: </span>
            {sources.map((source, i) => (
              <span key={i}>
                {source.source} 
                {source.page && ` (Page ${source.page})`}
                {source.type && `, ${source.type}`}
                {i < sources.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleToggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
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
            <div
              className={`p-2 text-sm ${
                chat.from === "user" && index !== expandedIndex ? "truncate" : ""
              }`}
            >
              {renderMessage(chat.value, chat.sources || [])}
            </div>
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
  const [sessionId, setSessionId] = useState(null);
  const { chats, setChats } = useContext(ChatContext);

  useEffect(() => {
    // Initialize the chat session on component mount
    const fetchSession = async () => {
      try {
        const response = await axios.get(`${URL}/chatbot`);
        setSessionId(response.data.session_id);
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
      }
    };

    fetchSession();
  }, []);

  const handlePredict = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      setChats((prevChats) => [...prevChats, { value, from: "user", sources: [] }]);

      const response = await axios.post(`${URL}/ask`, {
        question: value,
        session_id: sessionId,
      });
      
      const aiMessage = response.data.response || "Sorry, I couldn't respond.";
      const sources = response.data.sources || [];

      setChats((prevChats) => [
        ...prevChats,
        { value: aiMessage, from: "AI Bot", sources: sources },
      ]);
      
      setValue("");
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
    if (value.trim()) {
      handlePredict();
    }
  };

  return (
    <div className="p-4 mt-auto">
      <div className="flex justify-center text-center gap-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
          disabled={loading}
          className="flex-grow transition-all duration-150 ease-in-out dark:border-2 dark:border-white border-4 bg-gray-200 dark:bg-gray-900 border-black p-6"
        />
        <div className="rounded-full p-2">
          {!loading ? (
            <Button
              className="flex justify-center text-center rounded-full transition-all duration-150"
              onClick={handleSendMessage}
              disabled={!value.trim()}
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
      if (currentIndex < fullText.length) {
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
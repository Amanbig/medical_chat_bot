"use strict";

import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Button } from "../ui/button";
import { ArrowRight, Loader, Copy, Check, Send, Bot, UserCircle, RefreshCcw, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { URL } from "../../../urls";
import Linkify from "react-linkify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Create ChatContext to handle state
const ChatContext = createContext();

const ChatBot = () => {
  const [chats, setChats] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chats]);

  return (
    <ChatContext.Provider value={{ chats, setChats }}>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <header className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-2">
            <Bot className="text-blue-500" />
            <h1 className="text-xl font-semibold">JacBot</h1>
          </div>
        </header>
        
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        >
          <AnimatePresence>
            {isFirstLoad && chats.length === 0 ? (
              <WelcomeScreen setIsFirstLoad={setIsFirstLoad} />
            ) : (
              <ChatList />
            )}
          </AnimatePresence>
        </div>
        
        <UserBar />
      </div>
    </ChatContext.Provider>
  );
};

// Welcome screen component
const WelcomeScreen = ({ setIsFirstLoad }) => {
  const suggestions = [
    "Tell me about Councelling",
    "How can I get admission?",
    "Write a short details about colleges participating in JAC",
    "What is the eligibility criteria for admission?",
  ];
  
  const { setChats } = useContext(ChatContext);
  
  const handleSuggestionClick = (suggestion) => {
    setChats([{ value: suggestion, from: "user" }]);
    setIsFirstLoad(false);
    
    // Simulate API call
    setTimeout(() => {
      setChats(prev => [...prev, { 
        value: `I'm processing your question about "${suggestion}"...`, 
        from: "AI Bot" 
      }]);
    }, 500);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto py-10 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Bot size={40} className="text-blue-600 dark:text-blue-300" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Welcome to JacBot</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          I'm here to help with information, details, and more.
          What would you like to know today?
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <p className="text-sm font-medium">{suggestion}</p>
            </button>
          ))}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Type your own question below or select a suggestion to get started.
        </p>
      </div>
    </motion.div>
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

    const uniqueSources = sources.reduce((acc, curr) => {
      const existing = acc.find(s => s.source === curr.source);
      if (existing) {
        if (curr.page && !existing.pages.includes(curr.page)) {
          existing.pages.push(curr.page);
        }
      } else {
        acc.push({
          source: curr.source,
          pages: curr.page ? [curr.page] : []
        });
      }
      return acc;
    }, []);
    
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
                <div key={idx} className="my-2 relative group rounded-md overflow-hidden">
                  {block.language && (
                    <div className="absolute left-2 top-2 px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                      {block.language}
                    </div>
                  )}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(block.code);
                        setCopiedIndex(idx);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                      className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                      aria-label="Copy code"
                    >
                      {copiedIndex === idx ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <SyntaxHighlighter 
                    language={block.language || 'text'} 
                    style={vscDarkPlus}
                    customStyle={{ borderRadius: '0.375rem', marginTop: '0', marginBottom: '0' }}
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
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
                      {block.headers && (
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-800">
                            {block.headers.map((header, i) => (
                              <th key={i} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-left">
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
                          <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"}>
                            {row.map((cell, j) => (
                              <td key={j} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm">
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
        {uniqueSources.length > 0 && (
        <div className="mt-4 border-t pt-2 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Sources:</p>
          <div className="flex flex-wrap gap-2">
            {uniqueSources.map((source, i) => {
              const pdfUrl = source.pages.length > 0 
                ? `/public_pdf/${source.source}#page=${source.pages[0]}`
                : `/public_pdf/${source.source}`;

              return (
                <a
                  key={i}
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-xs text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  title={`Open ${source.source}${source.pages.length > 0 ? ` at page ${source.pages[0]}` : ''}`}
                >
                  <ExternalLink size={12} />
                  <span className="truncate max-w-[130px]">
                    {source.source}
                    {source.pages.length > 0 && (
                      <span className="ml-1 opacity-80">
                        (p.{source.pages.sort((a, b) => a - b).join(', ')})
                      </span>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {chats.map((chat, index) => (
        <motion.div
          key={index}
          className={`mb-4 ${expandedIndex === index ? 'z-10' : ''}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`flex items-start gap-3 ${chat.from === "user" ? "justify-end" : ""}`}>
            {/* Avatar */}
            {chat.from !== "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                <Bot size={16} className="text-blue-600 dark:text-blue-300" />
              </div>
            )}
            
            {/* Message bubble */}
            <div 
              className={`relative group rounded-lg p-3 max-w-[85%] ${
                chat.from === "user" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              }`}
            >
              {renderMessage(chat.value, chat.sources || [])}
              
              {/* Message actions */}
              <div className={`absolute -top-3 ${chat.from === "user" ? "left-2" : "right-2"} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(chat.value);
                      // Show copied notification
                    }}
                    className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Copy message"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* User avatar */}
            {chat.from === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mt-1">
                <UserCircle size={16} className="text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
          
          {/* Timestamp (optional) */}
          <div className={`text-xs text-gray-500 mt-1 ${chat.from === "user" ? "text-right mr-11" : "ml-11"}`}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  const inputRef = useRef(null);

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
    
    // Focus the input on component mount
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handlePredict = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const userMessage = value.trim();
      setChats((prevChats) => [...prevChats, { value: userMessage, from: "user", sources: [] }]);
      setValue("");

      // Show typing indicator
      const typingId = Date.now();
      setChats(prevChats => [
        ...prevChats, 
        { id: typingId, value: "...", from: "AI Bot", isTyping: true }
      ]);

      const response = await axios.post(`${URL}/ask`, {
        question: userMessage,
        session_id: sessionId,
      });
      
      const aiMessage = response.data.response || "Sorry, I couldn't respond.";
      const sources = response.data.sources || [];
      // Remove typing indicator and add the real response
      setChats(prevChats => {
        const filteredChats = prevChats.filter(c => c.id !== typingId);
        return [...filteredChats, { 
          value: aiMessage, 
          from: "AI Bot",
          sources: sources
        }];
      });

    } catch (error) {
      console.error("Error sending message:", error);
      setChats(prevChats => {
        const filteredChats = prevChats.filter(c => !c.isTyping);
        return [...filteredChats, { 
          value: "Sorry, there was an error processing your request. Please try again.", 
          from: "AI Bot" 
        }];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handlePredict();
      }
    }
  };

  const handleClearChat = () => {
    setChats([]);
  };

  return (
    <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="max-w-3xl mx-auto">
        {chats.length > 0 && (
          <div className="flex justify-center mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <RefreshCcw size={14} className="mr-1" />
              New Chat
            </Button>
          </div>
        )}
        
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="pr-12 py-6 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-full"
            disabled={loading}
          />
          <Button
            onClick={handlePredict}
            disabled={!value.trim() || loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
          </Button>
        </div>
        
        <div className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
          JacBot may provide inaccurate information. Verify important facts.
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
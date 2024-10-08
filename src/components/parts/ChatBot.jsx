"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatContext from '../context';
import ChatList from './ChatList';
import UserBar from './UserBar';
import AiBot from './AiBot';

function ChatBot() {
    const [chats, setChats] = useState([]);

    // Determine whether to show AiBot based on chats length
    const showAiBot = chats.length === 0;

    return (
        <ChatContext.Provider value={{ chats, setChats }}>
            <div className='h-screen flex flex-col p-10 mt-10'> 
                <div className='flex justify-center text-center m-5'>
                    {/* Animate AiBot appearance */}
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

                {/* Animate ChatList appearance */}
                <motion.div
                    className='flex-1 overflow-y-auto m-10'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <ChatList />
                </motion.div>

                {/* UserBar remains static */}
                <div>
                    <UserBar />
                </div>
            </div>
        </ChatContext.Provider>
    );
}

export default ChatBot;

"use client";
import React, { useState } from 'react';
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
                    {showAiBot && <AiBot />} {/* Render AiBot only if chats is empty */}
                </div>
                <div className='flex-1 overflow-y-auto m-10'>
                    <ChatList />
                </div>
                <div>
                    <UserBar /> {/* UserBar can manage input without needing to hide AiBot */}
                </div>
            </div>
        </ChatContext.Provider>
    );
}

export default ChatBot;

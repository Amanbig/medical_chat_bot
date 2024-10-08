import React, { useContext } from 'react';
import ChatContext from '../context';
import { motion } from 'framer-motion';

function ChatList() {
    const { chats } = useContext(ChatContext);

    return (
        <div className='overflow-y-auto p-4'>
            {chats.map((chat, index) => (
                <div 
                    key={index} 
                    className={`flex ${chat.from === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                    <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ rotate: 360, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    className={`max-w-xs shadow-lg shadow-gray-600 rounded-xl p-4 ${chat.from === 'user' ? 'text-right bg-blue-500 dark:bg-blue-700' : 'text-left bg-cyan-500 dark:bg-teal-600'}`}>
                        <p className='text-white font-bold dark:text-white'>
                            {chat.value}
                        </p>
                        <p className='text-xs text-white dark:text-gray-300'>
                            {chat.from}
                        </p>
                    </motion.div>
                </div>
            ))}
        </div>
    );
}

export default ChatList;
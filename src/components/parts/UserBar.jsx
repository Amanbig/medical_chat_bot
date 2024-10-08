"use client";
import React, { useContext, useState } from 'react';
import axios from 'axios';
import ChatContext from '../context';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { Loader } from 'lucide-react'; // Icon for loading

function UserBar() {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false); // Track loading state
    const { chats, setChats } = useContext(ChatContext);

    const handlePredict = async () => {
        setLoading(true); // Set loading to true while the request is being processed
        try {
            const response = await axios.post('http://localhost:5000/predicts', { value });
            setChats(prevChats => [...prevChats, { value: response.data.prediction, from: 'ai' }]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false); // Set loading to false when the request finishes
        }
    };

    const handleSendMessage = () => {
        if (value) {
            // Add user's message to the chat
            setChats(prevChats => [...prevChats, { value: value, from: 'user' }]);
            // Call the prediction function
            handlePredict();
            // Clear the input field
            setValue('');
        }
    };

    return (
        <div className="p-4">
            <div className="flex">
                {/* Input field for typing messages */}
                <input
                    type="text"
                    className="border-2 border-black p-2 rounded flex-grow dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 transition-all duration-150 ease-in-out"
                    placeholder="Type your message..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={loading} // Disable input while loading
                    style={{
                        boxSizing: 'border-box', // Ensure consistent sizing
                    }}
                />

                {/* Send button or loading spinner */}
                <div className="m-2 rounded-full">
                    {!loading ? (
                        <Button
                            className="p-4 flex justify-center text-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-150"
                            onClick={handleSendMessage}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    ) : (
                        <div className="flex justify-center items-center p-4">
                            <Loader className="animate-spin w-10 h-10 text-blue-600" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserBar;

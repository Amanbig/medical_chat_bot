import { useState } from 'react';
import UserBar from './parts/UserBar';
import ChatList from './parts/ChatList';
import ChatContext from './context';
import AiBot from './components/AiBot';
import ThemeToggle from './components/ThemeToggle'; 

function App() {
  const [chats, setChats] = useState([]);

  return (
    <ChatContext.Provider value={{ chats, setChats }}>
      <div className='h-screen flex flex-col dark:bg-gray-800'>
        <ThemeToggle /> 
        <div className='flex justify-center text-center m-5'>
          <AiBot />
        </div>
        <div className='flex-1 overflow-y-auto'>
          <ChatList />
        </div>
        <div>
          <UserBar />
        </div>
      </div>
    </ChatContext.Provider>
  );
}

export default App;

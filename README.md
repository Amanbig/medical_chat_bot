# ChatBot with AI LLM Bot with File Upload

A modern web application that integrates a conversational AI chatbot with real-time user interactions, including file uploads and smooth animations. Built using **React**, **Framer Motion**, **Lucide Icons**, and **ShadCN Components**.

## Features

- **Conversational AI Chatbot**: Engage with an AI chatbot that can answer user queries in real-time.
- **Animated Message Flow**: Smooth animations using Framer Motion to provide a modern user experience.
- **User Message Input**: Simple input field for sending messages with an `Enter` key or button click.
- **AI Response Handling**: AI answers user queries through an external API.
- **File Upload System**: Upload PDF files directly from the UI, with success/error notifications.
- **Lucide Icons Integration**: Modern icons for a clean and functional UI.
- **ShadCN Components**: Highly customizable and reusable UI components for a consistent interface.

## Tech Stack

- **Frontend**:
  - React (Next.js)
  - Framer Motion
  - Axios (for API requests)
  - Lucide Icons
  - ShadCN UI components
  - Tailwind CSS
- **Backend**:
  - Flask (API for chatbot and file upload functionality)
- **Others**:
  - File Upload with Fetch API
  - Notifications with React Toastify

## Installation
### Clone the repository:
```bash
git clone https://github.com/Amanbig/medical_chat_bot.git
cd medical_chat_bot
```

### Frontend Setup

#### Install dependencies:
```bash
npm install
```

#### Start the development server:
```bash
npm run dev
```

### Backend Setup

#### Move to backend directory
```bash
cd backend
```

#### Create a .env File
Create a .env file in the directory and copy the following lines:
```bash
GROQ_API_KEY = "<groqapi-key>"
HF_TOKEN = "<hf-token>"
```

#### Create a Virtual Environment
```bash
python -m venv venv
venv/Scripts/activate  
```

#### Install Required Packages
```bash
pip install -r requirements.txt
```

#### Run the application
```bash
python main.py
```

## Usage
- **Chat with AI**: Enter your query in the input box and press Enter or click the send button to receive an AI response.
- **Upload Files**: Click the "Upload PDF" button, select a file, and it will be uploaded to the server.
- **Responsive UI**: The app is responsive and works on mobile and desktop devices.

## API Endpoints
- **POST /ask**: Handles user queries and returns AI-generated responses.
- **POST /upload**: Handles file uploads (accepts PDF files).

## Customization
- Modify the chatbot behavior by updating the Flask API in backend/app.py.
- Adjust the animations or UI components using Framer Motion and ShadCN components.

## Contributing

1. **Fork the repository** on GitHub.
2. **Create a new branch** (`git checkout -b feature/YourFeature`).
3. **Make your changes** and commit (`git commit -am 'Add new feature'`).
4. **Push to the branch** (`git push origin feature/YourFeature`).
5. **Create a new Pull Request for the changes made**.

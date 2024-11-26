# ChatBot with AI LLM Bot with File Upload

A modern web application that integrates a conversational AI chatbot with real-time user interactions, including file uploads and smooth animations. Built using **React**, **Framer Motion**, **Lucide Icons**, and **ShadCN Components** on Frontend and **FastApi** on backend.

## Features

- **Conversational AI Chatbot**: Engage with an AI chatbot that can answer user queries in real-time.
- **Animated Message Flow**: Smooth animations using Framer Motion to provide a modern user experience.
- **User Message Input**: Simple input field for sending messages with an `Enter` key or button click.
- **AI Response Handling**: AI answers user queries through an external API.
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
  - Fastapi (API for chatbot)
  - Fine tuned model and used Gemini api for sentence improvement

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

#### Set the backend api
Make changes in the urls.js file with your endpoint
```javascript
export const URL='Your endpoint Here' || 'http://127.0.0.1:5000'
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
fastapi dev app.py
```

## Usage
- **Chat with AI**: Enter your query in the input box and press Enter or click the send button to receive an AI response.
- **Responsive UI**: The app is responsive and works on mobile and desktop devices.

## API Endpoints
- **GET /chatbot**: Creates a session with random session id.
- **POST /ask**: Handles user queries and returns AI-generated responses.
- **GET /education**: Responds with data of courses available.
- **GET /college**: Responds with data of colleges available.

## Customization
- Modify the chatbot behavior by updating the API.
- Adjust the animations or UI components using Framer Motion and ShadCN components.

## Contributing

1. **Fork the repository** on GitHub.
2. **Create a new branch** (`git checkout -b feature/YourFeature`).
3. **Make your changes** and commit (`git commit -am 'Add new feature'`).
4. **Push to the branch** (`git push origin feature/YourFeature`).
5. **Create a new Pull Request for the changes made**.

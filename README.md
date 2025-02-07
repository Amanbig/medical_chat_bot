# ChatBot with AI LLM Bot with File Upload

A modern web application that integrates a conversational AI chatbot with real-time user interactions and smooth animations. Built using **React**, **Framer Motion**, **Lucide Icons**, and **ShadCN Components** on Frontend and **FastApi** on backend.

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
  - GROQ API for inference

## Installation
### Clone the repository:
```bash
git clone https://github.com/Amanbig/medical_chat_bot.git
cd medical_chat_bot
```

#### Install dependencies:
```bash
npm install
```

#### Create .env file and provide the following api_key

```bash
GROQ_API_KEY=<your_api_key>
HF_TOKEN=<your_hf_token>
NEXT_PUBLIC_URL=<your_endpoint_here>
```

#### Create a Virtual Environment
```bash
python -m venv venv
venv/Scripts/activate  #source venv/bin/activate in linux
```

#### Start the development server with fastapi backend:
```bash
npm run dev
```

#### Server running at
```bash
localhost:3000
```

### Scripts with package.json for running fastapi:
```bash
"fastapi-dev": "pip3 install -r requirements.txt && python -m uvicorn backend.app:app --reload",
"next-dev": "next dev --turbo",
"dev": "concurrently \"npm run next-dev\" \"npm run fastapi-dev\"",
```


## Usage
- **Chat with AI**: Enter your query in the input box and press Enter or click the send button to receive an AI response.
- **Responsive UI**: The app is responsive and works on mobile and desktop devices.

## API Endpoints
- **GET /chatbot**: Creates a session with random session id.
- **POST /ask**: Handles user queries and returns AI-generated responses.

## Customization
- Modify the chatbot behavior by updating the API.
- Adjust the animations or UI components using Framer Motion and ShadCN components.

## Contributing

1. **Fork the repository** on GitHub.
2. **Create a new branch** (`git checkout -b feature/YourFeature`).
3. **Make your changes** and commit (`git commit -am 'Add new feature'`).
4. **Push to the branch** (`git push origin feature/YourFeature`).
5. **Create a new Pull Request for the changes made**.

import sys
import os

# Add the project root directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from langchain_community.chat_message_histories import ChatMessageHistory
from services.chat_gen import Chatbot  # Import the Chatbot class
from services.chat_refine import refine_chat_message, clean_text  # Import the refinement functions
from public.educations import educations
from public.colleges import colleges

# Initialize FastAPI app
app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize chat histories and retrievers
chat_histories = {}
retrievers = {}

# Initialize the chatbot
# chatbot = Chatbot(model_path='backend/model/trained_gpt2_model.pth')  # Adjust the path accordingly

@app.get("backend/education")
async def get_education():
    return {"backend/educations": educations}

@app.get("backend/college")
async def get_college():
    return {"colleges": colleges}

@app.get("backend/chatbot")
async def chatbot_session():
    session_id = str(uuid4())
    if session_id not in chat_histories:
        chat_histories[session_id] = ChatMessageHistory()
    return {"session_id": session_id}

@app.post("backend/ask")
async def ask_question(data: dict):
    session_id = data.get('session_id')
    user_input = data.get('question')

    if not user_input:
        raise HTTPException(status_code=400, detail="No question provided")

    if session_id not in chat_histories:
        raise HTTPException(status_code=400, detail="Invalid session ID")

    # Add refined input to the session history (this can be used for context in the future)
    session_history = chat_histories.get(session_id)

    # Generate response using the chatbot
    chatbot = Chatbot(model_path='model/trained_gpt2_model.pth')  # Adjust the path accordingly
    
    response = chatbot.chat(user_input)
    
    cleaned_input = clean_text(response)
    refined_output = await refine_chat_message(cleaned_input)
    session_history.add_user_message(refined_output)
    # Generate response using the chatbot instance

    # response = Chatbot.chat(refined_input)

    # Store the assistant's response in the chat history
    # session_history.add_assistant_message(response)
    session_history.add_message({"role": "assistant", "content": refined_output})


    return JSONResponse(content={
        'session_id': session_id,
        'user_input': cleaned_input,
        'response': refined_output
    })


# if __name__ == '__main__':
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)

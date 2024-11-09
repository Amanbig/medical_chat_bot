import streamlit as st
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_huggingface import HuggingFaceEndpoint
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set the Hugging Face token
os.environ['HF_TOKEN'] = "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"

# Hugging Face model setup
# repo_id = "gpt2"
repo_id = "Ujjwal671021/llama-2-7b-uj"
llm = HuggingFaceEndpoint(
    repo_id=repo_id,
    # task="text-generation",
    max_length=150,
    temperature=0.7,
    token=os.environ['HF_TOKEN']
)

# Streamlit UI setup
st.title("Chatbot Using Fine-Tuned Model")
st.write("Ask questions about the information in the dataset.")

# State management for chat history
if 'store' not in st.session_state:
    st.session_state.store = {}

# Function to get or initialize session history
def get_session_history(session: str):
    if session not in st.session_state.store:
        st.session_state.store[session] = ChatMessageHistory()
    return st.session_state.store[session]

# Get session ID
session_id = st.text_input("Session ID", value="default_session")

# Always initialize session history
session_history = get_session_history(session_id)

# Get user input
user_input = st.text_input("Your question:")

if user_input:
    # Run the question-answering function
    prompt = f"You are an assistant. Answer the question: {user_input}"
    response = llm(prompt)

    if response:
        st.write("Assistant:", response)
        # Update chat history with the question and response
        session_history.add_user_message(user_input)
        session_history.add_ai_message(response)
    else:
        st.write("Assistant: Sorry, no response was generated.")

# Display chat history
st.write("Chat History:", session_history.messages)

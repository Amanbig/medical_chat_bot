from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.vectorstores import FAISS
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from datasets import load_dataset
from fastapi.middleware.cors import CORSMiddleware
from langchain.schema import Document
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
hf_token = os.getenv("HF_TOKEN")

# Initialize FastAPI app
app = FastAPI()

# Add middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Validate API keys
if not groq_api_key or not hf_token:
    raise ValueError("Please provide valid Groq API Key and HuggingFace Token in .env")

# Initialize embeddings and LLM
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = ChatGroq(groq_api_key=groq_api_key, model_name="Gemma2-9b-It")

# Helper function to process dataset
def prepare_documents(dataset_name):
    dataset = load_dataset(dataset_name, split="train")
    documents = [Document(page_content=doc["text"]) for doc in dataset if "text" in doc and doc["text"]]
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=500)
    splits = text_splitter.split_documents(documents)
    return splits

# Prepare the dataset
dataset_name = "Ujjwal671021/jac-chandigarh-information-brochure"
splits = prepare_documents(dataset_name)

# Index documents
vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
retriever = vectorstore.as_retriever()

# Define prompts
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", (
            "Given a chat history and the latest user question, "
            "formulate a standalone question that can be understood without the chat history. "
            "If the question is already standalone, return it as is."
        )),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)

system_prompt = (
    "You are an assistant for question-answering tasks. Use the retrieved context "
    "to answer the question. If you don't know the answer, say so. Provide concise responses."
    "\n\n{context}"
)
qa_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)

# Create chains
history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)
question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

# Store chat sessions
chat_sessions = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in chat_sessions:
        chat_sessions[session_id] = ChatMessageHistory()
    return chat_sessions[session_id]

# Models for requests and responses
class ChatRequest(BaseModel):
    session_id: str
    user_input: str

class ChatResponse(BaseModel):
    session_id: str
    user_input: str
    response: str

# Endpoints
@app.get("/chatbot")
async def chatbot_session():
    session_id = str(uuid4())
    chat_sessions[session_id] = ChatMessageHistory()
    return JSONResponse(content={"session_id": session_id})

@app.post("/ask")
async def chat_with_assistant(data: dict):
    """
    Interact with the assistant using the provided session and input.
    """
    # Extract session_id and user_input from the incoming data dictionary
    session_id = data.get("session_id")
    user_input = data.get("question")

    # Validate session_id and user_input
    if not session_id or not user_input:
        raise HTTPException(status_code=400, detail="Invalid request. 'session_id' and 'question' are required.")

    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Invalid session ID")

    def get_history():
        return get_session_history(session_id)

    # Invoke conversational RAG chain
    conversational_rag_chain = RunnableWithMessageHistory(
        runnable=rag_chain,
        get_session_history=get_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )

    # Get the response from the chain
    try:
        response = conversational_rag_chain.invoke({"input": user_input})
        answer = response.get("answer", "I'm sorry, I couldn't process that.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Return JSON response
    return JSONResponse(content={
        "session_id": session_id,
        "user_input": user_input,
        "response": answer
    })


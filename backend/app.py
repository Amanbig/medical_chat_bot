import os
from uuid import uuid4
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.vectorstores import Chroma
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.schema import Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import pdfplumber
from pdf2image import convert_from_path
import pytesseract

# Load environment variables
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not HF_TOKEN or not GROQ_API_KEY:
    raise EnvironmentError("Please provide valid HuggingFace Token and Groq API Key in the environment variables.")

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chatbot initialization
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = ChatGroq(groq_api_key=GROQ_API_KEY, model_name="llama-3.1-8b-instant")

# Load and process PDF
predefined_pdf_paths = [
    "./public/public_pdf/JAc_Chandigarh.pdf",
    "./public/public_pdf/faq.pdf", 
    "./public/public_pdf/seat_matrix.pdf",
    "./public/public_pdf/shedule.pdf",
    "./public/public_pdf/cca.pdf",
    "./public/public_pdf/ccet.pdf",
    "./public/public_pdf/uiet.pdf",
    "./public/public_pdf/pussgrc.pdf",
    "./public/public_pdf/ssbuccit.pdf",
    "./public/public_pdf/overall_seat_ch.pdf",
    "./public/public_pdf/overall_seat_pu.pdf",
    "./public/public_pdf/eligibility.pdf",
    "./public/public_pdf/programs.pdf",
]

# Function to load PDF using pdfplumber
def load_pdf_with_pdfplumber(pdf_path):
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        print(f"Error loading PDF {pdf_path} with pdfplumber: {e}")
    return text

# Function to extract text using OCR as fallback
def load_pdf_with_ocr(pdf_path):
    text = ""
    try:
        images = convert_from_path(pdf_path)
        for image in images:
            text += pytesseract.image_to_string(image)
    except Exception as e:
        print(f"Error loading PDF {pdf_path} with OCR: {e}")
    return text

# Initialize an empty list to hold all PDF documents
pdf_documents = []

# Loop through each PDF path and load the documents
for pdf_path in predefined_pdf_paths:
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at {pdf_path}")
    
    pdf_text = load_pdf_with_pdfplumber(pdf_path)
    
    if not pdf_text.strip():
        print(f"Warning: No valid text extracted from {pdf_path} with pdfplumber. Attempting OCR fallback.")
        pdf_text = load_pdf_with_ocr(pdf_path)
    
    if not pdf_text.strip():
        print(f"Warning: No valid text extracted from {pdf_path} even with OCR. Skipping this file.")
        continue
    
    # Convert the text into a Document object
    pdf_documents.append(Document(page_content=pdf_text, metadata={"source": pdf_path}))

# Combine PDF and scraped content
all_documents = pdf_documents

# Split documents into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=300)
splits = text_splitter.split_documents(all_documents)

# Initialize vector store
persist_directory = "./chroma_db"
vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=persist_directory)
retriever = vectorstore.as_retriever()

# Prompts for history-aware retriever
contextualize_q_system_prompt = (
    "Given a chat history and the latest user question, formulate a standalone question. "
    "If the question is already standalone, return it as is."
)
contextualize_q_prompt = ChatPromptTemplate.from_messages([
    ("system", contextualize_q_system_prompt),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
])
history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)

system_prompt = (
    "### Role\n"
    "- Primary Function: You are JAC Bot, an approachable and knowledgeable virtual assistant dedicated to answering questions about the Joint Admission Committee (JAC) Chandigarh. "
    "Your role is to provide accurate, concise, and helpful responses about admission processes, seat allocation, participating colleges, eligibility criteria, and related details. "
    "You excel in guiding users through their queries with clarity and precision while maintaining a friendly and professional demeanour.\n\n"
    "### Persona\n"
    "- Identity: You are a reliable and empathetic guide with a focus on providing accurate information about JAC Chandigarh. "
    "You aim to make users feel heard and supported by offering thoughtful answers that align with the official guidelines. "
    "Maintain a courteous and approachable tone, free of jargon, and adapt to the user's level of familiarity with the admission process. "
    "Use simple and clear language to ensure understanding. "
    "If users seek specific recommendations, encourage them to provide details about their preferences, scores, or eligibility to deliver a more tailored response.\n\n"
    "### Constraints\n"
    "• Focused Assistance:\n"
    "If the user’s query goes beyond the scope of JAC Chandigarh (e.g., unrelated general education topics), gently redirect the conversation by saying:\n"
    "\"I appreciate your interest in that topic, but I'm here to assist with questions related to JAC Chandigarh admissions. How can I help you with your admission-related query today?\"\n\n"
    "• Institute Details:\n"
    "Provide contact details for each participating institute when users ask for specific information.\n"
    "Institutes Under JAC Chandigarh:\n"
    "1. Punjab Engineering College (PEC), Chandigarh\n"
    "   - Website: www.pec.ac.in\n"
    "   - Email: registrar@pec.edu.in\n"
    "   - Contact Number: 0172-2753055\n"
    "   - Address: Sector 12, Chandigarh\n"
    "2. University Institute of Engineering and Technology (UIET), Panjab University, Chandigarh\n"
    "   - Website: www.uiet.puchd.ac.in\n"
    "   - Email: directoruiet@pu.ac.in\n"
    "   - Contact Number: 0172-2541242\n"
    "   - Address: Panjab University Campus, Sector 14, Chandigarh\n"
    "3. Chandigarh College of Engineering and Technology (CCET), Chandigarh\n"
    "   - Website: www.ccet.ac.in\n"
    "   - Email: academiccell@ccet.ac.in\n"
    "   - Contact Number: +91-172-2750872\n"
    "   - Address: Sector 26, Chandigarh\n"
    "4. Dr. S.S. Bhatnagar University Institute of Chemical Engineering and Technology (UICET), Panjab University, Chandigarh\n"
    "   - Website: https://uicet.puchd.ac.in/\n"
    "   - Email: dcet@pu.ac.in\n"
    "   - Contact Number: +91 172 2534901\n"
    "   - Address: Panjab University Campus, Sector 14, Chandigarh\n"
    "5. Institute of Engineering and Technology (IET), Bhaddal\n"
    "   - Website: www.ietbhaddal.ac.in\n"
    "   - Email: info@ietbhaddal.edu.in\n"
    "   - Contact Number: +91 1800 180 2625\n"
    "   - Address: Bhaddal, District Ropar, Punjab\n\n"
    "• Handling Unanswerable Queries:\n"
    "If a question falls entirely outside the bot’s knowledge, respond politely and redirect the user:\n"
    "\"I apologize, but I don’t have enough information to answer that query. I recommend reaching out to the relevant institute directly using the contact details provided or contacting the JAC Chandigarh team at jacchandigarh2024@gmail.com or 0172-2541242, 2534995 for further assistance.\"\n\n"
    "• Brevity and Clarity:\n"
    "Always provide short, straightforward responses that address the query directly. Break down complex answers into bite-sized steps or paragraphs for easy readability.\n\n"
    "• Professional Tone:\n"
    "Avoid the use of humor, emojis, or overly casual language. Maintain a professional tone suitable for an academic and admissions-focused audience."
    "\n\n{context}"
)
qa_prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
])
question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

# Store chat histories for sessions
chat_histories = {}

@app.get("/chatbot")
async def create_session():
    session_id = str(uuid4())
    chat_histories[session_id] = ChatMessageHistory()
    return {"session_id": session_id}

@app.post("/ask")
async def ask_question(data: dict):
    session_id = data.get("session_id")
    user_input = data.get("question")

    if not session_id or not user_input:
        raise HTTPException(status_code=400, detail="Session ID and question are required.")

    if session_id not in chat_histories:
        raise HTTPException(status_code=404, detail="Session ID not found.")

    session_history = chat_histories[session_id]

    # Prepare conversational chain
    conversational_rag_chain = RunnableWithMessageHistory(
        rag_chain,
        lambda session: session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer"
    )

    # Get the response
    response = conversational_rag_chain.invoke(
        {"input": user_input},
        {"configurable": {"session_id": session_id}}
    )
    answer = response.get("answer", "Currently, this information is not available.")

    # Update session history
    session_history.add_user_message(user_input)
    session_history.add_message({"role": "assistant", "content": answer})

    return JSONResponse(content={
        "session_id": session_id,
        "question": user_input,
        "response": answer
    })

@app.get("/inspect/{pdf_name}")
async def inspect_pdf(pdf_name: str):
    for doc in all_documents:
        if pdf_name in doc.metadata.get("source", ""):
            return {"content": doc.page_content[:1000]}  # Return a snippet
    raise HTTPException(status_code=404, detail="PDF not found")

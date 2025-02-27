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
from langchain_core.documents import Document  # Use core Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
import pdfplumber
from pdf2image import convert_from_path
import pytesseract
import logging
from typing import Dict, List, Any

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chatbot initialization
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = ChatGroq(groq_api_key=GROQ_API_KEY, model_name="gemma2-9b-it")

# Specify the folder containing PDFs
pdf_folder = "./public/public_pdf"

# Function to get all PDF files from a folder dynamically
def get_pdf_paths(folder_path):
    if not os.path.isdir(folder_path):
        logger.error(f"Directory not found: {folder_path}")
        raise FileNotFoundError(f"Directory not found: {folder_path}")
    pdf_paths = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
    if not pdf_paths:
        logger.warning(f"No PDF files found in directory: {folder_path}")
        raise FileNotFoundError(f"No PDF files found in directory: {folder_path}")
    logger.info(f"Found {len(pdf_paths)} PDF files in {folder_path}")
    return pdf_paths

# Function to format a table as a readable string
def format_table(table):
    if not table or not table[0]:
        return ""
    col_widths = [max(len(str(row[i] or "")) for row in table) for i in range(len(table[0]))]
    lines = []
    for row in table:
        formatted_row = " | ".join(
            str(cell or "").ljust(col_widths[i]) for i, cell in enumerate(row)
        )
        lines.append(formatted_row)
    if len(lines) > 1:
        header_separator = "-+-".join("-" * width for width in col_widths)
        lines.insert(1, header_separator)
    return "\n".join(lines)

# Function to load PDF with text and table extraction
def load_pdf_with_pdfplumber(pdf_path):
    documents = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text:
                    text_chunks = text.split('\n\n')
                    for chunk in text_chunks:
                        if chunk.strip():
                            documents.append(Document(
                                page_content=chunk.strip(),
                                metadata={"source": pdf_path, "page": page_num, "type": "text"}
                            ))
                tables = page.extract_tables()
                for i, table in enumerate(tables):
                    table_str = format_table(table)
                    if table_str:
                        documents.append(Document(
                            page_content=table_str,
                            metadata={"source": pdf_path, "page": page_num, "type": "table"}
                        ))
        logger.info(f"Extracted {len(documents)} documents from {pdf_path} with pdfplumber")
    except Exception as e:
        logger.error(f"Error loading PDF {pdf_path} with pdfplumber: {e}")
    return documents

# Function to extract text using OCR as fallback
def load_pdf_with_ocr(pdf_path):
    documents = []
    try:
        images = convert_from_path(pdf_path)
        for page_num, image in enumerate(images, start=1):
            text = pytesseract.image_to_string(image)
            if text.strip():
                documents.append(Document(
                    page_content=text.strip(),
                    metadata={"source": pdf_path, "page": page_num, "type": "text (OCR)"}
                ))
        logger.info(f"Extracted {len(documents)} documents from {pdf_path} with OCR")
    except Exception as e:
        logger.error(f"Error loading PDF {pdf_path} with OCR: {e}")
    return documents

# Initialize an empty list to hold all PDF documents
pdf_documents = []

# Get dynamic PDF paths and load the documents
try:
    pdf_paths = get_pdf_paths(pdf_folder)
    for pdf_path in pdf_paths:
        pdf_docs = load_pdf_with_pdfplumber(pdf_path)
        if not pdf_docs:
            logger.warning(f"No valid content extracted from {pdf_path} with pdfplumber. Attempting OCR fallback.")
            pdf_docs = load_pdf_with_ocr(pdf_path)
        if not pdf_docs:
            logger.warning(f"No valid content extracted from {pdf_path} even with OCR. Skipping this file.")
            continue
        pdf_documents.extend(pdf_docs)
    
    logger.info(f"Total documents extracted from all PDFs: {len(pdf_documents)}")
except Exception as e:
    logger.error(f"Error during PDF loading: {e}")
    raise

# Combine PDF content
all_documents = pdf_documents

# Split documents into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=300)
splits = text_splitter.split_documents(all_documents)
logger.info(f"Split documents into {len(splits)} chunks")

# Initialize vector store with batch processing
persist_directory = "./chroma_db"
vectorstore = Chroma(embedding_function=embeddings, persist_directory=persist_directory)
batch_size = 100
for i in range(0, len(splits), batch_size):
    batch = splits[i:i + batch_size]
    vectorstore.add_documents(batch)
    logger.info(f"Added batch {i//batch_size + 1}/{(len(splits)-1)//batch_size + 1} to vector store")

# Use the base retriever directly since custom retriever isn't critical here
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# Prompts for history-aware retriever
contextualize_q_system_prompt = (
    "Given a chat history and the latest user question, formulate a standalone question. "
    "If the question is already standalone, return it as is."
)
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    messages=[
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)
history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)

# Updated system prompt
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
    "### Instructions\n"
    "- Source Attribution: When providing an answer based on retrieved documents, include the source of the information at the end of your response. "
    "Use the format: 'This information is retrieved from the document filename, page number (document type).' For example, 'This information is retrieved from seat_matrix.pdf, page 1 (table).' "
    "Extract the source details from the metadata of the provided context documents, where the metadata includes keys 'source' (file path), 'page' (page number), and 'type' (e.g., 'text' or 'table'). "
    "If multiple sources are used, list them separated by commas. If no specific document is retrieved or the information is general knowledge, omit the source attribution.\n\n"
    "### Constraints\n"
    "• Focused Assistance:\n"
    "If the user's query goes beyond the scope of JAC Chandigarh (e.g., unrelated general education topics), gently redirect the conversation by saying:\n"
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
    "If a question falls entirely outside the bot's knowledge, respond politely and redirect the user:\n"
    "\"I apologize, but I don't have enough information to answer that query. I recommend reaching out to the relevant institute directly using the contact details provided or contacting the JAC Chandigarh team at jacchandigarh2024@gmail.com or 0172-2541242, 2534995 for further assistance.\"\n\n"
    "• Brevity and Clarity:\n"
    "Always provide short, straightforward responses that address the query directly. Break down complex answers into bite-sized steps or paragraphs for easy readability.\n\n"
    "• Professional Tone:\n"
    "Avoid the use of humor, emojis, or overly casual language. Maintain a professional tone suitable for an academic and admissions-focused audience.\n\n"
    "{context}"
)
qa_prompt = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)
question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

# Create the retrieval chain
rag_chain = create_retrieval_chain(
    history_aware_retriever,
    question_answer_chain
)

# Store chat histories for sessions
chat_histories = {}

@app.get("/chatbot")
async def create_session():
    session_id = str(uuid4())
    chat_histories[session_id] = ChatMessageHistory()
    logger.info(f"Created new session: {session_id}")
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
    logger.info(f"Processing question for session {session_id}: {user_input[:50]}...")

    # Prepare conversational chain
    conversational_rag_chain = RunnableWithMessageHistory(
        rag_chain,
        lambda session: session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer"
    )

    try:
        # Get the response with retrieved documents
        response = conversational_rag_chain.invoke(
            {"input": user_input},
            config={"configurable": {"session_id": session_id}}
        )
        
        answer = response.get("answer", "Currently, this information is not available.")
        retrieved_docs = response.get("context", [])
        
        # Extract source information from retrieved documents
        sources = []
        for doc in retrieved_docs:
            metadata = doc.metadata
            source = metadata.get("source", "Unknown source")
            page = metadata.get("page", "N/A")
            doc_type = metadata.get("type", "unknown")
            sources.append({
                "source": os.path.basename(source),
                "page": page,
                "type": doc_type
            })

        # Update session history
        session_history.add_user_message(user_input)
        session_history.add_ai_message(answer)
        
        logger.info(f"Successfully processed question for session {session_id}")
        
        return JSONResponse(content={
            "session_id": session_id,
            "question": user_input,
            "response": answer,
            "sources": sources
        })
        
    except Exception as e:
        logger.error(f"Error processing question for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing your question: {str(e)}")

@app.get("/inspect/{pdf_name}")
async def inspect_pdf(pdf_name: str):
    for doc in all_documents:
        if pdf_name in doc.metadata.get("source", ""):
            return {"content": doc.page_content[:1000]}
    logger.warning(f"PDF not found: {pdf_name}")
    raise HTTPException(status_code=404, detail="PDF not found")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "document_count": len(all_documents)}
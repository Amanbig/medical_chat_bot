from flask import Flask, request, jsonify
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.vectorstores import Chroma
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv
import os
import uuid
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

# Check for required environment variables
HF_TOKEN = os.getenv("HF_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not HF_TOKEN:
    raise EnvironmentError("HF_TOKEN not found in environment variables.")
if not GROQ_API_KEY:
    raise EnvironmentError("GROQ_API_KEY not found in environment variables.")

# Set environment variables explicitly
os.environ['HF_TOKEN'] = HF_TOKEN
os.environ['GROQ_API_KEY'] = GROQ_API_KEY

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize HuggingFace embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Dictionary to store chat histories and retrievers
chat_histories = {}
retrievers = {}

@app.route('/upload', methods=['POST'])
def upload_pdf():
    # Check if the file was uploaded
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    # session_id = "default"
    session_id = request.form.get('session_id') or str(uuid.uuid4())
    if session_id not in chat_histories:
        chat_histories[session_id] = ChatMessageHistory()

    uploaded_files = request.files.getlist('file')
    
    documents = []
    for uploaded_file in uploaded_files:
        # Handle only PDF files
        if uploaded_file.filename.endswith('.pdf'):
            try:
                # Save the uploaded PDF file temporarily
                temp_pdf_path = f"./temp_{session_id}.pdf"
                uploaded_file.save(temp_pdf_path)

                loader = PyPDFLoader(temp_pdf_path)
                docs = loader.load()
                documents.extend(docs)
            except Exception as e:
                return jsonify({"error": f"Failed to process PDF: {str(e)}"}), 500
        else:
            return jsonify({"error": "Only PDF files are allowed"}), 400

    # Split and create embeddings for the documents
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=500)
    splits = text_splitter.split_documents(documents)
    
    try:
        vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings)
        retriever = vectorstore.as_retriever()
        retrievers[session_id] = retriever  # Store the retriever with the session_id
    except Exception as e:
        return jsonify({"error": f"Failed to create embeddings: {str(e)}"}), 500

    return jsonify({"session_id": session_id}), 200


@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    session_id = data.get('session_id')
    user_input = data.get('question')

    if not user_input:
        return jsonify({"error": "No question provided"}), 400

    if session_id not in chat_histories or session_id not in retrievers:
        return jsonify({"error": "Invalid session ID"}), 400

    session_history = chat_histories.get(session_id)
    retriever = retrievers.get(session_id)

    # Initialize the LLM and prompt templates
    llm = ChatGroq(groq_api_key=GROQ_API_KEY, model_name="Gemma2-9b-It")

    # Define prompts for the question
    contextualize_q_system_prompt = (
        "Given a chat history and the latest user question "
        "which might reference context in the chat history, "
        "formulate a standalone question which can be understood "
        "without the chat history. Do NOT answer the question, "
        "just reformulate it if needed and otherwise return it as is."
    )
    
    contextualize_q_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", contextualize_q_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}")
        ]
    )

    # Create history-aware retriever
    history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)

    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know. Use three sentences maximum and keep the "
        "answer concise."
        "\n\n"
        "{context}"
    )
    
    qa_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}")
        ]
    )

    # Build the chains
    question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

    conversational_rag_chain = RunnableWithMessageHistory(
        rag_chain, lambda session: chat_histories[session],
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer"
    )

    try:
        # Invoke the chain and get a response
        response = conversational_rag_chain.invoke(
            {"input": user_input},
            config={
                "configurable": {"session_id": session_id}
            }
        )
        answer = response['answer']
    except Exception as e:
        return jsonify({"error": f"Failed to process the question: {str(e)}"}), 500

    # Update chat history with the user input and assistant's answer
    session_history.add_message({"role": "user", "content": user_input})
    session_history.add_message({"role": "assistant", "content": answer})

    return jsonify({"answer": answer}), 200


if __name__ == '__main__':
    app.run(debug=True)

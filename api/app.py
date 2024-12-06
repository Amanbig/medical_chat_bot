import streamlit as st
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.vectorstores import FAISS  # Use FAISS for local vector storage
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from datasets import load_dataset
from langchain.schema import Document
import os
from dotenv import load_dotenv
load_dotenv()

# Load environment variables
os.environ['HF_TOKEN'] = os.getenv("HF_TOKEN")
os.environ['GROQ_API_KEY'] = os.getenv("GROQ_API_KEY")
groq_api_key = os.getenv("GROQ_API_KEY")

# Ensure API keys are provided
if not groq_api_key or not os.getenv("HF_TOKEN"):
    st.warning("Please provide valid Groq API Key and HuggingFace Token in .env")
else:
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # Set up Streamlit UI
    st.title("Chatbot using Groq API")
    st.write("Chat with content from a HuggingFace dataset")

    # Input the Groq API Key
    api_key = groq_api_key

    if api_key:
        llm = ChatGroq(groq_api_key=api_key, model_name="Gemma2-9b-It")

        # Chat interface
        session_id = st.text_input("Session ID", value="default_session")

        # Statefully manage chat history
        if 'store' not in st.session_state:
            st.session_state.store = {}

        # Load a HuggingFace dataset (you can change the dataset name here)
        dataset_name = "Ujjwal671021/jac-chandigarh-information-brochure"  # Example: You can use other datasets like 'squad', 'yelp', etc.
        dataset = load_dataset(dataset_name, split='train')  # Load the 'train' split of the dataset

        # Prepare documents from the dataset and wrap them as Document objects
        documents = []
        for doc in dataset:
            # Ensure the dataset has the 'text' column and wrap in Document
            if 'text' in doc:
                documents.append(Document(page_content=doc['text']))  # Wrap text in a Document

        # Split and create embeddings for the documents
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=500)
        splits = text_splitter.split_documents(documents)

        # Use FAISS for local vector storage
        vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
        retriever = vectorstore.as_retriever()

        # Contextualize user questions
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
                ("human", "{input}"),
            ]
        )

        # Create history-aware retriever
        history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)

        # Define system prompt for answering questions
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
                ("human", "{input}"),
            ]
        )

        # Create the question-answering chain
        question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
        rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

        def get_session_history(session: str) -> BaseChatMessageHistory:
            if session_id not in st.session_state.store:
                st.session_state.store[session_id] = ChatMessageHistory()
            return st.session_state.store[session_id]

        # Set up the conversational chain
        conversational_rag_chain = RunnableWithMessageHistory(
            rag_chain, get_session_history,
            input_messages_key="input",
            history_messages_key="chat_history",
            output_messages_key="answer"
        )

        # Handle user input and provide responses
        user_input = st.text_input("Your question:")
        if user_input:
            session_history = get_session_history(session_id)
            response = conversational_rag_chain.invoke(
                {"input": user_input},
                config={
                    "configurable": {"session_id": session_id}
                },  # constructs a key "default_session" in `store` for the session.
            )
            st.write("Assistant:", response['answer'])
    else:
        st.warning("Please put the correct Groq API Key")

import re
import unicodedata
import google.generativeai as genai
from fastapi import HTTPException
from core.config import settings

# Configure Gemini API
genai.configure(api_key=settings.GOOGLE_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

def clean_text(chat_message: str) -> str:
    """Clean and normalize the generated chat message."""
    cleaned_message = unicodedata.normalize("NFKD", chat_message)
    cleaned_message = re.sub(r'[\n\\]+', ' ', cleaned_message)
    cleaned_message = re.sub(r'\s+', ' ', cleaned_message)
    cleaned_message = cleaned_message.encode('ascii', 'ignore').decode('utf-8')  # Remove non-ASCII
    return cleaned_message.strip()

async def refine_chat_message(chat_message: str) -> str:
    """Refine the chat message using the Gemini API with two-step refinement."""
    try:
        # Step 1: Initial refinement to correct grammar and coherence
        first_prompt = f"""
        Please improve the grammar, clarity, and coherence of the following chat message. 
        Ensure the meaning and tone are preserved:
        
        "{chat_message}"
        
        Only return the improved message without additional commentary.
        """

        first_response = gemini_model.generate_content(first_prompt)
        first_refined = getattr(first_response, 'text', str(first_response))
        
        # Step 2: Final polishing for conversational flow
        final_prompt = f"""
        Further enhance the clarity, fluency, and conversational tone of this message:
        
        "{first_refined}"
        
        Ensure it sounds natural and engaging for a chat setting.
        """

        final_response = gemini_model.generate_content(final_prompt)
        final_refined = getattr(final_response, 'text', str(final_response))
        
        return final_refined.strip() if final_refined else chat_message  # Fallback to the original message
    
    except Exception as e:
        print(f"Error in chat message refinement: {str(e)}")
        return chat_message  # Return the original message if refinement fails

# Example usage within an async function:
# async def main():
#     input_message = "i want you give me good advice about code!"
#     refined_message = await refine_chat_message(input_message)
#     print("Refined Chat Message:", refined_message)

# if __name__ == "__main__":
#     import asyncio
#     asyncio.run(main())

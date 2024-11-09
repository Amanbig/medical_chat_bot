from transformers import pipeline

# Load the model from Hugging Face
model_name = "Ujjwal671021/llama-2-7b-uj"
generator = pipeline("text-generation", model=model_name)

# Provide a simple prompt to test text generation
prompt = "Once upon a time"
generated_text = generator(prompt, max_length=50)
print(generated_text)

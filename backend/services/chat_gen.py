import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel, GPT2Config
from core.config import settings

class Chatbot:
    def __init__(self, model_path=settings.MODEL_PATH):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Use the appropriate tokenizer for 'gpt2-large'
        self.tokenizer = GPT2Tokenizer.from_pretrained('gpt2-large')
        self.tokenizer.pad_token = self.tokenizer.eos_token  # Setting pad_token
        self.model =  GPT2LMHeadModel.from_pretrained('amanpreet7/gpt2-chat-model') #100
        # self.model =  GPT2LMHeadModel.from_pretrained('amanpreet7/gp2-v1')
        # GPT2Config with parameters similar to 'gpt2-large'
        self.config = GPT2Config(
            vocab_size=self.tokenizer.vocab_size,
            n_positions=1024,  # Adjust based on 'gpt2-large'
            n_ctx=1024,        # Context size for gpt2-large
            n_embd=1280,       # Embedding dimension for gpt2-large
            n_layer=24,        # Layers for gpt2-large
            n_head=20          # Attention heads for gpt2-large
        )
        
        # Initialize the model using the GPT2LMHeadModel with the config
        # self.model = GPT2LMHeadModel(self.config)
        # self.load_model(model_path)
        self.model.to(self.device)
        self.best_loss = float('inf')
    
    # def load_model(self, path):
    #     checkpoint = torch.load(path, map_location=self.device)
    #     print("Checkpoint keys:", checkpoint.keys())  # Inspect the checkpoint
    #     self.model.load_state_dict(checkpoint['lm_head.weight'])  # Modify based on the actual key


    def chat(self, prompt, max_length=150, temperature=0.7):
        # self.model.eval()
        input_ids = self.tokenizer.encode(prompt, return_tensors='pt').to(self.device)
        
        with torch.no_grad():
            # Generating the output with the model
            output_ids = self.model.generate(
                input_ids,
                max_length=max_length,
                num_return_sequences=1,
                do_sample=True,
                top_k=50,
                top_p=0.95,
                num_beams=1,
                temperature=temperature,
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
                length_penalty=1.0,
                no_repeat_ngram_size=3,
                early_stopping=True
            )[0]
        
        # Decode the output into readable text
        return self.tokenizer.decode(output_ids, skip_special_tokens=True)

'''
import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel
from core.config import settings

class Chatbot:
    def __init__(self, model_path=settings.MODEL_PATH):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Load the tokenizer and model from the pre-trained source
        self.tokenizer = GPT2Tokenizer.from_pretrained('amanpreet7/gp2-v1') #500
        self.tokenizer.pad_token = self.tokenizer.eos_token  # Set padding token to EOS
        
        self.model = GPT2LMHeadModel.from_pretrained('amanpreet7/gp2-v1')
        self.model.to(self.device)

    def chat(self, prompt, max_length=150, temperature=0.7):
        self.model.eval()
        # Tokenize input prompt and move to the correct device
        inputs = self.tokenizer(prompt, return_tensors='pt', truncation=True, padding=True, max_length=max_length).to(self.device)
        
        with torch.no_grad():
            output = self.model.generate(
                input_ids=inputs['input_ids'],  # Corrected input_ids usage
                attention_mask=inputs['attention_mask'],  # Corrected attention_mask usage
                max_length=max_length, 
                num_return_sequences=1,
                temperature=temperature,
                top_p=0.9,
                top_k=50,
                no_repeat_ngram_size=2,
                do_sample=True
            )
        
        # Decode and return the generated text
        return self.tokenizer.decode(output[0], skip_special_tokens=True)

'''

import os
from huggingface_hub import InferenceClient
from app.config import HUGGINGFACE_TOKEN
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import base64

# ========== CONFIGURATION ==========

class ImageGenerator:
    def __init__(self):
        # Use the token from config.py
        self.hf_token = HUGGINGFACE_TOKEN or os.getenv("HF_TOKEN", "")
        self.client = None
        
        if self.hf_token:
            try:
                self.client = InferenceClient(token=self.hf_token)
                print(f"✅ HuggingFace client initialized successfully")
            except Exception as e:
                print(f"❌ Failed to initialize HF client: {e}")
                self.client = None
        else:
            print("⚠️ No HuggingFace token found - will use placeholder images")

    def generate_image(self, prompt: str) -> dict:
        """
        Generate image using FLUX.1-dev model or fallback to placeholder
        Returns dict with image data and metadata
        """
        if self.client and self.hf_token:
            try:
                print(f"🎨 Generating AI image with prompt: {prompt[:100]}...")
                image = self.client.text_to_image(
                    prompt,
                    model="black-forest-labs/FLUX.1-dev"
                )
                
                # Convert PIL Image to base64
                if image:
                    buffered = BytesIO()
                    image.save(buffered, format="PNG")
                    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
                    
                    return {
                        "success": True,
                        "image_base64": img_str,
                        "source": "huggingface"
                    }
                
            except Exception as e:
                print(f"HuggingFace image generation failed: {str(e)}")
        
        # Fall back to placeholder
        print("🎨 Generating placeholder image...")
        placeholder = self._generate_placeholder_image(prompt)
        return {
            "success": False,
            "image_base64": placeholder,
            "source": "placeholder"
        }
    
    def create_image_prompt(self, business_type: str, content_description: str) -> str:
        """Create an optimized prompt for image generation"""
        return f"Professional {business_type} marketing image: {content_description}, high quality, modern design, clean background, commercial photography style"
    
    def _generate_placeholder_image(self, prompt: str) -> str:
        """Generate a placeholder image with the prompt text"""
        try:
            # Create a simple placeholder image
            width, height = 800, 600
            image = Image.new('RGB', (width, height), color='#f0f8ff')
            draw = ImageDraw.Draw(image)
            
            # Try to use a default font, fall back to default if not available
            try:
                font = ImageFont.truetype("arial.ttf", 24)
                small_font = ImageFont.truetype("arial.ttf", 16)
            except:
                font = ImageFont.load_default()
                small_font = ImageFont.load_default()
            
            # Add title
            title = "EcoLens AI Generated Content"
            draw.text((50, 50), title, fill='#333', font=font)
            
            # Add prompt text (wrapped)
            wrapped_prompt = self._wrap_text(prompt, 60)
            prompt_lines = wrapped_prompt.split('\n')
            
            y_offset = 150
            for line in prompt_lines[:8]:  # Limit to 8 lines
                draw.text((50, y_offset), line, fill='#666', font=small_font)
                y_offset += 30
            
            # Convert to base64
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return img_str
            
        except Exception as e:
            print(f"Placeholder image generation failed: {str(e)}")
            return None
    
    def _wrap_text(self, text: str, width: int) -> str:
        """Simple text wrapping"""
        words = text.split()
        lines = []
        current_line = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 <= width:
                current_line.append(word)
                current_length += len(word) + 1
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
                current_length = len(word)
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return '\n'.join(lines)
    
    def _generate_fallback_image_prompt(self, user_input) -> str:
        """Generate a suitable image prompt based on business content"""
        business_type = user_input.business_name.lower()
        content_type = user_input.output_type.lower()
        
        if "social media" in content_type:
            return f"professional {business_type} social media post background, clean design, modern aesthetic"
        elif "blog" in content_type:
            return f"{business_type} blog header image, professional, clean, modern design"
        elif "email" in content_type:
            return f"{business_type} email newsletter header, professional design, clean layout"
        else:
            return f"professional {business_type} marketing image, clean modern design"
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return '\n'.join(lines)
    
    def _generate_fallback_image_prompt(self, user_input) -> str:
        """Generate a suitable image prompt based on business content"""
        business_type = user_input.business_name.lower()
        content_type = user_input.output_type.lower()
        
        if "social media" in content_type:
            return f"professional {business_type} social media post background, clean design, modern aesthetic"
        elif "blog" in content_type:
            return f"{business_type} blog header image, professional, clean, modern design"
        elif "email" in content_type:
            return f"{business_type} email newsletter header, professional design, clean layout"
        else:
            return f"professional {business_type} marketing image, clean modern design"

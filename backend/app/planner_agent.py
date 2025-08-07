import os
from typing import Optional, List
from dataclasses import dataclass
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.image_generator import ImageGenerator
from app.config import GEMINI_API_KEY

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# ========== DATA STRUCTURES ==========

class PlannerInput(BaseModel):
    business_name: str
    output_type: str
    periodic_content: bool
    additional_prompt: str

class Subtask(BaseModel):
    name: str
    description: str

class PlannerReport(BaseModel):
    task_summary: str
    subtasks: List[Subtask]
    clarification_questions: Optional[List[str]] = None
    llm_decision_rationale: str

# ========== CONTENT GENERATION AGENT ==========

class PlannerAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.image_generator = ImageGenerator()

    def analyze_prompt(self, user_input: PlannerInput) -> PlannerReport:
        questions = []
        
        # Check if we need clarification
        if not user_input.additional_prompt or len(user_input.additional_prompt.strip()) < 10:
            questions.append("What specific message or theme would you like to convey?")
        
        if user_input.business_name.lower() in ["business", "company", "startup"]:
            questions.append("What industry or sector does your business operate in?")
            
        if user_input.output_type == "text" and not user_input.additional_prompt:
            questions.append("What type of text content do you need? (e.g., social media post, blog article, product description)")
        
        # Add image-specific questions
        if user_input.output_type == "image":
            if not questions:
                questions.append("What style or mood should the image convey?")
                questions.append("What specific elements should be included in the image?")
        
        if user_input.periodic_content and not questions:
            questions.append("How often do you plan to publish this type of content?")
        
        # Add target audience question if other questions exist
        if questions and len(questions) < 3:
            questions.append("Who is your target audience?")
        
        # Limit to max 5 questions
        questions = questions[:5]
        
        return PlannerReport(
            task_summary=f"Generate {user_input.output_type} content for {user_input.business_name}",
            subtasks=[
                Subtask(name="Content Analysis", description="Analyze requirements and context"),
                Subtask(name="Content Creation", description="Generate tailored content"),
                Subtask(name="Quality Review", description="Review and refine content")
            ],
            clarification_questions=questions if questions else None,
            llm_decision_rationale="Analysis based on provided information and best practices"
        )

    def generate_content(self, user_input: PlannerInput) -> dict:
        """Generate both text and image content if image is requested"""
        image_needed = self._should_generate_image(user_input.output_type, user_input.additional_prompt)
        text_result = self._generate_text_content(user_input)
        if image_needed:
            image_result = self._generate_image_content(user_input)
            # Return both text and image in a unified dict
            return {
                "type": "image",
                "content": text_result["content"],  # The actual marketing text
                "image_label": image_result.get("content", ""),
                "image_prompt": image_result.get("prompt", ""),
                "image_data": image_result.get("image_data", ""),
                "image_source": image_result.get("image_source", ""),
            }
        else:
            return text_result
    
    def _should_generate_image(self, output_type: str, prompt: str) -> bool:
        """Determine if image generation is needed"""
        image_keywords = ['image', 'picture', 'visual', 'graphic', 'logo', 'banner', 'poster']
        return any(keyword in output_type.lower() or keyword in prompt.lower() for keyword in image_keywords)
    
    def _generate_text_content(self, user_input: PlannerInput) -> dict:
        """Generate text content using Gemini"""
        user_prompt = user_input.additional_prompt or f"Create engaging {user_input.output_type} content for a {user_input.business_name} business"
        
        prompt = f"""
You are a professional content creator specializing in business marketing content.

Create {user_input.output_type} content for the following business:

Business Name/Domain: {user_input.business_name}
Content Type: {user_input.output_type}
Is this periodic content: {user_input.periodic_content}
Specific Request: {user_prompt}

Generate engaging, professional content that would be suitable for this business. 
Be creative and provide valuable content that would appeal to their target audience.

Respond ONLY with the final content (no metadata, no explanation).
"""
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.7),
            )
            return {
                "type": "text",
                "content": response.text.strip()
            }
        except Exception as e:
            return {
                "type": "text",
                "content": self._generate_fallback_text_content(user_input, str(e))
            }
    
    def _generate_image_content(self, user_input: PlannerInput) -> dict:
        """Generate image content using Hugging Face"""
        try:
            image_prompt = self.image_generator.create_image_prompt(
                user_input.business_name, 
                user_input.additional_prompt
            )
            image_result = self.image_generator.generate_image(image_prompt)
            
            if image_result and image_result.get("image_base64"):
                return {
                    "type": "image",
                    "content": f"Generated image for {user_input.business_name}",
                    "prompt": image_prompt,
                    "image_data": image_result["image_base64"],
                    "image_source": image_result.get("source", "unknown")
                }
            else:
                # Fallback to text if image generation completely fails
                return self._generate_text_content(user_input)
        except Exception as e:
            print(f"Image generation error: {e}")
            # Fallback to text if image generation fails
            return self._generate_text_content(user_input)

    def _generate_fallback_text_content(self, user_input: PlannerInput, error_msg: str) -> str:
        """Generate fallback content when API is unavailable"""
        business_type = user_input.business_name
        content_type = user_input.output_type
        prompt = user_input.additional_prompt
        
        return f"""Professional {content_type} for {business_type}

{prompt if prompt else f"Quality content tailored for your {business_type.lower()} needs."}

[Note: This is template content - API quota temporarily exceeded. Please try again later for AI-generated content.]"""

    def generate_final_content(self, user_input: PlannerInput, report: PlannerReport) -> str:
        # Mock implementation - replace with your actual logic
        return f"Generated content for {user_input.business_name}: {user_input.additional_prompt}"

# ========== FASTAPI SERVER ==========

class PlannerRequest(BaseModel):
    business_name: str
    output_type: str
    periodic_content: bool
    additional_prompt: Optional[str] = ""

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = PlannerAgent()

@app.post("/generate")
def generate(payload: PlannerRequest):
    user_input = PlannerInput(
        business_name=payload.business_name,
        output_type=payload.output_type,
        periodic_content=payload.periodic_content,
        additional_prompt=payload.additional_prompt
    )
    content = agent.generate_content(user_input)
    return {"status": "done", "content": content}
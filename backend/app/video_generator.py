import os
import base64
import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import moviepy.editor as mp
import numpy as np
from app.config import HUGGINGFACE_TOKEN

class VideoGenerator:
    def __init__(self):
        self.hf_token = HUGGINGFACE_TOKEN or os.getenv("HF_TOKEN", "")
        self.api_url = "https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b"
        
        if self.hf_token:
            print("✅ Video Generator initialized with HuggingFace token")
        else:
            print("⚠️ No HuggingFace token found - will use placeholder videos")

    def generate_video(self, prompt: str, duration: int = 5) -> dict:
        """
        Generate video using HuggingFace Text-to-Video model
        Returns dict with video data and metadata
        """
        if self.hf_token:
            try:
                print(f"🎬 Generating AI video with prompt: {prompt[:100]}...")
                
                headers = {"Authorization": f"Bearer {self.hf_token}"}
                payload = {
                    "inputs": prompt,
                    "parameters": {
                        "num_frames": duration * 24,  # 24 FPS
                        "height": 512,
                        "width": 512
                    }
                }
                
                response = requests.post(self.api_url, headers=headers, json=payload)
                
                if response.status_code == 200:
                    video_bytes = response.content
                    video_base64 = base64.b64encode(video_bytes).decode("utf-8")
                    
                    return {
                        "success": True,
                        "video_base64": video_base64,
                        "source": "huggingface",
                        "format": "mp4",
                        "duration": duration
                    }
                else:
                    print(f"❌ HuggingFace API error: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ HuggingFace video generation failed: {str(e)}")
        
        # Fallback to placeholder video
        print("🎬 Generating placeholder video...")
        placeholder = self._generate_placeholder_video(prompt, duration)
        return {
            "success": False,
            "video_base64": placeholder,
            "source": "placeholder",
            "format": "mp4",
            "duration": duration
        }

    def create_video_prompt(self, business_type: str, content_description: str, video_style: str = "professional") -> str:
        """Create an optimized prompt for video generation"""
        style_prompts = {
            "professional": "professional corporate style, clean modern aesthetics, business presentation",
            "creative": "creative artistic style, dynamic visuals, engaging animations",
            "marketing": "marketing advertisement style, vibrant colors, promotional content",
            "educational": "educational tutorial style, clear explanations, informative visuals"
        }
        
        style_text = style_prompts.get(video_style, style_prompts["professional"])
        
        return f"A {style_text} video about {business_type}: {content_description}, high quality, smooth transitions, 4k resolution"

    def _generate_placeholder_video(self, prompt: str, duration: int = 5) -> str:
        """Generate a placeholder video with animated text"""
        try:
            # Create frames for the video
            fps = 24
            total_frames = duration * fps
            width, height = 800, 600
            
            frames = []
            
            for frame_num in range(total_frames):
                # Create frame
                img = Image.new('RGB', (width, height), color='#f0f8ff')
                draw = ImageDraw.Draw(img)
                
                # Try to load font
                try:
                    title_font = ImageFont.truetype("arial.ttf", 36)
                    content_font = ImageFont.truetype("arial.ttf", 20)
                    small_font = ImageFont.truetype("arial.ttf", 16)
                except:
                    title_font = ImageFont.load_default()
                    content_font = ImageFont.load_default()
                    small_font = ImageFont.load_default()
                
                # Animated background gradient
                progress = frame_num / total_frames
                bg_color = self._interpolate_color('#667eea', '#764ba2', progress)
                
                # Create gradient background
                for y in range(height):
                    gradient_progress = y / height
                    color = self._interpolate_color(bg_color, '#f0f8ff', gradient_progress)
                    draw.line([(0, y), (width, y)], fill=color)
                
                # Add animated title
                title = "🎬 EcoLens AI Video Generator"
                title_y = 100 + int(20 * np.sin(frame_num * 0.1))  # Floating animation
                self._draw_text_with_shadow(draw, title, (width//2, title_y), title_font, center=True)
                
                # Add content with fade-in effect
                if frame_num > fps:  # Start after 1 second
                    alpha = min(1.0, (frame_num - fps) / fps)  # Fade in over 1 second
                    content_alpha = int(255 * alpha)
                    
                    # Wrap and display prompt
                    wrapped_prompt = self._wrap_text(prompt, 60)
                    lines = wrapped_prompt.split('\n')[:5]  # Max 5 lines
                    
                    y_offset = 250
                    for line in lines:
                        self._draw_text_with_shadow(draw, line, (width//2, y_offset), content_font, center=True, alpha=content_alpha)
                        y_offset += 30
                
                # Add progress bar
                bar_width = 400
                bar_height = 8
                bar_x = (width - bar_width) // 2
                bar_y = height - 80
                
                # Background bar
                draw.rectangle([bar_x, bar_y, bar_x + bar_width, bar_y + bar_height], fill='#e0e0e0')
                # Progress bar
                progress_width = int(bar_width * progress)
                draw.rectangle([bar_x, bar_y, bar_x + progress_width, bar_y + bar_height], fill='#667eea')
                
                # Add timestamp
                timestamp = f"{frame_num / fps:.1f}s / {duration}.0s"
                self._draw_text_with_shadow(draw, timestamp, (width//2, height - 50), small_font, center=True)
                
                # Convert PIL image to numpy array
                frame_array = np.array(img)
                frames.append(frame_array)
            
            # Create video clip using moviepy
            clip = mp.ImageSequenceClip(frames, fps=fps)
            
            # Save to bytes
            temp_path = f"temp_video_{os.getpid()}.mp4"
            clip.write_videofile(temp_path, verbose=False, logger=None)
            
            # Read and encode
            with open(temp_path, 'rb') as f:
                video_bytes = f.read()
            
            # Clean up
            os.remove(temp_path)
            
            video_base64 = base64.b64encode(video_bytes).decode("utf-8")
            return video_base64
            
        except Exception as e:
            print(f"❌ Placeholder video generation failed: {str(e)}")
            return None

    def _interpolate_color(self, color1: str, color2: str, t: float) -> tuple:
        """Interpolate between two hex colors"""
        c1 = tuple(int(color1[i:i+2], 16) for i in (1, 3, 5))
        c2 = tuple(int(color2[i:i+2], 16) for i in (1, 3, 5))
        
        return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

    def _draw_text_with_shadow(self, draw, text: str, position: tuple, font, center: bool = False, alpha: int = 255):
        """Draw text with shadow effect"""
        x, y = position
        
        if center:
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            x = x - text_width // 2
        
        # Shadow
        shadow_color = (0, 0, 0, alpha // 2) if alpha < 255 else (0, 0, 0, 128)
        draw.text((x + 2, y + 2), text, fill=shadow_color[:3], font=font)
        
        # Main text
        text_color = (255, 255, 255, alpha) if alpha < 255 else (255, 255, 255)
        draw.text((x, y), text, fill=text_color[:3], font=font)

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

    def generate_social_media_video(self, content: str, platform: str = "instagram") -> dict:
        """Generate platform-specific video content"""
        platform_specs = {
            "instagram": {"width": 1080, "height": 1080, "duration": 15, "style": "creative"},
            "tiktok": {"width": 1080, "height": 1920, "duration": 30, "style": "creative"},
            "youtube": {"width": 1920, "height": 1080, "duration": 60, "style": "professional"},
            "linkedin": {"width": 1200, "height": 675, "duration": 30, "style": "professional"}
        }
        
        specs = platform_specs.get(platform, platform_specs["instagram"])
        prompt = f"{content}, optimized for {platform}, {specs['style']} style"
        
        return self.generate_video(prompt, specs["duration"])

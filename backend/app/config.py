import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_API_KEY")  # This matches your .env file

# Facebook Configuration
FB_ACCESS_TOKEN = os.getenv("FB_ACCESS_TOKEN")
FB_PAGE_ID = os.getenv("FB_PAGE_ID")

# Image Generation Settings
MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", 1024))
IMAGE_QUALITY = os.getenv("IMAGE_QUALITY", "high")
DEFAULT_IMAGE_STYLE = os.getenv("DEFAULT_IMAGE_STYLE", "professional")

# Content Generation Settings
MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 500))
DEFAULT_TONE = os.getenv("DEFAULT_TONE", "engaging")
INCLUDE_HASHTAGS = os.getenv("INCLUDE_HASHTAGS", "true").lower() == "true"

print("🔑 Configuration loaded:")
print(f"  - Gemini API Key: {'✅' if GEMINI_API_KEY else '❌'}")
print(f"  - HuggingFace Token: {'✅' if HUGGINGFACE_TOKEN else '❌'}")
print(f"  - Facebook Token: {'✅' if FB_ACCESS_TOKEN else '❌'}")

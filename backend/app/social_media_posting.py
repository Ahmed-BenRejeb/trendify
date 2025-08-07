import os
import base64
import tempfile
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
import urllib.parse
from fastapi.responses import RedirectResponse

load_dotenv()

# Facebook config
FB_ACCESS_TOKEN = os.getenv("FB_ACCESS_TOKEN")
FB_PAGE_ID = os.getenv("FB_PAGE_ID")

# LinkedIn OAuth config
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/social/linkedin/callback")

# These are for posting after you get an access token
LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")
LINKEDIN_ORG_ID = os.getenv("LINKEDIN_ORG_ID")

router = APIRouter()
scheduler = BackgroundScheduler()
scheduler.start()

# Models
class FacebookPostNow(BaseModel):
    content: str
    image_data: str = None

class FacebookSchedulePost(BaseModel):
    content: str
    scheduled_time: int
    image_data: str = None

class LinkedInPost(BaseModel):
    content: str
    image_data: str = None  # <-- Add this line to allow image posting via API

class LinkedInSchedulePost(BaseModel):
    content: str
    scheduled_time: int

def get_person_id(access_token):
    """Get LinkedIn person ID from access token"""
    if not access_token:
        return None
        
    url = "https://api.linkedin.com/v2/userinfo"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"LinkedIn user data: {data}")
            return data.get('sub')  # This is the person ID
        else:
            print(f"Error getting person ID: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Exception getting person ID: {str(e)}")
        return None

# Facebook Functions
def post_to_facebook(message: str):
    try:
        if not FB_ACCESS_TOKEN or not FB_PAGE_ID:
            raise Exception("Missing Facebook configuration")
        
        url = f"https://graph.facebook.com/v18.0/{FB_PAGE_ID}/feed"
        payload = {
            "message": message,
            "access_token": FB_ACCESS_TOKEN
        }
        response = requests.post(url, data=payload)
        
        if response.status_code != 200:
            print(f"[ERROR] Facebook post failed: {response.text}")
            raise Exception(f"Failed to post to Facebook: {response.text}")
        
        result = response.json()
        post_id = result.get('id', 'Unknown')
        print(f"[SUCCESS] Facebook post published with ID: {post_id}")
        return {"post_id": post_id}
        
    except Exception as e:
        print(f"[ERROR] Facebook posting error: {str(e)}")
        raise

def post_image_to_facebook(message: str, image_base64: str):
    """Post image with text to Facebook page"""
    try:
        if not FB_ACCESS_TOKEN or not FB_PAGE_ID:
            raise Exception("Missing Facebook configuration")
        
        # Convert base64 to temporary file
        image_data = base64.b64decode(image_base64)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
            temp_file.write(image_data)
            temp_file_path = temp_file.name
        
        url = f"https://graph.facebook.com/v18.0/{FB_PAGE_ID}/photos"
        
        with open(temp_file_path, 'rb') as image_file:
            files = {'source': image_file}
            data = {
                'message': message,
                'access_token': FB_ACCESS_TOKEN
            }
            
            response = requests.post(url, files=files, data=data)
        
        os.unlink(temp_file_path)
        
        if response.status_code != 200:
            print(f"[ERROR] Facebook image post failed: {response.text}")
            raise Exception(f"Failed to post image to Facebook: {response.text}")
        
        result = response.json()
        post_id = result.get('id', 'Unknown')
        print(f"[SUCCESS] Facebook image post published with ID: {post_id}")
        return {"post_id": post_id}
        
    except Exception as e:
        print(f"[ERROR] Facebook image posting error: {str(e)}")
        raise Exception(f"Failed to post image to Facebook: {str(e)}")

# LinkedIn Functions
def post_to_linkedin(message: str, access_token: str = None, image_data: str = None):
    """Post to LinkedIn using access token - supports optional image"""
    token = access_token or LINKEDIN_ACCESS_TOKEN

    if not token:
        print(f"[ERROR] Missing LinkedIn Access Token")
        raise Exception("Missing LinkedIn Access Token")

    # Get person ID
    person_id = get_person_id(token)
    if not person_id:
        print(f"[ERROR] Unable to get LinkedIn person ID")
        raise Exception("Unable to get LinkedIn person ID")

    print(f"📤 Posting to LinkedIn for person: {person_id}")
    print(f"📝 Message: {message[:100]}...")

    url = "https://api.linkedin.com/v2/ugcPosts"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }

    # --- IMPLEMENT LINKEDIN IMAGE UPLOAD ---
    asset_urn = None
    if image_data:
        try:
            # 1. Register upload
            register_url = "https://api.linkedin.com/v2/assets?action=registerUpload"
            register_payload = {
                "registerUploadRequest": {
                    "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                    "owner": f"urn:li:person:{person_id}",
                    "serviceRelationships": [
                        {
                            "relationshipType": "OWNER",
                            "identifier": "urn:li:userGeneratedContent"
                        }
                    ]
                }
            }
            reg_headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            reg_resp = requests.post(register_url, json=register_payload, headers=reg_headers)
            reg_resp.raise_for_status()
            reg_data = reg_resp.json()
            asset_urn = reg_data["value"]["asset"]
            upload_url = reg_data["value"]["uploadMechanism"]["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]["uploadUrl"]
            print(f"🖼️ LinkedIn asset URN: {asset_urn}")
            print(f"🖼️ LinkedIn upload URL: {upload_url}")

            # 2. Upload image (binary)
            image_bytes = base64.b64decode(image_data)
            upload_headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/octet-stream"
            }
            upload_resp = requests.put(upload_url, data=image_bytes, headers=upload_headers)
            upload_resp.raise_for_status()
            print("✅ Image uploaded to LinkedIn successfully")

        except Exception as e:
            print(f"❌ LinkedIn image upload failed: {e}")
            asset_urn = None

    # 3. Compose payload
    if asset_urn:
        share_media_category = "IMAGE"
        media = [{
            "status": "READY",
            "media": asset_urn
        }]
    else:
        share_media_category = "NONE"
        media = []

    # PATCH: If message is a generic image label, but image and text are both present, use the actual text content.
    # This function is called with message = content_data['content'] from main.py.
    # If the message looks like "Generated image for ..." and image_data is present, try to use content_data['text_content'] if available.
    # But since only 'content' is passed, the fix must be in main.py to always pass the real text.

    payload = {
        "author": f"urn:li:person:{person_id}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": message
                },
                "shareMediaCategory": share_media_category
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    if asset_urn:
        payload["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = media

    # Add debug print to show exactly what is posted
    print("🔎 LinkedIn POST PAYLOAD:")
    print(payload)

    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"📥 LinkedIn Response Status: {response.status_code}")
        print(f"📥 LinkedIn Response: {response.text}")

        if response.status_code != 201:
            error_data = response.json() if response.content else {}
            error_message = error_data.get('message', 'Unknown error')
            print(f"[ERROR] LinkedIn post failed: {response.text}")
            raise Exception(f"Failed to post to LinkedIn: {error_message}")

        result = response.json()
        post_id = result.get('id', 'Unknown')
        print(f"[SUCCESS] LinkedIn post published with ID: {post_id}")
        return {"post_id": post_id}

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] LinkedIn network error: {str(e)}")
        raise Exception(f"LinkedIn network error: {str(e)}")
    except Exception as e:
        print(f"[ERROR] LinkedIn posting error: {str(e)}")
        raise

# Facebook Routes
@router.post("/post-now")
def post_to_facebook_now(data: FacebookPostNow):
    """Post content to Facebook immediately"""
    try:
        if data.image_data:
            result = post_image_to_facebook(data.content, data.image_data)
        else:
            result = post_to_facebook(data.content)
        
        return {"success": True, "message": "Posted to Facebook successfully", **result}
        
    except Exception as e:
        print(f"❌ Error posting to Facebook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error posting to Facebook: {str(e)}")

@router.post("/schedule-post")
def schedule_facebook_post(data: FacebookSchedulePost):
    """Schedule a Facebook post for later"""
    try:
        scheduled_datetime = datetime.fromtimestamp(data.scheduled_time)
        
        if data.image_data:
            scheduler.add_job(
                post_image_to_facebook,
                "date",
                run_date=scheduled_datetime,
                args=[data.content, data.image_data],
                id=f"fb_image_post_{data.scheduled_time}",
                replace_existing=True
            )
        else:
            scheduler.add_job(
                post_to_facebook,
                "date",
                run_date=scheduled_datetime,
                args=[data.content],
                id=f"fb_text_post_{data.scheduled_time}",
                replace_existing=True
            )
        
        return {
            "success": True,
            "message": "Post scheduled successfully",
            "scheduled_time": scheduled_datetime.isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error scheduling Facebook post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error scheduling post: {str(e)}")

# LinkedIn Routes
@router.get("/linkedin/auth")
def linkedin_auth():
    client_id = LINKEDIN_CLIENT_ID
    redirect_uri = urllib.parse.quote(REDIRECT_URI, safe='')
    scope = urllib.parse.quote("w_member_social profile email", safe='')
    state = "random_state_string"
    url = (
        f"https://www.linkedin.com/oauth/v2/authorization?response_type=code"
        f"&client_id={client_id}&redirect_uri={redirect_uri}"
        f"&scope={scope}&state={state}"
    )
    return RedirectResponse(url)

@router.post("/linkedin/post-now")
def post_to_linkedin_now(data: LinkedInPost):
    try:
        # Print received data for debugging
        print("🔎 /linkedin/post-now received:", data)
        result = post_to_linkedin(data.content, image_data=data.image_data)
        return {"success": True, "message": "Posted to LinkedIn successfully", **result}
    except Exception as e:
        print(f"❌ Error posting to LinkedIn: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error posting to LinkedIn: {str(e)}")

@router.post("/linkedin/schedule-post")
def schedule_linkedin_post(data: LinkedInSchedulePost):
    try:
        scheduled_datetime = datetime.fromtimestamp(data.scheduled_time)
        
        print(f"🕐 Scheduling LinkedIn post:")
        print(f"   📅 Unix timestamp: {data.scheduled_time}")
        print(f"   📅 Converted to: {scheduled_datetime}")
        print(f"   📅 Current time: {datetime.now()}")
        print(f"   📝 Content: {data.content[:50]}...")
        
        # Check if the time is in the past
        if scheduled_datetime <= datetime.now():
            print(f"   ⚠️ WARNING: Scheduled time is in the past!")
            return {
                "success": False,
                "error": f"Scheduled time {scheduled_datetime} is in the past. Current time: {datetime.now()}"
            }
        
        scheduler.add_job(
            post_to_linkedin,
            "date",
            run_date=scheduled_datetime,
            args=[data.content, LINKEDIN_ACCESS_TOKEN],
            id=f"linkedin_post_{data.scheduled_time}",
            replace_existing=True
        )
        
        # Verify the job was added
        job = scheduler.get_job(f"linkedin_post_{data.scheduled_time}")
        if job:
            print(f"   ✅ Job scheduled successfully!")
            print(f"   📋 Job ID: {job.id}")
            print(f"   ⏰ Next run: {job.next_run_time}")
        else:
            print(f"   ❌ Job was not created!")
        
        return {
            "success": True,
            "message": "Post scheduled successfully",
            "scheduled_time": scheduled_datetime.isoformat(),
            "job_id": f"linkedin_post_{data.scheduled_time}",
            "current_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error scheduling LinkedIn post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error scheduling LinkedIn post: {str(e)}")

@router.get("/linkedin/callback")
async def linkedin_callback(request: Request):
    code = request.query_params.get("code")
    error = request.query_params.get("error")

    if error:
        return {"error": f"Authorization failed: {error}"}

    if not code:
        return {"error": "No authorization code provided"}

    token_url = "https://www.linkedin.com/oauth/v2/accessToken"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": LINKEDIN_CLIENT_ID,
        "client_secret": LINKEDIN_CLIENT_SECRET,
    }

    resp = requests.post(token_url, data=data)

    if resp.status_code != 200:
        return {
            "error": "Failed to get access token",
            "details": resp.text,
            "status_code": resp.status_code,
        }

    token_data = resp.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return {"error": "No access token returned"}

    # 🟢 Return token info directly without posting yet
    return {
        "access_token": access_token,
        "expires_in": token_data.get("expires_in"),
        "token_type": token_data.get("token_type") or "Bearer"
    }

# Common Routes
@router.get("/scheduled-posts")
def get_scheduled_posts():
    """Get list of scheduled posts"""
    try:
        scheduled_jobs = []
        for job in scheduler.get_jobs():
            if job.id.startswith(('fb_', 'linkedin_', 'daily_', 'weekly_', 'custom_')):
                scheduled_jobs.append({
                    "id": job.id,
                    "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                    "func_name": job.func.__name__,
                    "trigger": str(job.trigger)
                })
        
        return {"scheduled_posts": scheduled_jobs}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting scheduled posts: {str(e)}")

@router.delete("/cancel-post/{job_id}")
def cancel_scheduled_post(job_id: str):
    """Cancel a scheduled post"""
    try:
        scheduler.remove_job(job_id)
        return {"success": True, "message": f"Post {job_id} cancelled"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cancelling post: {str(e)}")

# Add endpoint to test LinkedIn posting
@router.get("/linkedin/test")
def test_linkedin_posting():
    """Test LinkedIn posting functionality"""
    try:
        if not LINKEDIN_ACCESS_TOKEN:
            return {"error": "LINKEDIN_ACCESS_TOKEN not configured"}
        
        person_id = get_person_id(LINKEDIN_ACCESS_TOKEN)
        if not person_id:
            return {"error": "Could not get person ID"}
        
        return {
            "success": True,
            "person_id": person_id,
            "token_configured": True,
            "message": "LinkedIn configuration is valid"
        }
        
    except Exception as e:
        return {"error": f"LinkedIn test failed: {str(e)}"}

# Add endpoint to get current server time and help with timestamp calculation
@router.get("/current-time")
def get_current_time():
    """Get current server time to help with scheduling"""
    now = datetime.now()
    return {
        "current_time": now.isoformat(),
        "unix_timestamp": int(now.timestamp()),
        "timezone": "Server local time",
        "today_date": now.strftime("%A, %B %d, %Y"),
        "help": {
            "for_11_45_today": int(now.replace(hour=11, minute=45, second=0, microsecond=0).timestamp()),
            "for_12_00_today": int(now.replace(hour=12, minute=0, second=0, microsecond=0).timestamp()),
            "for_in_2_minutes": int((now + timedelta(minutes=2)).timestamp()),
            "for_in_5_minutes": int((now + timedelta(minutes=5)).timestamp())
        }
    }

# Add endpoint to schedule a test post for immediate testing
@router.post("/linkedin/schedule-test")
def schedule_test_linkedin_post():
    """Schedule a test LinkedIn post for 1 minute from now"""
    try:
        # Schedule for 1 minute from now
        now = datetime.now()
        scheduled_time = now + timedelta(minutes=1)
        unix_time = int(scheduled_time.timestamp())
        
        test_content = f"🧪 Test scheduled post from EcoLens at {scheduled_time.strftime('%H:%M:%S')}! Auto-posting is working perfectly. #EcoLensTest #Automation"
        
        print(f"🧪 Scheduling test post:")
        print(f"   📅 Current time: {now}")
        print(f"   📅 Scheduled for: {scheduled_time}")
        print(f"   📅 Unix timestamp: {unix_time}")
        
        scheduler.add_job(
            post_to_linkedin,
            "date",
            run_date=scheduled_time,
            args=[test_content, LINKEDIN_ACCESS_TOKEN],
            id=f"linkedin_test_{unix_time}",
            replace_existing=True
        )
        
        return {
            "success": True,
            "message": "Test post scheduled for 1 minute from now",
            "scheduled_time": scheduled_time.isoformat(),
            "unix_timestamp": unix_time,
            "content": test_content
        }
        
    except Exception as e:
        print(f"❌ Error scheduling test post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
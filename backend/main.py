from fastapi import FastAPI, HTTPException, File, UploadFile, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import uvicorn
import os
import traceback
import shutil
from datetime import datetime
from dotenv import load_dotenv

# Import your services
from services.memory_service import MemoryService
from services.calendar_service import CalendarService
from services.audio_service import AudioService
from services.google_calendar_service import GoogleCalendarService

# 1. Load environment variables from the root PA folder
load_dotenv(dotenv_path="../.env") 

app = FastAPI(title="AETHER Executive Assistant API")

# 2. CORS Configuration for React (Port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
memory_service = MemoryService()
calendar_service = CalendarService()
audio_service = AudioService()
google_calendar_service = GoogleCalendarService()

from database import engine, SessionLocal, Base
from sqlalchemy.orm import Session
import models
from services.auth_service import AuthService

# Create tables
models.Base.metadata.create_all(bind=engine)

auth_service = AuthService()

# Dependency for DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth_service.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/api/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth_service.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth_service.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

class CalendarEvent(BaseModel):
    title: str
    date: str
    time: str
    description: str

@app.post("/api/sync-calendar")
async def sync_calendar(event: CalendarEvent):
    """
    Inserts an event into the user's Google Calendar.
    """
    try:
        result = google_calendar_service.create_event(event.dict())
        if result["status"] == "success":
            return result
        else:
            return JSONResponse(status_code=400, content=result)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

class TranscriptRequest(BaseModel):
    text: str
    meeting_id: str
    ghost_mode: bool = False

@app.get("/")
async def root():
    return {"message": "AETHER Backend is Active on Port 8005"}

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...), user_id: str = "guest"):
    """
    Handles raw audio blobs from the React frontend, 
    saves them temporarily, and sends them to Groq Whisper.
    """
    # Use a unique name to avoid permission errors if a previous process crashed
    temp_file_path = f"active_session_{file.filename}" if file.filename else "active_session.wav"
    
    try:
        # Save the incoming audio stream to disk
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Send the local file path to the Groq Audio Service
        transcript = audio_service.transcribe_audio(temp_file_path)
        
        if transcript:
            return {"transcript": transcript}
        else:
            # This happens if Groq is reached but the audio was silent/corrupt
            return {"transcript": "[Unintelligible Audio or Silence]"}
            
    except Exception as e:
        print("--- BACKEND CRASH LOG ---")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
    
    finally:
        # Crucial: Close and delete the file so Port 8005 doesn't lock up
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass

@app.post("/process-transcript")
async def process_transcript(request: TranscriptRequest, user_id: str = "guest"):
    """
    Takes the text transcript and extracts Action Items using Llama 3.
    """
    try:
        # 1. Memory Sync (ChromaDB)
        if not request.ghost_mode:
            memory_service.add_memory(request.text, request.meeting_id, user_id)
        
        # 2. Intelligence Layer (Groq Llama 3)
        # We pass the current date to fix the "null" time issue
        current_date = datetime.now().strftime("%A, %B %d, %Y")
        calendar_events = calendar_service.extract_calendar_intent(request.text, current_date)
        
        return {
            "status": "success",
            "transcript": request.text,
            "calendar_events": calendar_events
        }
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": "AI Processing failed"})

@app.get("/api/analytics")
async def get_analytics(user_id: str = "guest"):
    """
    Returns the top 5 recurring themes from all stored meeting memories.
    """
    try:
        analytics = memory_service.get_analytics(user_id)
        total_meetings = len(memory_service.get_all_memories(user_id))
        analytics["totalMeetings"] = total_meetings
        return analytics
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": "Analytics failed"})

@app.get("/flashbacks")
async def get_flashbacks(query: str, user_id: str = "guest"):
    """
    Retrieves meeting memories. If query is 'all', returns every stored memory.
    Otherwise, performs a semantic search.
    """
    try:
        if query == "all":
            results = memory_service.get_all_memories(user_id)
        else:
            # Semantic search returns a list of texts, convert to match the "all" format
            search_results = memory_service.search_memories(query, user_id)
            results = [{"text": text, "metadata": {}} for text in search_results]
            
        return {"flashbacks": results}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": "Failed to fetch flashbacks"})

# ... (Keep all your imports and app.post routes exactly as they are)

if __name__ == "__main__":
    # This block prevents the 'multiprocessing' loop on Windows
    import uvicorn
    print("🚀 AETHER Engine Starting on Port 8005...")
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)
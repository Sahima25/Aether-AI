from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

class AudioService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY missing. Check your .env file.")
        self.client = Groq(api_key=self.api_key)

    def transcribe_audio(self, audio_file_path: str):
        """
        Transcribes audio using Groq's whisper-large-v3-turbo model.
        """
        if not os.path.exists(audio_file_path):
            print(f"ERROR: Audio file path {audio_file_path} is invalid.")
            return None

        try:
            # We open the file and pass the handle directly to the Groq SDK
            with open(audio_file_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    file=(os.path.basename(audio_file_path), audio_file),
                    model="whisper-large-v3-turbo",
                    response_format="text",
                )
            
            # transcription will be a string since response_format="text"
            return transcription if transcription else ""
            
        except Exception as e:
            print(f"GROQ API TRANSCRIPTION ERROR: {e}")
            return None
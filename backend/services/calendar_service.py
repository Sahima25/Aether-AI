from groq import Groq
import os
import json
import re
from typing import Optional

class CalendarService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key)

    def extract_calendar_intent(self, transcript: str, current_date: Optional[str] = None):
        # Use the provided date or fallback to the specific one requested
        date_context = current_date if current_date else "Friday, February 27, 2026"
        
        prompt = f"""
        Extract any meeting or event scheduling intents from the following transcript.
        
        Transcript: "{transcript}"
        
        Rules:
        1. Return a JSON list of objects.
        2. Each object MUST have these keys: "title", "date", "time", "description".
        3. Format 'date' as YYYY-MM-DD.
        4. Format 'time' as HH:MM (24-hour).
        5. If no event is found, return an empty array [].
        
        Return ONLY valid JSON.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system", 
                        "content": f"Today is {date_context}. You are an elite Executive Assistant. When a user mentions 'tomorrow', 'next Monday', or 'at 5', calculate the exact ISO date and time."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            print(f"DEBUG: Groq Response: {content}")
            
            data = json.loads(content)
            
            # Normalize response - user expects a list of events
            events = []
            if isinstance(data, list):
                events = data
            elif isinstance(data, dict):
                # If the AI wrapped it in a key, extract it
                for key in ["events", "calendar_events", "meetings"]:
                    if key in data and isinstance(data[key], list):
                        events = data[key]
                        break
                if not events and any(k in data for k in ["title", "date"]):
                    # It's a single object, wrap it
                    events = [data]
            
            return events
        except Exception as e:
            print(f"Error extracting intent: {e}")
            return []

    def _mock_create_calendar_event(self, event_data: dict):
        print(f"[MOCK] Creating Google Calendar Event: {event_data}")
        # In a real implementation, this would use google-api-python-client
        return True

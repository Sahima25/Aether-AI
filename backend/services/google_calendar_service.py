import os
import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

class GoogleCalendarService:
    def __init__(self):
        self.creds = None
        # The file token.json stores the user's access and refresh tokens
        if os.path.exists('token.json'):
            self.creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
        # If there are no (valid) credentials available, let the user log in.
        # NOTE: In a headless environment, this would fail. 
        # For this demo, we check if credentials.json exists.
        if not self.creds or not getattr(self.creds, 'valid', False):
            if self.creds and getattr(self.creds, 'expired', False) and getattr(self.creds, 'refresh_token', None):
                self.creds.refresh(Request())
            elif os.path.exists('credentials.json'):
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                self.creds = flow.run_local_server(port=0)
                # Save the credentials for the next run
                with open('token.json', 'w') as token:
                    token.write(self.creds.to_json())

    def create_event(self, event_data: dict):
        """
        Takes event_data in the format:
        {"title": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "description": "..."}
        """
        if not self.creds:
            print("[ERROR] Google Calendar credentials not found. Ensure 'credentials.json' is present.")
            return {"status": "error", "message": "Authentication required"}

        try:
            service = build('calendar', 'v3', credentials=self.creds)

            # Combine date and time for ISO format
            start_datetime = f"{event_data['date']}T{event_data['time']}:00Z"
            # Default durartion 1 hour
            end_time = (datetime.datetime.strptime(event_data['time'], "%H:%M") + datetime.timedelta(hours=1)).strftime("%H:%M")
            end_datetime = f"{event_data['date']}T{end_time}:00Z"

            event = {
                'summary': event_data.get('title', 'AETHER Meeting'),
                'description': event_data.get('description', ''),
                'start': {
                    'dateTime': start_datetime,
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_datetime,
                    'timeZone': 'UTC',
                },
            }

            event = service.events().insert(calendarId='primary', body=event).execute()
            print(f"Event created: {event.get('htmlLink')}")
            return {"status": "success", "link": event.get('htmlLink')}

        except Exception as e:
            print(f"An error occurred: {e}")
            return {"status": "error", "message": str(e)}

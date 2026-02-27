import requests
import json
import time

def test_integration():
    url = "http://localhost:8000/process-transcript"
    transcript = "Hey team, great meeting today. Let's sync again next Tuesday, March 4th at 2 PM to finalize the code. Also, remind me to check the microphone settings."
    
    payload = {
        "text": transcript,
        "meeting_id": "test_meeting_001",
        "ghost_mode": False
    }
    
    print("--- Sending Transcript to Backend ---")
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print(f"Status Code: {response.status_code}")
        print("Response Data:")
        print(json.dumps(data, indent=2))
        
        # Verify bits of the response
        events = data.get("calendar_events", [])
        if events:
            print("\n[SUCCESS] Events extracted by Grok:")
            for event in events:
                print(f"- {event.get('summary')} on {event.get('date')} at {event.get('time')}")
        else:
            print("\n[WARNING] No events extracted. Check GROK_API_KEY and service logic.")
            
    except Exception as e:
        print(f"[ERROR] Failed to connect to backend: {e}")
        return

    print("\n--- Verifying Memory in ChromaDB ---")
    flashback_url = "http://localhost:8000/flashbacks"
    params = {"query": "NumPy"}
    
    try:
        # Small delay to ensure ChromaDB write is flushed (though PersistentClient is usually immediate)
        time.sleep(1)
        fb_response = requests.get(flashback_url, params=params)
        fb_data = fb_response.json()
        flashbacks = fb_data.get("flashbacks", [])
        
        if flashbacks and len(flashbacks[0]) > 0:
            print(f"[SUCCESS] Memory recalled for 'NumPy':")
            print(f"Content: {flashbacks[0][0][:100]}...")
        else:
            print("[WARNING] No memory found for 'NumPy'.")
            
    except Exception as e:
        print(f"[ERROR] Failed to query flashbacks: {e}")

if __name__ == "__main__":
    test_integration()

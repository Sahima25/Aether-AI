from groq import Groq
import os
import chromadb

class MemoryService:
    def __init__(self):
        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.chroma_client.get_or_create_collection(name="meeting_memories")
        
        # Initialize Groq client
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key)
        
    def add_memory(self, text: str, meeting_id: str, username: str):
        import datetime
        timestamp = datetime.datetime.now().isoformat()
        self.collection.add(
            documents=[text],
            metadatas=[{"meeting_id": meeting_id, "timestamp": timestamp, "username": username}],
            ids=[f"msg_{os.urandom(4).hex()}"]
        )
        
    def search_memories(self, query: str, username: str, n_results: int = 3):
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where={"username": username}
        )
        return results["documents"]

    def get_all_memories(self, username: str):
        """Retrieves all stored documents and their metadata from the collection for a specific user."""
        results = self.collection.get(where={"username": username})
        memories = []
        if results["documents"]:
            for i in range(len(results["documents"])):
                memories.append({
                    "text": results["documents"][i],
                    "metadata": results["metadatas"][i] if results["metadatas"] else {}
                })
        return memories

    def get_analytics(self, username: str):
        """
        Fetches all memories and uses Llama 3 to extract the top 5 recurring themes.
        Returns a JSON-compatible list of themes with counts.
        """
        memories = self.get_all_memories(username)
        if not memories:
            return {"themes": []}

        # Extract just the text for analysis
        memory_texts = [m["text"] for m in memories]
        context = "\n---\n".join(memory_texts[:20]) # Limit to last 20 meetings for stability
        
        prompt = f"""
        Analyze the following meeting notes and identify the top 5 recurring themes.
        For each theme, provide a concise name and an estimated frequency/importance score (1-10).
        
        Return ONLY a JSON object with this exact structure:
        {{
            "themes": [
                {{"name": "Theme Name", "value": 8}},
                ...
            ]
        }}
        
        Meeting Notes:
        {context}
        """

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a data analyst assistant. Return ONLY JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            import json
            import re
            
            content = response.choices[0].message.content
            # Cleanup common LLM markdown artifacts if any
            content = re.sub(r'```json\s*|\s*```', '', content)
            
            return json.loads(content)
        except Exception as e:
            print(f"Analytics Error: {e}")
            return {"themes": [{"name": "Error processing themes", "value": 0}]}

    def get_summary(self, text: str):
        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a highly efficient meeting summarizer."},
                {"role": "user", "content": f"Summarize this meeting transcript: {text}"}
            ]
        )
        return response.choices[0].message.content

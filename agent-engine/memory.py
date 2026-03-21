import os
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
from typing import List, Dict, Any, Optional
import time

class AgentMemory:
    def __init__(self):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.index_name = os.getenv("PINECONE_INDEX", "agentforge")
        self.provider = os.getenv("VECTOR_STORE_PROVIDER", "pinecone")
        
        if not self.api_key:
            self.enabled = False
            return
            
        try:
            # Initialize Pinecone
            self.pc = Pinecone(api_key=self.api_key)
            
            # Create index if it doesn't exist
            if self.index_name not in [index.name for index in self.pc.list_indexes()]:
                self.pc.create_index(
                    name=self.index_name,
                    dimension=1536, # OpenAI embedding dimension
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',
                        region='us-east-1'
                    )
                )
                # Wait for index to be ready
                while not self.pc.describe_index(self.index_name).status['ready']:
                    time.sleep(1)
            
            self.index = self.pc.Index(self.index_name)
            
            # Initialize Embedding Client (pointing to OpenRouter/OpenAI)
            self.embed_client = OpenAI(
                base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
                api_key=os.getenv("OPENROUTER_API_KEY")
            )
            self.enabled = True
        except Exception as e:
            print(f"Failed to initialize AgentMemory: {e}")
            self.enabled = False

    def get_embedding(self, text: str) -> List[float]:
        """Generate 1536-dimensional embedding using OpenRouter/OpenAI"""
        if not self.enabled:
            return []
            
        try:
            # Note: We use the standard text-embedding-3-small model
            response = self.embed_client.embeddings.create(
                input=[text.replace("\n", " ")],
                model="openai/text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding generation failed: {e}")
            return []

    def store_project_context(self, project_id: str, requirement: str, architecture: str):
        """Store project metadata and architecture in Pinecone for future RAG"""
        if not self.enabled:
            return
            
        try:
            # Combine requirement and architecture for a rich context
            context_text = f"Requirement: {requirement}\n\nArchitecture: {architecture}"
            vector = self.get_embedding(context_text)
            
            if not vector:
                return
                
            self.index.upsert(
                vectors=[
                    {
                        "id": project_id,
                        "values": vector,
                        "metadata": {
                            "project_id": project_id,
                            "requirement": requirement[:1000], # Metadata limit
                            "type": "project_record"
                        }
                    }
                ]
            )
        except Exception as e:
            print(f"Failed to store project context in Pinecone: {e}")
            # Log to Convex if possible
            try:
                from convex_client import add_log
                add_log(project_id, "system", f"Memory insertion failed: {str(e)}")
            except:
                pass

    def retrieve_relevant_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieve the most relevant previous projects or snippets"""
        if not self.enabled:
            return []
            
        try:
            vector = self.get_embedding(query)
            if not vector:
                return []
                
            results = self.index.query(
                vector=vector,
                top_k=top_k,
                include_metadata=True
            )
            
            return [match.metadata for match in results.matches]
        except Exception as e:
            print(f"Memory retrieval failed: {e}")
            return []

# Global instance
agent_memory = AgentMemory()

"""
Knowledge Base Service for Conversation History RAG
Stores conversation history with embeddings for semantic search
"""

import json
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from loguru import logger
import numpy as np
from pathlib import Path
import sqlite3
import openai
from sentence_transformers import SentenceTransformer
import faiss

from backend.core.config import settings
from backend.core.exceptions import LLMServiceError


class ConversationKnowledgeBase:
    """
    RAG-based knowledge base for conversation history
    Uses embeddings and FAISS for semantic search
    """
    
    def __init__(self):
        self.db_path = Path("conversation_kb.db")
        self.embeddings_model = None
        self.faiss_index = None
        self.conversation_texts = []
        self.conversation_metadata = []
        self.embedding_dim = 384  # all-MiniLM-L6-v2 dimension
        self._initialized = False
    
    async def _ensure_initialized(self):
        """Ensure the knowledge base is initialized"""
        if not self._initialized:
            await self._initialize()
    
    async def _initialize(self):
        """Initialize the knowledge base"""
        try:
            # Load embedding model
            self.embeddings_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize database
            await self._init_database()
            
            # Load existing conversations into FAISS
            await self._load_conversations_to_faiss()
            
            self._initialized = True
            logger.info("Knowledge base initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize knowledge base: {e}")
    
    async def _init_database(self):
        """Initialize SQLite database for conversation storage"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                message_role TEXT NOT NULL,
                message_content TEXT NOT NULL,
                timestamp DATETIME NOT NULL,
                embedding BLOB,
                topics TEXT,
                importance_score REAL DEFAULT 1.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_id ON conversations(user_id);
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_session_id ON conversations(session_id);
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_timestamp ON conversations(timestamp);
        """)
        
        conn.commit()
        conn.close()
    
    async def _load_conversations_to_faiss(self):
        """Load existing conversations into FAISS index"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, message_content, user_id, session_id, timestamp, topics, importance_score
            FROM conversations 
            WHERE message_role != 'system'
            ORDER BY timestamp ASC
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            # Initialize empty FAISS index
            self.faiss_index = faiss.IndexFlatIP(self.embedding_dim)
            return
        
        # Extract texts and metadata
        texts = []
        metadata = []
        
        for row in rows:
            conv_id, content, user_id, session_id, timestamp, topics, importance = row
            texts.append(content)
            metadata.append({
                'id': conv_id,
                'user_id': user_id,
                'session_id': session_id,
                'timestamp': timestamp,
                'topics': topics,
                'importance_score': importance
            })
        
        # Generate embeddings for existing conversations
        if texts:
            embeddings = self.embeddings_model.encode(texts, convert_to_tensor=False)
            embeddings = np.array(embeddings).astype('float32')
            
            # Normalize for cosine similarity
            faiss.normalize_L2(embeddings)
            
            # Create FAISS index
            self.faiss_index = faiss.IndexFlatIP(self.embedding_dim)
            self.faiss_index.add(embeddings)
            
            self.conversation_texts = texts
            self.conversation_metadata = metadata
            
            logger.info(f"Loaded {len(texts)} conversations into FAISS index")
    
    async def store_conversation_message(
        self,
        user_id: str,
        session_id: str,
        role: str,
        content: str,
        timestamp: datetime = None,
        topics: List[str] = None,
        importance_score: float = 1.0
    ):
        """Store a conversation message in the knowledge base"""
        
        await self._ensure_initialized()
        
        if timestamp is None:
            timestamp = datetime.now()
        
        # Skip system messages
        if role == 'system':
            return
        
        try:
            # Generate embedding
            embedding = self.embeddings_model.encode([content], convert_to_tensor=False)[0]
            embedding = embedding.astype('float32')
            
            # Normalize for cosine similarity
            embedding_normalized = embedding.copy()
            faiss.normalize_L2(embedding_normalized.reshape(1, -1))
            
            # Extract topics automatically if not provided
            if topics is None:
                topics = await self._extract_topics(content)
            
            # Store in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO conversations 
                (user_id, session_id, message_role, message_content, timestamp, embedding, topics, importance_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, session_id, role, content, timestamp.isoformat(),
                embedding.tobytes(), json.dumps(topics), importance_score
            ))
            
            conversation_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            # Add to FAISS index
            if self.faiss_index is None:
                self.faiss_index = faiss.IndexFlatIP(self.embedding_dim)
            
            self.faiss_index.add(embedding_normalized.reshape(1, -1))
            
            # Update in-memory storage
            self.conversation_texts.append(content)
            self.conversation_metadata.append({
                'id': conversation_id,
                'user_id': user_id,
                'session_id': session_id,
                'timestamp': timestamp.isoformat(),
                'topics': topics,
                'importance_score': importance_score
            })
            
            logger.debug(f"Stored conversation message for user {user_id}: {content[:50]}...")
            
        except Exception as e:
            logger.error(f"Failed to store conversation message: {e}")
    
    async def _extract_topics(self, content: str) -> List[str]:
        """Extract topics from conversation content"""
        # Simple keyword extraction for fitness-related topics
        fitness_keywords = {
            'тренировка': ['тренировка', 'тренинг', 'занятие'],
            'упражнение': ['упражнение', 'движение'],
            'мышцы': ['мышца', 'мускул', 'грудь', 'спина', 'ноги', 'руки', 'плечи'],
            'питание': ['питание', 'еда', 'диета', 'калории', 'белок'],
            'цель': ['цель', 'задача', 'результат'],
            'вес': ['вес', 'кг', 'килограмм'],
            'повторения': ['повтор', 'раз', 'подход', 'сет'],
            'оборудование': ['штанга', 'гантели', 'тренажер', 'зал'],
            'проблема': ['боль', 'болит', 'травма', 'проблема'],
            'прогресс': ['прогресс', 'результат', 'улучшение']
        }
        
        content_lower = content.lower()
        topics = []
        
        for topic, keywords in fitness_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                topics.append(topic)
        
        return topics if topics else ['общее']
    
    async def search_relevant_context(
        self,
        query: str,
        user_id: str,
        max_results: int = 5,
        time_window_days: int = 30,
        min_similarity: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant conversation context using semantic similarity
        
        Args:
            query: Search query (usually current conversation context)
            user_id: User ID to filter conversations
            max_results: Maximum number of results to return
            time_window_days: Only search within this time window
            min_similarity: Minimum similarity score for results
        
        Returns:
            List of relevant conversation snippets with metadata
        """
        
        await self._ensure_initialized()
        
        if self.faiss_index is None or len(self.conversation_texts) == 0:
            return []
        
        try:
            # Generate query embedding
            query_embedding = self.embeddings_model.encode([query], convert_to_tensor=False)[0]
            query_embedding = query_embedding.astype('float32')
            faiss.normalize_L2(query_embedding.reshape(1, -1))
            
            # Search FAISS index
            similarities, indices = self.faiss_index.search(
                query_embedding.reshape(1, -1), 
                min(max_results * 3, len(self.conversation_texts))  # Get more candidates for filtering
            )
            
            # Filter and rank results
            results = []
            cutoff_date = datetime.now() - timedelta(days=time_window_days)
            
            for similarity, idx in zip(similarities[0], indices[0]):
                if idx >= len(self.conversation_metadata):
                    continue
                
                metadata = self.conversation_metadata[idx]
                
                # Filter by user
                if metadata['user_id'] != user_id:
                    continue
                
                # Filter by time window
                msg_timestamp = datetime.fromisoformat(metadata['timestamp'].replace('Z', '+00:00').replace('+00:00', ''))
                if msg_timestamp < cutoff_date:
                    continue
                
                # Filter by similarity threshold
                if similarity < min_similarity:
                    continue
                
                results.append({
                    'content': self.conversation_texts[idx],
                    'similarity': float(similarity),
                    'timestamp': metadata['timestamp'],
                    'session_id': metadata['session_id'],
                    'topics': metadata['topics'],
                    'importance_score': metadata['importance_score']
                })
            
            # Sort by relevance (similarity * importance * recency)
            for result in results:
                msg_time = datetime.fromisoformat(result['timestamp'].replace('Z', '+00:00').replace('+00:00', ''))
                days_ago = (datetime.now() - msg_time).days
                recency_factor = max(0.1, 1.0 - (days_ago / time_window_days))
                
                result['relevance_score'] = (
                    result['similarity'] * 0.6 +
                    result['importance_score'] * 0.2 +
                    recency_factor * 0.2
                )
            
            results.sort(key=lambda x: x['relevance_score'], reverse=True)
            
            logger.info(f"Found {len(results)} relevant context snippets for query: {query[:50]}...")
            
            return results[:max_results]
            
        except Exception as e:
            logger.error(f"Failed to search relevant context: {e}")
            return []
    
    async def get_conversation_summary(
        self,
        user_id: str,
        session_id: str = None,
        days_back: int = 7
    ) -> Dict[str, Any]:
        """Get a summary of recent conversations for context"""
        
        await self._ensure_initialized()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Build query
        query = """
            SELECT message_role, message_content, timestamp, topics, importance_score
            FROM conversations 
            WHERE user_id = ? AND timestamp > ?
        """
        params = [user_id, (datetime.now() - timedelta(days=days_back)).isoformat()]
        
        if session_id:
            query += " AND session_id = ?"
            params.append(session_id)
        
        query += " ORDER BY timestamp ASC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return {'total_messages': 0, 'topics': [], 'key_points': []}
        
        # Analyze conversation patterns
        topics_count = {}
        key_messages = []
        
        for role, content, timestamp, topics_json, importance in rows:
            if role == 'system':
                continue
            
            # Count topics
            topics = json.loads(topics_json) if topics_json else []
            for topic in topics:
                topics_count[topic] = topics_count.get(topic, 0) + 1
            
            # Collect important messages
            if importance > 1.2:  # Above average importance
                key_messages.append({
                    'content': content,
                    'timestamp': timestamp,
                    'role': role,
                    'importance': importance
                })
        
        # Get top topics
        top_topics = sorted(topics_count.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'total_messages': len(rows),
            'topics': [{'topic': topic, 'count': count} for topic, count in top_topics],
            'key_points': key_messages[-5:],  # Last 5 important messages
            'time_range': f"Last {days_back} days"
        }
    
    async def cleanup_old_conversations(self, days_to_keep: int = 90):
        """Clean up old conversations to manage storage"""
        
        await self._ensure_initialized()
        
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM conversations 
            WHERE timestamp < ? AND importance_score < 1.5
        """, (cutoff_date.isoformat(),))
        
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        
        # Rebuild FAISS index after cleanup
        await self._load_conversations_to_faiss()
        
        logger.info(f"Cleaned up {deleted_count} old conversation messages")


# Global instance (will be lazily initialized)
knowledge_base = ConversationKnowledgeBase() 
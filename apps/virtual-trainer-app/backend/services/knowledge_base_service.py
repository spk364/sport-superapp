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
from backend.core.config import settings
from backend.core.exceptions import LLMServiceError

# Lazy imports to avoid blocking startup
_sentence_transformers = None
_faiss = None
_openai = None

def _get_sentence_transformers():
    global _sentence_transformers
    if _sentence_transformers is None:
        import sentence_transformers
        _sentence_transformers = sentence_transformers
    return _sentence_transformers

def _get_faiss():
    global _faiss
    if _faiss is None:
        import faiss
        _faiss = faiss
    return _faiss

def _get_openai():
    global _openai
    if _openai is None:
        import openai
        _openai = openai
    return _openai


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
        self._initialization_lock = asyncio.Lock()
    
    async def _ensure_initialized(self):
        """Ensure the knowledge base is initialized"""
        if not self._initialized:
            async with self._initialization_lock:
                if not self._initialized:  # Double-check pattern
                    await self._initialize()
    
    async def _initialize(self):
        """Initialize the knowledge base"""
        try:
            logger.info("Initializing knowledge base with ML dependencies...")
            
            # Load embedding model (lazy import)
            SentenceTransformer = _get_sentence_transformers().SentenceTransformer
            self.embeddings_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize database
            await self._init_database()
            
            # Load existing conversations into FAISS
            await self._load_conversations_to_faiss()
            
            self._initialized = True
            logger.info("Knowledge base initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize knowledge base: {e}")
            # Don't raise the exception to prevent blocking the entire service
            # Instead, we'll handle this gracefully in individual method calls
    
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
        faiss = _get_faiss()
        
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
        
        try:
            await self._ensure_initialized()
        except Exception as e:
            logger.warning(f"Knowledge base not available, skipping message storage: {e}")
            return
        
        if not self._initialized:
            logger.warning("Knowledge base not initialized, skipping message storage")
            return
        
        if timestamp is None:
            timestamp = datetime.now()
        
        # Skip system messages
        if role == 'system':
            return
        
        try:
            faiss = _get_faiss()
            
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
            
            logger.debug(f"Stored conversation message for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error storing conversation message: {e}")
    
    async def _extract_topics(self, content: str) -> List[str]:
        """Extract topics from conversation content"""
        topics = []
        
        # Simple keyword-based topic extraction
        fitness_keywords = {
            'workout': ['workout', 'exercise', 'training', 'тренировка', 'упражнение'],
            'nutrition': ['nutrition', 'diet', 'food', 'eating', 'питание', 'диета', 'еда'],
            'muscle_groups': ['chest', 'back', 'legs', 'arms', 'shoulders', 'abs', 'грудь', 'спина', 'ноги', 'руки', 'плечи', 'пресс'],
            'equipment': ['gym', 'weights', 'dumbbells', 'barbell', 'тренажер', 'штанга', 'гантели'],
            'goals': ['weight loss', 'muscle gain', 'strength', 'похудение', 'набор массы', 'сила']
        }
        
        content_lower = content.lower()
        
        for category, keywords in fitness_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                topics.append(category)
        
        return topics if topics else ['general']
    
    async def search_relevant_context(
        self,
        query: str,
        user_id: str,
        max_results: int = 5,
        time_window_days: int = 30,
        min_similarity: float = 0.4
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant conversation context using hybrid approach
        Combines semantic and keyword search for better Russian language support
        """
        
        if not self._initialized:
            logger.warning("Knowledge base not initialized for search")
            return []
        
        try:
            # Get all results from both search methods
            semantic_results = await self._semantic_search(query, user_id, max_results * 2)
            keyword_results = await self._keyword_search(query, user_id, max_results * 2)
            
            # Add direct content search fallback for better reliability
            direct_results = await self._direct_content_search(query, user_id, max_results)
            
            # Combine and deduplicate results
            combined_results = self._combine_and_deduplicate_results(
                semantic_results, keyword_results, direct_results, query
            )
            
            # Filter by time window
            if time_window_days > 0:
                combined_results = self._filter_by_time_window(combined_results, time_window_days)
            
            # Filter by similarity threshold
            filtered_results = [r for r in combined_results if r['similarity'] >= min_similarity]
            
            # Sort by similarity (highest first) and limit results
            final_results = sorted(filtered_results, key=lambda x: x['similarity'], reverse=True)[:max_results]
            
            logger.debug(f"Found {len(final_results)} relevant contexts for query: {query}")
            
            return final_results
            
        except Exception as e:
            logger.error(f"Error in search_relevant_context: {e}")
            return []

    async def _direct_content_search(self, query: str, user_id: str, max_results: int) -> List[Dict[str, Any]]:
        """
        Direct content search fallback for improved reliability
        Searches for exact phrase matches in conversation content
        """
        
        results = []
        query_words = query.lower().split()
        
        # Remove common stop words for better matching
        stop_words = {'и', 'в', 'на', 'с', 'по', 'для', 'к', 'о', 'от', 'за', 'у', 'я', 'ты', 'он', 'она', 'мы', 'они'}
        meaningful_words = [word for word in query_words if word not in stop_words and len(word) > 2]
        
        if not meaningful_words:
            return results
        
        try:
            for i, (text, metadata) in enumerate(zip(self.conversation_texts, self.conversation_metadata)):
                # Check user filter
                if user_id and metadata.get('user_id') != user_id:
                    continue
                
                text_lower = text.lower()
                
                # Calculate direct match score based on word coverage
                matched_words = sum(1 for word in meaningful_words if word in text_lower)
                match_ratio = matched_words / len(meaningful_words) if meaningful_words else 0
                
                # Bonus for phrase matches
                phrase_bonus = 0
                if len(meaningful_words) >= 2:
                    # Check for 2-word and 3-word phrases
                    for j in range(len(meaningful_words) - 1):
                        phrase = ' '.join(meaningful_words[j:j+2])
                        if phrase in text_lower:
                            phrase_bonus += 0.2
                
                # Total similarity score
                similarity = min(match_ratio + phrase_bonus, 1.0)
                
                # Only include if we have meaningful matches
                if similarity >= 0.3:  # Lower threshold for direct search
                    results.append({
                        'content': text,
                        'similarity': similarity,
                        'timestamp': metadata.get('timestamp', ''),
                        'session_id': metadata.get('session_id', ''),
                        'topics': metadata.get('topics', []),
                        'importance_score': metadata.get('importance_score', 1.0),
                        'match_type': 'direct'
                    })
            
            # Sort by similarity and limit results
            results.sort(key=lambda x: x['similarity'], reverse=True)
            return results[:max_results]
            
        except Exception as e:
            logger.error(f"Error in direct content search: {e}")
            return []

    def _combine_and_deduplicate_results(
        self, 
        semantic_results: List[Dict[str, Any]], 
        keyword_results: List[Dict[str, Any]],
        direct_results: List[Dict[str, Any]],
        query: str
    ) -> List[Dict[str, Any]]:
        """Combine results from different search methods and remove duplicates"""
        
        combined = {}
        
        # Add all results to dictionary (content as key to avoid duplicates)
        for result_list, method in [(semantic_results, 'semantic'), (keyword_results, 'keyword'), (direct_results, 'direct')]:
            for result in result_list:
                content = result['content']
                
                if content in combined:
                    # Keep the result with higher similarity
                    if result['similarity'] > combined[content]['similarity']:
                        combined[content] = result
                        combined[content]['match_type'] = method
                else:
                    result['match_type'] = method
                    combined[content] = result
        
        return list(combined.values())
    
    async def _semantic_search(self, query: str, user_id: str, max_results: int) -> List[Dict[str, Any]]:
        """Semantic search for relevant conversation context"""
        
        if not self._initialized or self.faiss_index is None:
            logger.warning("Knowledge base not initialized for semantic search")
            return []
        
        try:
            faiss = _get_faiss()
            
            # Generate query embedding
            query_embedding = self.embeddings_model.encode([query], convert_to_tensor=False)[0]
            query_embedding = query_embedding.astype('float32')
            faiss.normalize_L2(query_embedding.reshape(1, -1))
            
            # Search in FAISS index
            similarities, indices = self.faiss_index.search(query_embedding.reshape(1, -1), max_results)
            
            # Prepare semantic results
            semantic_results = []
            current_time = datetime.now()
            
            for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
                if idx == -1 or similarity < 0.3:
                    continue
                
                if idx >= len(self.conversation_metadata):
                    continue
                
                metadata = self.conversation_metadata[idx]
                
                # Filter by user and time window
                if metadata['user_id'] != user_id:
                    continue
                
                try:
                    msg_time = datetime.fromisoformat(metadata['timestamp'])
                    if msg_time < current_time - timedelta(days=30):
                        continue
                except:
                    continue
                
                semantic_results.append({
                    'content': self.conversation_texts[idx],
                    'similarity': float(similarity),
                    'timestamp': metadata['timestamp'],
                    'session_id': metadata['session_id'],
                    'topics': metadata.get('topics', []),
                    'importance_score': metadata.get('importance_score', 1.0),
                    'match_type': 'semantic'
                })
            
            return semantic_results
            
        except Exception as e:
            logger.error(f"Error in semantic search: {e}")
            return []
    
    async def _keyword_search(self, query: str, user_id: str, max_results: int) -> List[Dict[str, Any]]:
        """Keyword-based search for better Russian language support"""
        
        # Extract keywords from query
        query_words = query.lower().split()
        keyword_results = []
        
        current_time = datetime.now()
        
        # Search through conversation texts
        for i, text in enumerate(self.conversation_texts):
            metadata = self.conversation_metadata[i]
            
            # Filter by user and time
            if metadata['user_id'] != user_id:
                continue
                
            try:
                msg_time = datetime.fromisoformat(metadata['timestamp'])
                if msg_time < current_time - timedelta(days=30):
                    continue
            except:
                continue
            
            text_lower = text.lower()
            
            # Calculate keyword match score
            keyword_score = 0.0
            total_words = len(query_words)
            
            for word in query_words:
                if len(word) >= 3:  # Only consider words with 3+ characters
                    # Exact match
                    if word in text_lower:
                        keyword_score += 1.0
                    # Partial match (Russian word stems)
                    elif len(word) >= 4:
                        word_stem = word[:4]  # Simple stemming
                        if word_stem in text_lower:
                            keyword_score += 0.5
            
            if total_words > 0:
                keyword_score = keyword_score / total_words
            
            # Boost score for important keywords
            boost_keywords = {
                'регулярн': 2.0,
                'вод': 1.5,
                'пить': 1.5,
                'здоровь': 1.3,
                'совет': 1.3,
                'важно': 1.2
            }
            
            for boost_word, boost_factor in boost_keywords.items():
                if boost_word in text_lower:
                    keyword_score *= boost_factor
            
            # Only include if there's a meaningful match
            if keyword_score > 0.3:
                # Convert keyword score to similarity-like score
                similarity_score = min(0.9, keyword_score)  # Cap at 0.9 to distinguish from semantic
                
                keyword_results.append({
                    'content': text,
                    'similarity': similarity_score,
                    'timestamp': metadata['timestamp'],
                    'session_id': metadata['session_id'],
                    'topics': metadata.get('topics', []),
                    'importance_score': metadata.get('importance_score', 1.0),
                    'match_type': 'keyword'
                })
        
        # Sort by score and return top results
        keyword_results.sort(key=lambda x: x['similarity'], reverse=True)
        return keyword_results[:max_results]
    
    def _filter_by_time_window(self, results: List[Dict[str, Any]], time_window_days: int) -> List[Dict[str, Any]]:
        """Filter results by time window"""
        
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(days=time_window_days)
        
        filtered_results = []
        for result in results:
            try:
                msg_time = datetime.fromisoformat(result['timestamp'])
                if msg_time >= cutoff_time:
                    filtered_results.append(result)
            except:
                continue
        
        return filtered_results
    
    async def get_conversation_summary(
        self,
        user_id: str,
        session_id: str = None,
        days_back: int = 7
    ) -> Dict[str, Any]:
        """Get a summary of recent conversations"""
        
        try:
            await self._ensure_initialized()
        except Exception as e:
            logger.warning(f"Knowledge base not available for summary: {e}")
            return {"summary": "Knowledge base not available", "message_count": 0}
        
        if not self._initialized:
            logger.warning("Knowledge base not initialized for summary")
            return {"summary": "Knowledge base not initialized", "message_count": 0}
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get recent conversations
            cutoff_date = datetime.now() - timedelta(days=days_back)
            
            if session_id:
                cursor.execute("""
                    SELECT message_content, timestamp, topics 
                    FROM conversations 
                    WHERE user_id = ? AND session_id = ? AND timestamp >= ?
                    AND message_role != 'system'
                    ORDER BY timestamp DESC
                """, (user_id, session_id, cutoff_date.isoformat()))
            else:
                cursor.execute("""
                    SELECT message_content, timestamp, topics 
                    FROM conversations 
                    WHERE user_id = ? AND timestamp >= ?
                    AND message_role != 'system'
                    ORDER BY timestamp DESC
                """, (user_id, cutoff_date.isoformat()))
            
            rows = cursor.fetchall()
            conn.close()
            
            if not rows:
                return {"summary": "No recent conversations found", "message_count": 0}
            
            # Analyze topics
            all_topics = []
            messages = []
            
            for content, timestamp, topics_json in rows:
                messages.append(content)
                if topics_json:
                    try:
                        topics = json.loads(topics_json)
                        all_topics.extend(topics)
                    except:
                        pass
            
            # Count topic frequency
            topic_counts = {}
            for topic in all_topics:
                topic_counts[topic] = topic_counts.get(topic, 0) + 1
            
            # Generate summary
            summary_parts = []
            summary_parts.append(f"Analyzed {len(messages)} messages from the last {days_back} days.")
            
            if topic_counts:
                top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:3]
                topics_str = ", ".join([f"{topic} ({count})" for topic, count in top_topics])
                summary_parts.append(f"Main topics discussed: {topics_str}.")
            
            return {
                "summary": " ".join(summary_parts),
                "message_count": len(messages),
                "topics": topic_counts,
                "period_days": days_back
            }
            
        except Exception as e:
            logger.error(f"Error generating conversation summary: {e}")
            return {"summary": f"Error generating summary: {e}", "message_count": 0}
    
    async def cleanup_old_conversations(self, days_to_keep: int = 90):
        """Clean up old conversation data"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            
            cursor.execute("""
                DELETE FROM conversations 
                WHERE timestamp < ?
            """, (cutoff_date.isoformat(),))
            
            deleted_count = cursor.rowcount
            conn.commit()
            conn.close()
            
            logger.info(f"Cleaned up {deleted_count} old conversation records")
            
            # Rebuild FAISS index after cleanup
            if self._initialized:
                await self._load_conversations_to_faiss()
            
        except Exception as e:
            logger.error(f"Error cleaning up conversations: {e}")


# Global instance
knowledge_base = ConversationKnowledgeBase() 
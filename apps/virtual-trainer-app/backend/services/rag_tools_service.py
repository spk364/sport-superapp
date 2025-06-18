"""
RAG Tools Service for AI Function Calling
Provides tools for AI to access conversation knowledge base
"""

import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from loguru import logger

from backend.services.knowledge_base_service import knowledge_base
from backend.core.exceptions import LLMServiceError


class RAGToolsService:
    """
    Service providing tools for AI to access conversation knowledge base
    Implements function calling pattern for RAG access
    """
    
    def __init__(self):
        self.available_tools = {
            "search_conversation_history": {
                "type": "function",
                "function": {
                    "name": "search_conversation_history",
                    "description": "Search through conversation history to find relevant context. Use this when you need to recall previous discussions, specific exercises mentioned, goals discussed, or any past context beyond the current conversation window.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query describing what information you need from past conversations (e.g., 'chest exercises we discussed', 'user goals', 'nutrition preferences')"
                            },
                            "max_results": {
                                "type": "integer",
                                "description": "Maximum number of relevant snippets to return (default: 3)",
                                "default": 3
                            },
                            "time_window_days": {
                                "type": "integer", 
                                "description": "Search within this many days back (default: 30)",
                                "default": 30
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            "get_conversation_summary": {
                "type": "function",
                "function": {
                    "name": "get_conversation_summary",
                    "description": "Get a summary of recent conversation topics and key points. Use this to understand overall conversation patterns and frequently discussed topics.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "days_back": {
                                "type": "integer",
                                "description": "Number of days to look back for the summary (default: 7)",
                                "default": 7
                            },
                            "include_topics": {
                                "type": "boolean",
                                "description": "Whether to include topic analysis (default: true)",
                                "default": True
                            }
                        },
                        "required": []
                    }
                }
            },
            "find_related_discussions": {
                "type": "function", 
                "function": {
                    "name": "find_related_discussions",
                    "description": "Find discussions related to a specific topic or exercise. Use this to find all past mentions of specific workouts, body parts, or fitness topics.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "topic": {
                                "type": "string",
                                "description": "Topic to search for (e.g., 'chest workout', 'protein', 'shoulder pain', 'deadlift')"
                            },
                            "include_context": {
                                "type": "boolean",
                                "description": "Whether to include surrounding conversation context (default: true)",
                                "default": True
                            }
                        },
                        "required": ["topic"]
                    }
                }
            }
        }
    
    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """Get tool definitions for OpenAI function calling"""
        return list(self.available_tools.values())
    
    async def execute_tool(
        self,
        tool_name: str,
        tool_arguments: Dict[str, Any],
        user_id: str,
        session_id: str = None
    ) -> Dict[str, Any]:
        """
        Execute a RAG tool and return results
        
        Args:
            tool_name: Name of the tool to execute
            tool_arguments: Arguments for the tool
            user_id: User ID for filtering results
            session_id: Optional session ID for filtering
            
        Returns:
            Tool execution results
        """
        
        try:
            if tool_name == "search_conversation_history":
                return await self._search_conversation_history(
                    user_id=user_id,
                    session_id=session_id,
                    **tool_arguments
                )
            
            elif tool_name == "get_conversation_summary":
                return await self._get_conversation_summary(
                    user_id=user_id,
                    session_id=session_id,
                    **tool_arguments
                )
            
            elif tool_name == "find_related_discussions":
                return await self._find_related_discussions(
                    user_id=user_id,
                    session_id=session_id,
                    **tool_arguments
                )
            
            else:
                raise LLMServiceError(f"Unknown tool: {tool_name}")
                
        except Exception as e:
            logger.error(f"Error executing RAG tool {tool_name}: {e}")
            return {
                "error": f"Failed to execute tool: {str(e)}",
                "tool_name": tool_name
            }
    
    async def _search_conversation_history(
        self,
        user_id: str,
        query: str,
        max_results: int = 3,
        time_window_days: int = 30,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Search conversation history using semantic similarity"""
        
        logger.info(f"Searching conversation history for user {user_id}: {query}")
        
        # Ensure knowledge base is initialized
        await knowledge_base._ensure_initialized()
        
        results = await knowledge_base.search_relevant_context(
            query=query,
            user_id=user_id,
            max_results=max_results,
            time_window_days=time_window_days
        )
        
        if not results:
            return {
                "found": False,
                "message": f"No relevant conversations found for: {query}",
                "results": [],
                "suggestion": "It seems like this information was discussed before our conversation history system was activated. Could you please share this information again so I can help you better?"
            }
        
        # Check if we're finding only questions without answers
        question_indicators = ["?", "какое", "сколько", "что", "где", "когда", "как", "почему"]
        mostly_questions = True
        
        for result in results:
            content_lower = result['content'].lower()
            is_question = any(indicator in content_lower for indicator in question_indicators)
            if not is_question or len(result['content']) > 100:  # Longer responses are likely answers
                mostly_questions = False
                break
        
        # Format results for AI consumption
        formatted_results = []
        for result in results:
            # Parse timestamp
            timestamp_str = result['timestamp'].replace('Z', '').replace('T', ' ')
            try:
                timestamp = datetime.fromisoformat(timestamp_str)
                time_ago = self._format_time_ago(timestamp)
            except:
                time_ago = "Recently"
            
            formatted_results.append({
                "content": result['content'],
                "relevance": f"{result['similarity']:.2f}",
                "time_ago": time_ago,
                "topics": result.get('topics', []),
                "context": f"From conversation {time_ago} (relevance: {result['similarity']:.2f})"
            })
        
        # Enhanced response based on what we found
        if mostly_questions and len(results) > 0:
            return {
                "found": True,
                "query": query,
                "total_results": len(results),
                "results": formatted_results,
                "summary": f"Found {len(results)} relevant conversation snippets about '{query}'",
                "analysis": "The search results mostly contain questions rather than answers, suggesting the original information was discussed before our conversation history system was activated.",
                "recommendation": "Ask the user to provide the information again so you can give a proper response and remember it for future conversations."
            }
        else:
            return {
                "found": True,
                "query": query,
                "total_results": len(results),
                "results": formatted_results,
                "summary": f"Found {len(results)} relevant conversation snippets about '{query}'"
            }
    
    async def _get_conversation_summary(
        self,
        user_id: str,
        days_back: int = 7,
        include_topics: bool = True,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Get conversation summary and analytics"""
        
        logger.info(f"Getting conversation summary for user {user_id} ({days_back} days back)")
        
        # Ensure knowledge base is initialized
        await knowledge_base._ensure_initialized()
        
        summary = await knowledge_base.get_conversation_summary(
            user_id=user_id,
            session_id=session_id,
            days_back=days_back
        )
        
        if summary['total_messages'] == 0:
            return {
                "found": False,
                "message": f"No conversations found in the last {days_back} days",
                "summary": {}
            }
        
        # Format for AI consumption
        formatted_summary = {
            "total_messages": summary['total_messages'],
            "time_range": summary['time_range'],
            "main_topics": [
                f"{topic['topic']} ({topic['count']} mentions)" 
                for topic in summary['topics'][:3]
            ]
        }
        
        if summary['key_points']:
            formatted_summary["key_discussions"] = [
                {
                    "content": point['content'][:200] + "..." if len(point['content']) > 200 else point['content'],
                    "importance": point['importance'],
                    "when": self._format_time_ago(datetime.fromisoformat(point['timestamp']))
                }
                for point in summary['key_points'][-3:]  # Last 3 important points
            ]
        
        return {
            "found": True,
            "summary": formatted_summary,
            "insights": self._generate_conversation_insights(summary)
        }
    
    async def _find_related_discussions(
        self,
        user_id: str,
        topic: str,
        include_context: bool = True,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Find all discussions related to a specific topic"""
        
        logger.info(f"Finding discussions about '{topic}' for user {user_id}")
        
        # Use broader search for topic-specific queries
        results = await knowledge_base.search_relevant_context(
            query=topic,
            user_id=user_id,
            max_results=5,
            time_window_days=60,  # Longer time window for topic search
            min_similarity=0.2    # Lower threshold for topic search
        )
        
        if not results:
            return {
                "found": False,
                "message": f"No discussions found about '{topic}'",
                "topic": topic
            }
        
        # Group by sessions and time periods
        discussions = []
        for result in results:
            timestamp_str = result['timestamp'].replace('Z', '').replace('T', ' ')
            try:
                timestamp = datetime.fromisoformat(timestamp_str)
                time_ago = self._format_time_ago(timestamp)
            except:
                time_ago = "Recently"
            
            discussions.append({
                "content": result['content'],
                "when": time_ago,
                "relevance": f"{result['similarity']:.2f}",
                "session": result.get('session_id', 'Unknown')[-8:],  # Last 8 chars of session ID
                "topics": result.get('topics', [])
            })
        
        return {
            "found": True,
            "topic": topic,
            "total_discussions": len(discussions),
            "discussions": discussions,
            "timeline": self._create_discussion_timeline(discussions)
        }
    
    def _format_time_ago(self, timestamp: datetime) -> str:
        """Format timestamp as human-readable time ago"""
        now = datetime.now()
        delta = now - timestamp
        
        if delta.days > 7:
            return f"{delta.days} days ago"
        elif delta.days > 0:
            return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
        elif delta.seconds > 3600:
            hours = delta.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif delta.seconds > 60:
            minutes = delta.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    
    def _generate_conversation_insights(self, summary: Dict[str, Any]) -> List[str]:
        """Generate insights from conversation summary"""
        insights = []
        
        if summary['total_messages'] > 10:
            insights.append("User is actively engaged in fitness discussions")
        
        top_topics = summary.get('topics', [])
        if top_topics:
            main_topic = top_topics[0]['topic']
            count = top_topics[0]['count']
            insights.append(f"Primary focus area: {main_topic} ({count} discussions)")
        
        if len(top_topics) > 3:
            insights.append("User has diverse fitness interests covering multiple areas")
        
        key_points = summary.get('key_points', [])
        if key_points:
            insights.append(f"Has {len(key_points)} important discussion points to reference")
        
        return insights
    
    def _create_discussion_timeline(self, discussions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create a timeline view of discussions"""
        if not discussions:
            return {}
        
        # Group by time periods
        recent = [d for d in discussions if "hour" in d['when'] or "minute" in d['when'] or "Just now" in d['when']]
        today = [d for d in discussions if "hour" in d['when']]
        this_week = [d for d in discussions if "day" in d['when'] and not "days" in d['when']]
        older = [d for d in discussions if "days" in d['when']]
        
        timeline = {}
        if recent:
            timeline["recent"] = f"{len(recent)} recent mentions"
        if this_week:
            timeline["this_week"] = f"{len(this_week)} mentions this week"
        if older:
            timeline["older"] = f"{len(older)} older mentions"
        
        return timeline


# Global instance
rag_tools = RAGToolsService() 
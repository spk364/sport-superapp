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
        session_id: str = None,
        current_session_context: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Execute a RAG tool with given arguments
        
        Args:
            tool_name: Name of the tool to execute
            tool_arguments: Arguments for the tool
            user_id: User ID for filtering
            session_id: Session ID for context
            current_session_context: Current session messages for immediate context
            
        Returns:
            Tool execution result
        """
        
        try:
            if tool_name == "search_conversation_history":
                return await self._search_conversation_history(
                    user_id=user_id,
                    query=tool_arguments.get("query", ""),
                    max_results=tool_arguments.get("max_results", 3),
                    time_window_days=tool_arguments.get("time_window_days", 30),
                    session_id=session_id,
                    current_session_context=current_session_context
                )
            
            elif tool_name == "get_conversation_summary":
                return await self._get_conversation_summary(
                    user_id=user_id,
                    days_back=tool_arguments.get("days_back", 7),
                    include_topics=tool_arguments.get("include_topics", True),
                    session_id=session_id
                )
            
            elif tool_name == "find_related_discussions":
                return await self._find_related_discussions(
                    user_id=user_id,
                    topic=tool_arguments.get("topic", ""),
                    include_context=tool_arguments.get("include_context", True),
                    session_id=session_id
                )
            
            else:
                return {
                    "error": f"Unknown tool: {tool_name}",
                    "available_tools": list(self.available_tools.keys()),
                    "tool_name": tool_name
                }
                
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}")
            return {
                "error": f"Tool execution failed: {str(e)}",
                "tool_name": tool_name
            }
    
    async def _search_conversation_history(
        self,
        user_id: str,
        query: str,
        max_results: int = 3,
        time_window_days: int = 30,
        session_id: str = None,
        current_session_context: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Search conversation history using semantic similarity"""
        
        logger.info(f"Searching conversation history for user {user_id}: {query}")
        
        # Ensure knowledge base is initialized
        try:
            await knowledge_base._ensure_initialized()
        except Exception as e:
            logger.warning(f"Knowledge base not available for search: {e}")
            return {
                "results": [],
                "message": "Conversation history search is currently unavailable due to system initialization.",
                "query": query,
                "total_found": 0,
                "search_performed": False
            }
        
        # Check if knowledge base is actually initialized
        if not knowledge_base._initialized:
            logger.warning("Knowledge base not initialized for search")
            return {
                "results": [],
                "message": "Conversation history search is currently unavailable. The system is still initializing.",
                "query": query,
                "total_found": 0,
                "search_performed": False
            }
        
        try:
            results = await knowledge_base.search_relevant_context(
                query=query,
                user_id=user_id,
                max_results=max_results,
                time_window_days=time_window_days
            )
            
            # Also search current session context if provided
            current_session_results = []
            if current_session_context:
                query_lower = query.lower()
                for i, message in enumerate(current_session_context):
                    if message.get("role") == "user" or message.get("role") == "assistant":
                        content = message.get("content", "")
                        if content and isinstance(content, str):  # Ensure content exists and is string
                            content_lower = content.lower()
                            
                            # Simple keyword matching for current session
                            # This could be enhanced with semantic similarity later
                            if any(keyword in content_lower for keyword in query_lower.split() if len(keyword) > 3):
                                # Calculate relative time (how many messages ago)
                                messages_ago = len(current_session_context) - i
                                current_session_results.append({
                                    "content": content,
                                    "similarity": 0.8,  # High similarity for current session
                                    "timestamp": "current_session",
                                    "session_id": session_id or "current",
                                    "topics": ["current_session"],
                                    "importance_score": 1.5,  # Higher importance for current session
                                    "messages_ago": messages_ago,
                                    "source": "current_session"
                                })
            
            # Combine results (current session first, then historical)
            all_results = current_session_results + results
            
            # Limit to max_results
            final_results = all_results[:max_results]
            
            # Format response
            if final_results:
                # Create explicit summary for the LLM about what was found
                explicit_summary = self._create_explicit_result_summary(query, final_results)
                
                return {
                    "results": final_results,
                    "query": query,
                    "total_found": len(final_results),
                    "historical_results": len(results),
                    "current_session_results": len(current_session_results),
                    "search_performed": True,
                    "message": f"Found {len(final_results)} relevant conversation snippets.",
                    "explicit_summary": explicit_summary,  # New field for LLM guidance
                    "interpretation_guide": self._create_interpretation_guide(query, final_results)
                }
            else:
                return {
                    "results": [],
                    "query": query,
                    "total_found": 0,
                    "search_performed": True,
                    "message": f"No relevant conversation history found for '{query}' in the last {time_window_days} days.",
                    "explicit_summary": f"SEARCH RESULT: No conversations found matching '{query}'",
                    "interpretation_guide": "Since no results were found, you should tell the user that you don't have information about this topic in your conversation history."
                }
                
        except Exception as e:
            logger.error(f"Error in conversation history search: {e}")
            return {
                "results": [],
                "message": f"Search encountered an error: {str(e)}",
                "query": query,
                "total_found": 0,
                "search_performed": False
            }
    
    async def _get_conversation_summary(
        self,
        user_id: str,
        days_back: int = 7,
        include_topics: bool = True,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Get a summary of recent conversation topics and patterns"""
        
        logger.info(f"Getting conversation summary for user {user_id}, {days_back} days back")
        
        try:
            await knowledge_base._ensure_initialized()
        except Exception as e:
            logger.warning(f"Knowledge base not available for summary: {e}")
            return {
                "summary": "Conversation summary is currently unavailable due to system initialization.",
                "message_count": 0,
                "topics": {},
                "insights": ["System is initializing conversation history features."],
                "available": False
            }
        
        if not knowledge_base._initialized:
            logger.warning("Knowledge base not initialized for summary")
            return {
                "summary": "Conversation summary is currently unavailable. The system is still initializing.",
                "message_count": 0,
                "topics": {},
                "insights": ["System is still setting up conversation history features."],
                "available": False
            }
        
        try:
            summary_data = await knowledge_base.get_conversation_summary(
                user_id=user_id,
                session_id=session_id,
                days_back=days_back
            )
            
            if summary_data.get("message_count", 0) == 0:
                return {
                    "summary": f"No conversations found in the last {days_back} days.",
                    "message_count": 0,
                    "topics": {},
                    "insights": ["This appears to be a new conversation or the user hasn't been active recently."],
                    "available": True,
                    "period_days": days_back
                }
            
            # Generate insights from the summary
            insights = self._generate_conversation_insights(summary_data)
            
            return {
                "summary": summary_data.get("summary", "No summary available"),
                "message_count": summary_data.get("message_count", 0),
                "topics": summary_data.get("topics", {}),
                "insights": insights,
                "available": True,
                "period_days": days_back
            }
            
        except Exception as e:
            logger.error(f"Error getting conversation summary: {e}")
            return {
                "summary": f"Error generating conversation summary: {str(e)}",
                "message_count": 0,
                "topics": {},
                "insights": ["Summary generation encountered an error."],
                "available": False
            }
    
    async def _find_related_discussions(
        self,
        user_id: str,
        topic: str,
        include_context: bool = True,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Find all discussions related to a specific topic"""
        
        logger.info(f"Finding discussions related to '{topic}' for user {user_id}")
        
        try:
            await knowledge_base._ensure_initialized()
        except Exception as e:
            logger.warning(f"Knowledge base not available for topic search: {e}")
            return {
                "topic": topic,
                "discussions": [],
                "total_found": 0,
                "timeline": {},
                "message": "Topic search is currently unavailable due to system initialization.",
                "available": False
            }
        
        if not knowledge_base._initialized:
            logger.warning("Knowledge base not initialized for topic search")
            return {
                "topic": topic,
                "discussions": [],
                "total_found": 0,
                "timeline": {},
                "message": "Topic search is currently unavailable. The system is still initializing.",
                "available": False
            }
        
        try:
            # Search for discussions related to the topic
            results = await knowledge_base.search_relevant_context(
                query=topic,
                user_id=user_id,
                max_results=10,  # Get more results for topic analysis
                time_window_days=90,  # Look back further for topic discussions
                min_similarity=0.2  # Lower threshold for topic matching
            )
            
            if not results:
                return {
                    "topic": topic,
                    "discussions": [],
                    "total_found": 0,
                    "timeline": {},
                    "message": f"No discussions found related to '{topic}'.",
                    "available": True
                }
            
            # Group discussions by time periods
            timeline = self._create_discussion_timeline(results)
            
            # Format discussions
            formatted_discussions = []
            for result in results:
                try:
                    timestamp = datetime.fromisoformat(result['timestamp'])
                    time_ago = self._format_time_ago(timestamp)
                except:
                    time_ago = "Recently"
                
                formatted_discussions.append({
                    "content": result['content'],
                    "timestamp": result['timestamp'],
                    "time_ago": time_ago,
                    "relevance": f"{result['similarity']:.2f}",
                    "topics": result.get('topics', []),
                    "session_id": result.get('session_id', 'unknown'),
                    "importance": result.get('importance_score', 1.0)
                })
            
            return {
                "topic": topic,
                "discussions": formatted_discussions,
                "total_found": len(results),
                "timeline": timeline,
                "message": f"Found {len(results)} discussions related to '{topic}'.",
                "available": True
            }
            
        except Exception as e:
            logger.error(f"Error finding related discussions: {e}")
            return {
                "topic": topic,
                "discussions": [],
                "total_found": 0,
                "timeline": {},
                "message": f"Error searching for discussions: {str(e)}",
                "available": False
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
        
        timeline = {
            "last_24_hours": [],
            "last_week": [],
            "last_month": [],
            "older": []
        }
        
        now = datetime.now()
        
        for discussion in discussions:
            try:
                # Parse timestamp
                timestamp_str = discussion.get("timestamp", "")
                if timestamp_str == "current_session":
                    timeline["last_24_hours"].append(discussion)
                    continue
                    
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                age = now - timestamp
                
                if age.days == 0:
                    timeline["last_24_hours"].append(discussion)
                elif age.days <= 7:
                    timeline["last_week"].append(discussion) 
                elif age.days <= 30:
                    timeline["last_month"].append(discussion)
                else:
                    timeline["older"].append(discussion)
                    
            except Exception:
                # If timestamp parsing fails, put in older
                timeline["older"].append(discussion)
        
        return timeline

    def _create_explicit_result_summary(self, query: str, results: List[Dict[str, Any]]) -> str:
        """Create an explicit summary of search results for LLM interpretation"""
        
        if not results:
            return f"SEARCH RESULT: No conversations found matching '{query}'"
        
        # Analyze what types of content were found
        user_questions = []
        ai_responses = []
        general_content = []
        
        for result in results:
            content = result.get('content', '')
            
            # Check if this looks like a user question
            if content.endswith('?') or any(word in content.lower() for word in ['когда я', 'что ты', 'как я', 'помнишь']):
                user_questions.append(content[:100])
            # Check if this looks like an AI response with detailed advice
            elif any(phrase in content.lower() for phrase in ['рекомендую', 'советую', 'важно', 'стремись', 'помни']):
                ai_responses.append(content[:100])
            else:
                general_content.append(content[:100])
        
        summary_parts = []
        
        if user_questions:
            summary_parts.append(f"FOUND {len(user_questions)} USER QUESTIONS about this topic")
        
        if ai_responses:
            summary_parts.append(f"FOUND {len(ai_responses)} AI RESPONSES with detailed advice")
        
        if general_content:
            summary_parts.append(f"FOUND {len(general_content)} RELATED CONVERSATIONS")
        
        result_summary = " and ".join(summary_parts)
        
        return f"SEARCH RESULT for '{query}': {result_summary}. Total results: {len(results)}"

    def _create_interpretation_guide(self, query: str, results: List[Dict[str, Any]]) -> str:
        """Create specific guidance for how the LLM should interpret these results"""
        
        if not results:
            return "Since no results were found, you should tell the user that you don't have information about this topic in your conversation history."
        
        # Check if query is asking about timing
        if any(word in query.lower() for word in ['когда', 'when', 'время']):
            guide = "The user is asking WHEN something happened. Look through the results for timestamps and provide specific timing information. "
        # Check if query is asking about content
        elif any(word in query.lower() for word in ['что', 'как', 'what', 'how']):
            guide = "The user is asking WHAT was discussed. Look through the results for the actual content and provide specific details from the conversations. "
        else:
            guide = "The user is asking about past conversations. Look through the results and provide specific information from what was found. "

        # Analyze content types in results
        has_detailed_responses = any(
            len(r.get('content', '')) > 100 and 
            any(phrase in r.get('content', '').lower() for phrase in ['рекомендую', 'советую', 'важно', 'стремись'])
            for r in results
        )
        
        if has_detailed_responses:
            guide += "IMPORTANT: The results contain detailed AI responses with advice. Reference this specific content instead of saying you can't find information."
        
        guide += f" You found {len(results)} relevant results - USE THEM to answer the user's question with specific details."
        
        return guide


# Global instance
rag_tools = RAGToolsService() 
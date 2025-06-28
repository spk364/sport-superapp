"""
RAG Enhancement Methods for LLM Service
Separate file for RAG-related functionality
"""

import json
import time
from typing import List, Dict, Any
from loguru import logger

from backend.core.config import settings
from backend.core.exceptions import LLMServiceError
from backend.services.rag_tools_service import rag_tools


class LLMServiceRAGMethods:
    """Additional RAG methods for LLM Service"""
    
    def __init__(self, openai_client):
        self.client = openai_client
    
    async def should_use_rag_tools(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> bool:
        """
        Determine if the AI should use RAG tools based on the user message and context
        """
        
        # Keywords that indicate need for historical context
        context_indicators = [
            # References to past discussions
            "помнишь", "remember", "вспомни", "recall",
            "мы обсуждали", "we discussed", "ты говорил", "you said",
            "раньше", "earlier", "до этого", "before",
            "тот", "те", "те упражнения", "that exercise", "those exercises",
            "наша программа", "our program", "план который", "the plan",
            
            # Requests for progression/changes
            "изменить", "change", "заменить", "replace", "адаптировать", "adapt",
            "прогресс", "progress", "как дела с", "how is", "результаты", "results",
            
            # References to specific past mentions
            "что насчет", "what about", "а как же", "and what about",
            "можно ли", "can I", "стоит ли", "should I",
            
            # Timeline references  
            "на прошлой неделе", "last week", "вчера", "yesterday",
            "недавно", "recently", "в последний раз", "last time"
        ]
        
        message_lower = user_message.lower()
        
        # Check for direct context indicators
        for indicator in context_indicators:
            if indicator in message_lower:
                logger.debug(f"RAG trigger found: '{indicator}' in message")
                return True
        
        # Check if message is vague and might need context
        vague_patterns = [
            "можешь", "хочу", "нужно", "как", "что делать", "совет"
        ]
        
        if len(user_message.split()) < 8:  # Short messages
            for pattern in vague_patterns:
                if pattern in message_lower:
                    # Check if recent chat history is limited
                    if not chat_history or len(chat_history) < 3:
                        logger.debug(f"RAG trigger: vague message with limited context")
                        return True
        
        return False
    
    async def chat_with_rag_tools(
        self,
        messages: List[Dict[str, str]],
        user_id: str,
        session_id: str,
        user_message: str
    ) -> Dict[str, Any]:
        """
        Enhanced chat that uses RAG tools when needed
        """
        
        try:
            # Add RAG tools to the request
            tools = rag_tools.get_tool_definitions()
            
            # Enhanced system message for RAG usage
            rag_system_message = """
            Ты виртуальный тренер с доступом к полной истории разговоров.
            
            У тебя есть инструменты для поиска в истории разговоров:
            - search_conversation_history: ищи конкретную информацию из прошлых бесед
            - get_conversation_summary: получи обзор недавних тем разговоров
            - find_related_discussions: найди все обсуждения по конкретной теме
            
            ИСПОЛЬЗУЙ эти инструменты когда:
            - Пользователь ссылается на прошлые разговоры ("те упражнения", "наша программа")
            - Нужен контекст для персонализированного ответа
            - Пользователь спрашивает о прогрессе или изменениях
            - Вопрос требует знания истории пользователя
            
            Сначала используй нужные инструменты, затем дай полный ответ на основе найденной информации.
            """
            
            # Modify the first system message to include RAG instructions
            if messages and messages[0]["role"] == "system":
                messages[0]["content"] = messages[0]["content"] + "\n\n" + rag_system_message
            
            # Make request with tools
            response = await self.make_openai_request_with_tools(
                messages=messages,
                tools=tools,
                user_id=user_id,
                session_id=session_id
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in RAG-enhanced chat: {e}")
            return None
    
    async def make_openai_request_with_tools(
        self,
        messages: List[Dict[str, str]],
        tools: List[Dict[str, Any]],
        user_id: str,
        session_id: str
    ) -> Dict[str, Any]:
        """
        Make OpenAI request with function calling tools
        """
        
        start_time = time.time()
        total_tokens = 0
        
        try:
            # Initial request with tools
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                timeout=settings.OPENAI_TIMEOUT
            )
            
            total_tokens += response.usage.total_tokens
            
            # Check if AI wants to use tools
            if response.choices[0].message.tool_calls:
                logger.info(f"AI requested {len(response.choices[0].message.tool_calls)} tool calls")
                
                # Add AI message with tool calls to conversation
                messages.append({
                    "role": "assistant",
                    "content": response.choices[0].message.content,
                    "tool_calls": [
                        {
                            "id": tool_call.id,
                            "type": tool_call.type,
                            "function": {
                                "name": tool_call.function.name,
                                "arguments": tool_call.function.arguments
                            }
                        }
                        for tool_call in response.choices[0].message.tool_calls
                    ]
                })
                
                # Execute each tool call
                for tool_call in response.choices[0].message.tool_calls:
                    try:
                        function_name = tool_call.function.name
                        function_args = json.loads(tool_call.function.arguments)
                        
                        logger.info(f"Executing tool: {function_name} with args: {function_args}")
                        
                        # Execute the tool
                        tool_result = await rag_tools.execute_tool(
                            tool_name=function_name,
                            tool_arguments=function_args,
                            user_id=user_id,
                            session_id=session_id
                        )
                        
                        # Add tool result to conversation
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": json.dumps(tool_result, ensure_ascii=False)
                        })
                        
                    except Exception as e:
                        logger.error(f"Error executing tool {tool_call.function.name}: {e}")
                        # Add error message
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": json.dumps({"error": str(e)}, ensure_ascii=False)
                        })
                
                # Get final response after tool execution
                final_response = await self.client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=messages,
                    temperature=settings.OPENAI_TEMPERATURE,
                    max_tokens=settings.OPENAI_MAX_TOKENS,
                    timeout=settings.OPENAI_TIMEOUT
                )
                
                total_tokens += final_response.usage.total_tokens
                
                end_time = time.time()
                latency_ms = int((end_time - start_time) * 1000)
                
                return {
                    "content": final_response.choices[0].message.content,
                    "usage": {"total_tokens": total_tokens},
                    "model": final_response.model,
                    "latency_ms": latency_ms
                }
            
            else:
                # No tools used, return direct response
                end_time = time.time()
                latency_ms = int((end_time - start_time) * 1000)
                
                return {
                    "content": response.choices[0].message.content,
                    "usage": {"total_tokens": total_tokens},
                    "model": response.model,
                    "latency_ms": latency_ms
                }
                
        except Exception as e:
            logger.error(f"Error in OpenAI request with tools: {e}")
            raise LLMServiceError(f"Tool-enhanced chat failed: {str(e)}") 
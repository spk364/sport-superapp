"""
LLM сервис для Virtual Trainer
Интеграция с OpenAI API и обработка всех типов LLM запросов
"""

import json
import time
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import asyncio
from loguru import logger
from openai import AsyncOpenAI

from backend.core.config import settings
from backend.core.exceptions import LLMServiceError, ValidationError
from backend.services.rag_tools_service import rag_tools
from backend.services.knowledge_base_service import knowledge_base
from backend.services.llm_service_rag_methods import LLMServiceRAGMethods
from backend.database.models import LLMRequestType


class LLMService:
    """Сервис для работы с языковыми моделями"""
    
    def __init__(self):
        # Настройка OpenAI клиента
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.temperature = settings.OPENAI_TEMPERATURE
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.timeout = settings.OPENAI_TIMEOUT
        
        # Системные промпты
        self.system_prompts = settings.SYSTEM_PROMPTS
        
        # Семафор для ограничения одновременных запросов
        self.semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_LLM_REQUESTS)
    
    async def _make_openai_request(
        self,
        messages: List[Dict[str, str]],
        request_type: LLMRequestType,
        **kwargs
    ) -> Dict[str, Any]:
        """Базовый метод для запросов к OpenAI"""
        
        async with self.semaphore:
            start_time = time.time()
            
            try:
                # Подготовка параметров
                params = {
                    "model": kwargs.get("model", self.model),
                    "messages": messages,
                    "temperature": kwargs.get("temperature", self.temperature),
                    "max_tokens": kwargs.get("max_tokens", self.max_tokens),
                }
                
                # Выполнение запроса
                response = await self.client.chat.completions.create(**params)
                
                # Обработка ответа
                result = {
                    "content": response.choices[0].message.content,
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens,
                        "completion_tokens": response.usage.completion_tokens,
                        "total_tokens": response.usage.total_tokens,
                    },
                    "model": response.model,
                    "latency_ms": int((time.time() - start_time) * 1000)
                }
                
                logger.info(f"LLM запрос {request_type.value} выполнен успешно")
                return result
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Ошибка LLM: {error_msg}")
                
                # Обработка различных типов ошибок
                if "rate_limit" in error_msg.lower() or "429" in error_msg:
                    raise LLMServiceError("Превышен лимит запросов к ИИ. Попробуйте позже.")
                elif "auth" in error_msg.lower() or "401" in error_msg:
                    raise LLMServiceError("Ошибка доступа к службе ИИ")
                elif "api" in error_msg.lower() or "500" in error_msg:
                    raise LLMServiceError("Временная ошибка службы ИИ")
                else:
                    raise LLMServiceError(f"Неожиданная ошибка службы ИИ: {error_msg}")
    
    async def chat_with_virtual_trainer(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]] = None,
        user_context: Optional[Dict[str, Any]] = None,
        user_id: str = None,
        session_id: str = None
    ) -> Dict[str, Any]:
        """
        Чат с виртуальным тренером
        
        Args:
            user_message: Сообщение пользователя
            chat_history: История чата (последние сообщения)
            user_context: Контекст пользователя (цели, уровень и т.д.)
        
        Returns:
            Ответ виртуального тренера
        """
        
        if not user_message.strip():
            raise ValidationError("Сообщение не может быть пустым")
        
        # Формирование детального контекста пользователя
        context_info = ""
        if user_context:
            # Физические характеристики
            physical_info = []
            if user_context.get("age"):
                physical_info.append(f"возраст {user_context['age']} лет")
            if user_context.get("gender"):
                physical_info.append(f"пол {user_context['gender']}")
            if user_context.get("height"):
                physical_info.append(f"рост {user_context['height']}")
            if user_context.get("weight"):
                physical_info.append(f"вес {user_context['weight']}")
            if physical_info:
                context_info += f"Физические данные: {', '.join(physical_info)}. "
            
            # Фитнес-информация
            if user_context.get("goals"):
                if isinstance(user_context['goals'], list):
                    goals_str = ', '.join(user_context['goals'])
                else:
                    goals_str = user_context['goals']
                context_info += f"Цели тренировок: {goals_str}. "
            
            if user_context.get("fitness_level"):
                context_info += f"Уровень подготовки: {user_context['fitness_level']}. "
            
            if user_context.get("equipment"):
                if isinstance(user_context['equipment'], list):
                    equipment_str = ', '.join(user_context['equipment'])
                else:
                    equipment_str = user_context['equipment']
                context_info += f"Доступное оборудование: {equipment_str}. "
            
            if user_context.get("limitations"):
                if isinstance(user_context['limitations'], list):
                    limitations_str = ', '.join(user_context['limitations'])
                else:
                    limitations_str = user_context['limitations']
                context_info += f"Ограничения: {limitations_str}. "
            
            # Питание
            nutrition_info = []
            if user_context.get("nutrition_goal"):
                nutrition_info.append(f"цель питания: {user_context['nutrition_goal']}")
            if user_context.get("food_preferences"):
                if isinstance(user_context['food_preferences'], list):
                    prefs_str = ', '.join(user_context['food_preferences'])
                else:
                    prefs_str = user_context['food_preferences']
                nutrition_info.append(f"предпочтения: {prefs_str}")
            if user_context.get("allergies"):
                if isinstance(user_context['allergies'], list):
                    allergies_str = ', '.join(user_context['allergies'])
                else:
                    allergies_str = user_context['allergies']
                nutrition_info.append(f"аллергии: {allergies_str}")
            if nutrition_info:
                context_info += f"Питание: {', '.join(nutrition_info)}. "
        
        # Формирование сообщений
        messages = [
            {
                "role": "system",
                "content": self.system_prompts["virtual_trainer"] + 
                          (f"\n\nКонтекст клиента: {context_info}" if context_info else "")
            }
        ]
        
        # Добавление истории чата
        if chat_history:
            for msg in chat_history[-settings.MAX_CHAT_HISTORY:]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # Добавление текущего сообщения
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Store conversation in knowledge base
        if user_id and session_id:
            try:
                # Store user message
                await knowledge_base.store_conversation_message(
                    user_id=user_id,
                    session_id=session_id,
                    role="user",
                    content=user_message,
                    importance_score=1.0
                )
            except Exception as e:
                logger.warning(f"Failed to store user message in knowledge base: {e}")

        # Universal approach: Always provide RAG tools, let LLM decide when to use them
        if user_id and session_id:
            logger.info("Using RAG-enhanced chat with LLM decision-making")
            
            # Always use RAG tools, let AI decide when to call them
            final_result = await self._chat_with_rag_tools(
                messages=messages,
                user_id=user_id,
                session_id=session_id,
                user_message=user_message
            )
            
            if not final_result:
                # Fallback to normal chat if RAG fails
                logger.warning("RAG-enhanced chat failed, falling back to normal chat")
                final_result = await self._make_openai_request(
                    messages=messages,
                    request_type=LLMRequestType.CHAT
                )
                final_result["used_rag"] = False
        else:
            # Normal chat without RAG (no user context)
            logger.info("Using normal chat (no user context)")
            final_result = await self._make_openai_request(
                messages=messages,
                request_type=LLMRequestType.CHAT
            )
            final_result["used_rag"] = False

        # Store AI response in knowledge base
        if user_id and session_id:
            try:
                await knowledge_base.store_conversation_message(
                    user_id=user_id,
                    session_id=session_id,
                    role="assistant",
                    content=final_result["content"],
                    importance_score=1.2 if final_result.get("used_rag", False) else 1.0
                )
            except Exception as e:
                logger.warning(f"Failed to store AI message in knowledge base: {e}")

        return {
            "response": final_result["content"],
            "used_rag": final_result.get("used_rag", False),
            "metadata": {
                "tokens_used": final_result["usage"]["total_tokens"],
                "model": final_result["model"],
                "latency_ms": final_result["latency_ms"]
            }
        }
    
    async def _should_use_rag_tools(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> bool:
        """
        DEPRECATED: This function is no longer used.
        RAG tools are now always available and the LLM decides when to use them.
        """
        # This function is kept for backward compatibility but not used
        return True
    
    async def _chat_with_rag_tools(
        self,
        messages: List[Dict[str, str]],
        user_id: str,
        session_id: str,
        user_message: str
    ) -> Dict[str, Any]:
        """
        Enhanced chat that provides RAG tools for AI to use when needed
        
        Args:
            messages: Chat messages to send
            user_id: User ID for RAG filtering
            session_id: Session ID for RAG filtering  
            user_message: Current user message
            
        Returns:
            OpenAI response with RAG enhancement tracking
        """
        
        try:
            # Add RAG tools to the request
            tools = rag_tools.get_tool_definitions()
            
            # Enhanced system message for intelligent RAG usage
            rag_system_message = """
            
            🧠 ИНСТРУМЕНТЫ ПАМЯТИ:
            У тебя есть доступ к полной истории разговоров с этим пользователем. Используй эти инструменты разумно:
            
            📋 search_conversation_history - найти конкретную информацию из прошлых бесед
            📊 get_conversation_summary - получить обзор недавних тем и обсуждений  
            🔍 find_related_discussions - найти все связанные обсуждения по теме
            
            КОГДА ИСПОЛЬЗОВАТЬ:
            ✅ Пользователь ссылается на прошлые разговоры ("помнишь", "мы обсуждали", "ты говорил")
            ✅ Спрашивает о своей программе, прогрессе, целях ("моя программа", "как дела с...")
            ✅ Вопросы требуют персонального контекста ("когда я...", "что я...")
            ✅ Нужна информация о предыдущих рекомендациях или планах
            ✅ Пользователь спрашивает о времени/датах событий ("когда", "вчера", "на прошлой неделе")
            
            КОГДА НЕ ИСПОЛЬЗОВАТЬ:
            ❌ Общие вопросы о фитнесе/питании без личного контекста
            ❌ Новые темы, не связанные с историей
            ❌ Простые приветствия или благодарности
            ❌ Вопросы, на которые можешь ответить на основе текущего контекста
            
            Принимай решение самостоятельно - если считаешь что информация из истории поможет дать лучший ответ, используй инструменты.
            """
            
            # Modify the first system message to include RAG instructions
            if messages and messages[0]["role"] == "system":
                messages[0]["content"] = messages[0]["content"] + rag_system_message
            
            # Make request with tools
            response = await self._make_openai_request_with_tools(
                messages=messages,
                tools=tools,
                user_id=user_id,
                session_id=session_id
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in RAG-enhanced chat: {e}")
            return None
    
    async def _make_openai_request_with_tools(
        self,
        messages: List[Dict[str, str]],
        tools: List[Dict[str, Any]],
        user_id: str,
        session_id: str
    ) -> Dict[str, Any]:
        """
        Make OpenAI request with function calling tools
        
        Args:
            messages: Chat messages
            tools: Available tools for function calling
            user_id: User ID for tool execution
            session_id: Session ID for tool execution
            
        Returns:
            Final response after tool execution
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
                    "latency_ms": latency_ms,
                    "used_rag": True
                }
            
            else:
                # No tools used, return direct response
                end_time = time.time()
                latency_ms = int((end_time - start_time) * 1000)
                
                return {
                    "content": response.choices[0].message.content,
                    "usage": {"total_tokens": total_tokens},
                    "model": response.model,
                    "latency_ms": latency_ms,
                    "used_rag": False
                }
                
        except Exception as e:
            logger.error(f"Error in OpenAI request with tools: {e}")
            raise LLMServiceError(f"Tool-enhanced chat failed: {str(e)}")
    
    def _create_fallback_workout_program(self, client_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a basic fallback workout program if LLM fails"""
        goal = client_data.get("goal", "общая физическая подготовка")
        level = client_data.get("level", "начальный")
        equipment = client_data.get("equipment", ["собственный вес"])
        
        # Basic program structure
        basic_exercises = {
            "upper_body": ["Отжимания", "Планка", "Подтягивания"],
            "lower_body": ["Приседания", "Выпады", "Подъемы на носки"],
            "cardio": ["Бег на месте", "Прыжки", "Берпи"]
        }
        
        # Adjust difficulty based on level
        if "начальный" in level.lower():
            sets, reps = 2, "8-10"
        elif "средний" in level.lower():
            sets, reps = 3, "10-12"
        else:  # advanced
            sets, reps = 4, "12-15"
        
        weeks = []
        for week_num in range(1, 5):  # 4 weeks
            workouts = []
            
            # 3 workouts per week
            workout_types = ["Верх тела", "Низ тела", "Кардио"]
            exercise_groups = ["upper_body", "lower_body", "cardio"]
            
            for i, (workout_type, exercise_group) in enumerate(zip(workout_types, exercise_groups)):
                exercises = []
                for exercise_name in basic_exercises[exercise_group]:
                    exercises.append({
                        "name": exercise_name,
                        "sets": sets,
                        "reps": reps,
                        "weight": 0,
                        "notes": ""
                    })
                
                workouts.append({
                    "name": workout_type,
                    "exercises": exercises
                })
            
            weeks.append({
                "week_number": week_num,
                "workouts": workouts
            })
        
        return {
            "goal": goal,
            "level": level,
            "duration_weeks": 4,
            "workouts_per_week": 3,
            "equipment": equipment,
            "weeks": weeks
        }

    async def generate_workout_program(
        self,
        client_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Генерация тренировочной программы
        
        Args:
            client_data: Данные клиента (цели, уровень, оборудование и т.д.)
        
        Returns:
            Структурированная программа тренировок в JSON формате
        """
        
        # Валидация входных данных
        required_fields = ["goal", "level", "sessions_per_week"]
        for field in required_fields:
            if field not in client_data:
                raise ValidationError(f"Отсутствует обязательное поле: {field}")
        
        try:
            # Try LLM generation first
            equipment_str = ", ".join(client_data.get("equipment", ["собственный вес"]))
            limitations_str = ", ".join(client_data.get("limitations", ["нет"]))
            
            user_prompt = f"""
            Создай тренировочную программу на 4 недели:
            Цель: {client_data["goal"]}
            Уровень: {client_data["level"]}
            Оборудование: {equipment_str}
            
            JSON формат:
            {{
                "goal": "{client_data['goal']}",
                "level": "{client_data['level']}",
                "duration_weeks": 4,
                "workouts_per_week": 3,
                "equipment": ["{equipment_str}"],
                "weeks": [
                    {{
                        "week_number": 1,
                        "workouts": [
                            {{
                                "name": "Тренировка 1",
                                "exercises": [
                                    {{"name": "Приседания", "sets": 3, "reps": "10-12", "weight": 0}}
                                ]
                            }}
                        ]
                    }}
                ]
            }}
            """
            
            messages = [
                {
                    "role": "system", 
                    "content": "Ты фитнес-тренер. Отвечай ТОЛЬКО валидным JSON."
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
            
            # Выполнение запроса
            result = await self._make_openai_request(
                messages=messages,
                request_type=LLMRequestType.PROGRAM_CREATE,
                max_tokens=1500  # Reduced for simpler response
            )
            
            # Парсинг JSON
            try:
                # Clean response
                cleaned_content = self._clean_json_response(result["content"])
                program_data = json.loads(cleaned_content)
                
                # Валидация структуры
                if "weeks" not in program_data:
                    raise ValueError("Отсутствует структура weeks")
                
                return {
                    "program": program_data,
                    "metadata": {
                        "tokens_used": result["usage"]["total_tokens"],
                        "model": result["model"],
                        "latency_ms": result["latency_ms"],
                        "source": "llm"
                    }
                }
                
            except json.JSONDecodeError as e:
                logger.warning(f"LLM ответ не валидный JSON: {e}")
                logger.info("Используем fallback программу тренировок")
                
                # Use fallback program
                fallback_program = self._create_fallback_workout_program(client_data)
                
                return {
                    "program": fallback_program,
                    "metadata": {
                        "tokens_used": result["usage"]["total_tokens"],
                        "model": result["model"],
                        "latency_ms": result["latency_ms"],
                        "source": "fallback"
                    }
                }
        
        except Exception as e:
            logger.error(f"Ошибка генерации программы тренировок: {e}")
            logger.info("Используем fallback программу тренировок")
            
            # Create fallback program
            fallback_program = self._create_fallback_workout_program(client_data)
            
            return {
                "program": fallback_program,
                "metadata": {
                    "tokens_used": 0,
                    "model": "fallback",
                    "latency_ms": 0,
                    "source": "fallback"
                }
            }
    
    async def adjust_workout_program(
        self,
        current_program: Dict[str, Any],
        feedback: str,
        progress_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Корректировка тренировочной программы
        
        Args:
            current_program: Текущая программа
            feedback: Обратная связь от клиента
            progress_data: Данные о прогрессе
        
        Returns:
            Обновленная программа
        """
        
        if not feedback.strip():
            raise ValidationError("Обратная связь не может быть пустой")
        
        progress_info = ""
        if progress_data:
            progress_info = f"\nДанные прогресса: {json.dumps(progress_data, ensure_ascii=False)}"
        
        user_prompt = f"""
        Скорректируй тренировочную программу на основе обратной связи.
        
        Текущая программа:
        {json.dumps(current_program, ensure_ascii=False, indent=2)}
        
        Обратная связь клиента: {feedback}
        {progress_info}
        
        Верни ОБНОВЛЕННУЮ программу в том же JSON формате, но с корректировками.
        Сохрани общую структуру, но адаптируй нагрузку, упражнения или подходы.
        """
        
        messages = [
            {
                "role": "system",
                "content": self.system_prompts["program_generator"]
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
        
        result = await self._make_openai_request(
            messages=messages,
            request_type=LLMRequestType.PROGRAM_ADJUST,
            max_tokens=2000
        )
        
        try:
            adjusted_program = json.loads(result["content"])
            
            return {
                "program": adjusted_program,
                "metadata": {
                    "tokens_used": result["usage"]["total_tokens"],
                    "model": result["model"],
                    "latency_ms": result["latency_ms"]
                }
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Ошибка парсинга скорректированной программы: {e}")
            raise LLMServiceError("Ошибка корректировки программы")
    
    async def analyze_progress(
        self,
        client_data: Dict[str, Any],
        period_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Анализ прогресса клиента
        
        Args:
            client_data: Данные клиента
            period_data: Данные за период (тренировки, замеры)
        
        Returns:
            Отчет с анализом и рекомендациями
        """
        
        user_prompt = f"""
        Проанализируй прогресс клиента и дай рекомендации.
        
        Данные клиента:
        {json.dumps(client_data, ensure_ascii=False, indent=2)}
        
        Данные за период:
        {json.dumps(period_data, ensure_ascii=False, indent=2)}
        
        Верни анализ в JSON формате:
        {{
            "summary": "Краткий итог прогресса",
            "bottlenecks": ["проблема 1", "проблема 2"],
            "recommendations": ["рекомендация 1", "рекомендация 2"],
            "achievements": ["достижение 1", "достижение 2"],
            "next_goals": ["цель 1", "цель 2"]
        }}
        """
        
        messages = [
            {
                "role": "system",
                "content": self.system_prompts["progress_analyzer"]
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
        
        result = await self._make_openai_request(
            messages=messages,
            request_type=LLMRequestType.PROGRESS_ANALYZE
        )
        
        try:
            analysis = json.loads(result["content"])
            
            return {
                "analysis": analysis,
                "metadata": {
                    "tokens_used": result["usage"]["total_tokens"],
                    "model": result["model"],
                    "latency_ms": result["latency_ms"]
                }
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Ошибка парсинга анализа прогресса: {e}")
            raise LLMServiceError("Ошибка анализа прогресса")
    
    async def generate_notification(
        self,
        notification_type: str,
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Генерация персонализированного уведомления
        
        Args:
            notification_type: Тип уведомления
            user_context: Контекст пользователя
        
        Returns:
            Персонализированное сообщение
        """
        
        type_prompts = {
            "workout_reminder": "Создай мотивирующее напоминание о предстоящей тренировке",
            "payment_reminder": "Создай вежливое напоминание об оплате абонемента",
            "motivational": "Создай мотивационное сообщение для клиента",
            "progress_report": "Создай сообщение с приглашением посмотреть отчет о прогрессе"
        }
        
        specific_prompt = type_prompts.get(notification_type, "Создай персонализированное уведомление")
        
        user_prompt = f"""
        {specific_prompt}.
        
        Контекст пользователя:
        {json.dumps(user_context, ensure_ascii=False, indent=2)}
        
        Сообщение должно быть:
        - Персонализированным
        - Дружелюбным но не навязчивым
        - Мотивирующим
        - На русском языке
        - Длиной не более 200 символов
        
        Верни только текст сообщения без дополнительного форматирования.
        """
        
        messages = [
            {
                "role": "system",
                "content": self.system_prompts["notification_creator"]
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
        
        result = await self._make_openai_request(
            messages=messages,
            request_type=LLMRequestType.NOTIFICATION_CREATE,
            max_tokens=100
        )
        
        return {
            "message": result["content"].strip(),
            "metadata": {
                "tokens_used": result["usage"]["total_tokens"],
                "model": result["model"],
                "latency_ms": result["latency_ms"]
            }
        }

    def _clean_json_response(self, content: str) -> str:
        """Clean and fix common JSON issues in LLM responses"""
        content = content.strip()
        
        # Remove markdown code blocks if present
        if content.startswith('```json'):
            content = content[7:]
        if content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        
        # Find JSON block
        json_start = content.find('{')
        json_end = content.rfind('}')
        
        if json_start >= 0 and json_end > json_start:
            content = content[json_start:json_end+1]
        
        # Fix common issues
        content = content.replace("'", '"')  # Single quotes to double quotes
        content = content.replace(',,', ',')  # Remove double commas
        content = content.replace(',}', '}')  # Remove trailing commas before }
        content = content.replace(',]', ']')  # Remove trailing commas before ]
        
        return content

    def _create_fallback_nutrition_plan(self, nutrition_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a basic fallback nutrition plan if LLM fails"""
        daily_calories = nutrition_data["daily_calories"]
        goal = nutrition_data["nutrition_goal"]
        
        # Calculate macros
        if "похудение" in goal.lower():
            protein_ratio, fat_ratio, carb_ratio = 0.35, 0.30, 0.35
        elif "набор" in goal.lower():
            protein_ratio, fat_ratio, carb_ratio = 0.30, 0.25, 0.45
        else:
            protein_ratio, fat_ratio, carb_ratio = 0.30, 0.30, 0.40
        
        daily_protein = int((daily_calories * protein_ratio) / 4)
        daily_fats = int((daily_calories * fat_ratio) / 9)
        daily_carbs = int((daily_calories * carb_ratio) / 4)
        
        # Basic meal plan
        meal_calories = daily_calories // 4
        
        return {
            "goal": goal,
            "daily_calories": daily_calories,
            "daily_protein": daily_protein,
            "daily_fats": daily_fats,
            "daily_carbs": daily_carbs,
            "days": [
                {
                    "day_name": day,
                    "meals": [
                        {
                            "name": "Завтрак",
                            "time": "08:00",
                            "calories": meal_calories,
                            "dishes": [{"name": "Завтрак по плану", "calories": meal_calories}]
                        },
                        {
                            "name": "Обед", 
                            "time": "13:00",
                            "calories": meal_calories,
                            "dishes": [{"name": "Обед по плану", "calories": meal_calories}]
                        },
                        {
                            "name": "Ужин",
                            "time": "18:00", 
                            "calories": meal_calories,
                            "dishes": [{"name": "Ужин по плану", "calories": meal_calories}]
                        },
                        {
                            "name": "Перекус",
                            "time": "21:00",
                            "calories": meal_calories,
                            "dishes": [{"name": "Перекус по плану", "calories": meal_calories}]
                        }
                    ]
                }
                for day in ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
            ]
        }

    async def generate_nutrition_plan(
        self,
        nutrition_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Генерация плана питания
        
        Args:
            nutrition_data: Данные о питании клиента
        
        Returns:
            Структурированный план питания в JSON формате
        """
        
        # Валидация входных данных
        required_fields = ["nutrition_goal", "daily_calories"]
        for field in required_fields:
            if field not in nutrition_data:
                raise ValidationError(f"Отсутствует обязательное поле: {field}")
        
        try:
            # Try LLM generation first
            preferences_str = ", ".join(nutrition_data.get("food_preferences", ["обычное питание"]))
            allergies_str = ", ".join(nutrition_data.get("allergies", ["нет"]))
            
            user_prompt = f"""
            Создай простой план питания:
            Цель: {nutrition_data["nutrition_goal"]}
            Калории: {nutrition_data["daily_calories"]}
            
            Формат JSON:
            {{
                "goal": "{nutrition_data['nutrition_goal']}",
                "daily_calories": {nutrition_data["daily_calories"]},
                "daily_protein": 150,
                "daily_fats": 80,
                "daily_carbs": 300,
                "days": [
                    {{
                        "day_name": "Понедельник",
                        "meals": [
                            {{
                                "name": "Завтрак",
                                "calories": 500,
                                "dishes": [{{
                                    "name": "Овсянка",
                                    "calories": 300
                                }}]
                            }}
                        ]
                    }}
                ]
            }}
            """
            
            messages = [
                {
                    "role": "system",
                    "content": "Ты эксперт по питанию. Отвечай ТОЛЬКО валидным JSON."
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
            
            result = await self._make_openai_request(
                messages=messages,
                request_type=LLMRequestType.PROGRAM_CREATE,
                max_tokens=1500  # Reduced to encourage simpler response
            )
            
            try:
                nutrition_plan = json.loads(result["content"])
                
                return {
                    "plan": nutrition_plan,
                    "metadata": {
                        "tokens_used": result["usage"]["total_tokens"],
                        "model": result["model"],
                        "latency_ms": result["latency_ms"],
                        "source": "llm"
                    }
                }
                
            except json.JSONDecodeError as e:
                logger.warning(f"LLM ответ не валидный JSON: {e}")
                logger.info("Используем fallback план питания")
                
                # Use fallback plan
                fallback_plan = self._create_fallback_nutrition_plan(nutrition_data)
                
                return {
                    "plan": fallback_plan,
                    "metadata": {
                        "tokens_used": result["usage"]["total_tokens"],
                        "model": result["model"],
                        "latency_ms": result["latency_ms"],
                        "source": "fallback"
                    }
                }
        
        except Exception as e:
            logger.error(f"Ошибка генерации плана питания: {e}")
            logger.info("Используем fallback план питания")
            
            # Create fallback plan
            fallback_plan = self._create_fallback_nutrition_plan(nutrition_data)
            
            return {
                "plan": fallback_plan,
                "metadata": {
                    "tokens_used": 0,
                    "model": "fallback",
                    "latency_ms": 0,
                    "source": "fallback"
                }
            }
    
    async def generate_shopping_list(
        self,
        nutrition_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Генерация списка покупок на основе плана питания
        
        Args:
            nutrition_plan: План питания
        
        Returns:
            Структурированный список покупок
        """
        
        user_prompt = f"""
        На основе плана питания создай список покупок на неделю.
        
        План питания:
        {json.dumps(nutrition_plan, ensure_ascii=False, indent=2)}
        
        Создай список в JSON формате:
        {{
            "shopping_list": {{
                "молочные_продукты": [
                    {{"name": "Молоко", "quantity": "2л"}},
                    {{"name": "Творог", "quantity": "500г"}}
                ],
                "мясо_рыба": [
                    {{"name": "Куриная грудка", "quantity": "1кг"}}
                ],
                "овощи_фрукты": [
                    {{"name": "Помидоры", "quantity": "500г"}}
                ],
                "крупы_бобовые": [
                    {{"name": "Гречка", "quantity": "500г"}}
                ],
                "прочее": [
                    {{"name": "Соль", "quantity": "1 пачка"}}
                ]
            }}
        }}
        
        Учитывай:
        - Объедини одинаковые продукты
        - Рассчитай количество на неделю
        - Группируй по категориям
        - Укажи удобную для покупки упаковку
        """
        
        messages = [
            {
                "role": "system", 
                "content": "Ты эксперт по планированию покупок продуктов питания."
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
        
        result = await self._make_openai_request(
            messages=messages,
            request_type=LLMRequestType.CHAT,
            max_tokens=1000
        )
        
        try:
            shopping_data = json.loads(result["content"])
            
            return {
                "shopping_list": shopping_data["shopping_list"],
                "metadata": {
                    "tokens_used": result["usage"]["total_tokens"],
                    "model": result["model"],
                    "latency_ms": result["latency_ms"]
                }
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Ошибка парсинга списка покупок: {e}")
            raise LLMServiceError("Ошибка создания списка покупок")

    async def get_completion(
        self,
        prompt: str,
        system_message: str = None,
        **kwargs
    ) -> str:
        """
        Simple method to get completion from LLM
        
        Args:
            prompt: User prompt
            system_message: Optional system message
            **kwargs: Additional parameters
        
        Returns:
            LLM response content
        """
        
        if not prompt.strip():
            raise ValidationError("Промпт не может быть пустым")
        
        # Формирование сообщений
        messages = []
        
        if system_message:
            messages.append({
                "role": "system",
                "content": system_message
            })
        
        messages.append({
            "role": "user", 
            "content": prompt
        })
        
        # Выполнение запроса
        result = await self._make_openai_request(
            messages=messages,
            request_type=LLMRequestType.CHAT,
            **kwargs
        )
        
        return result["content"].strip()


# Глобальный экземпляр сервиса
llm_service = LLMService() 
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
        user_context: Optional[Dict[str, Any]] = None
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
        
        # Формирование контекста
        context_info = ""
        if user_context:
            if user_context.get("goals"):
                context_info += f"Цели клиента: {', '.join(user_context['goals'])}. "
            if user_context.get("fitness_level"):
                context_info += f"Уровень подготовки: {user_context['fitness_level']}. "
            if user_context.get("limitations"):
                context_info += f"Ограничения: {', '.join(user_context['limitations'])}. "
        
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
        
        # Выполнение запроса
        result = await self._make_openai_request(
            messages=messages,
            request_type=LLMRequestType.CHAT
        )
        
        return {
            "response": result["content"],
            "metadata": {
                "tokens_used": result["usage"]["total_tokens"],
                "model": result["model"],
                "latency_ms": result["latency_ms"]
            }
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
        
        # Формирование промпта
        equipment_str = ", ".join(client_data.get("equipment", ["собственный вес"]))
        limitations_str = ", ".join(client_data.get("limitations", ["нет"]))
        
        user_prompt = f"""
        Создай тренировочную программу на 4 недели с параметрами:
        - Цель: {client_data["goal"]}
        - Уровень: {client_data["level"]}
        - Тренировок в неделю: {client_data["sessions_per_week"]}
        - Доступное оборудование: {equipment_str}
        - Ограничения: {limitations_str}
        
        Ответ должен быть СТРОГО в JSON формате:
        {{
            "program_id": "uuid",
            "weeks": [
                {{
                    "week_number": 1,
                    "days": [
                        {{
                            "day_of_week": "понедельник",
                            "workout_type": "силовая",
                            "exercises": [
                                {{"name": "Приседания", "sets": 3, "reps": 12, "weight": 0, "notes": ""}},
                                {{"name": "Отжимания", "sets": 3, "reps": 10, "notes": ""}}
                            ]
                        }}
                    ]
                }}
            ],
            "generated_at": "{datetime.now().isoformat()}"
        }}
        
        Не добавляй лишний текст, только JSON.
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
        
        # Выполнение запроса
        result = await self._make_openai_request(
            messages=messages,
            request_type=LLMRequestType.PROGRAM_CREATE,
            max_tokens=2000  # Увеличенный лимит для программы
        )
        
        # Парсинг JSON
        try:
            # Убираем markdown блоки если есть
            json_content = result["content"].strip()
            if json_content.startswith("```json"):
                json_content = json_content[7:]  # убираем ```json
            if json_content.endswith("```"):
                json_content = json_content[:-3]  # убираем ```
            json_content = json_content.strip()
            
            program_data = json.loads(json_content)
            
            # Валидация структуры
            if "weeks" not in program_data:
                raise ValueError("Отсутствует структура weeks")
            
            return {
                "program": program_data,
                "metadata": {
                    "tokens_used": result["usage"]["total_tokens"],
                    "model": result["model"],
                    "latency_ms": result["latency_ms"]
                }
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Ошибка парсинга JSON программы: {e}")
            logger.error(f"Ответ LLM: {result['content']}")
            raise LLMServiceError("Ошибка формирования программы тренировок")
    
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
        
        # Формирование промпта
        preferences_str = ", ".join(nutrition_data.get("food_preferences", ["обычное питание"]))
        allergies_str = ", ".join(nutrition_data.get("allergies", ["нет"]))
        
        user_prompt = f"""
        Создай план питания на 7 дней с параметрами:
        - Цель питания: {nutrition_data["nutrition_goal"]}
        - Калории в день: {nutrition_data["daily_calories"]}
        - Пищевые предпочтения: {preferences_str}
        - Аллергии/ограничения: {allergies_str}
        - Вес: {nutrition_data.get("weight", 70)} кг
        - Пол: {nutrition_data.get("gender", "")}
        - Цели фитнеса: {", ".join(nutrition_data.get("fitness_goals", []))}
        
        Ответ должен быть СТРОГО в JSON формате:
        {{
            "goal": "цель питания",
            "daily_calories": калорий_в_день,
            "daily_protein": граммы_белка,
            "daily_fats": граммы_жиров,
            "daily_carbs": граммы_углеводов,
            "days": [
                {{
                    "day_name": "Понедельник",
                    "meals": [
                        {{
                            "name": "Завтрак",
                            "time": "08:00",
                            "calories": 400,
                            "dishes": [
                                {{
                                    "name": "Овсянка с ягодами",
                                    "portion": "200г",
                                    "calories": 300,
                                    "protein": 10,
                                    "fats": 5,
                                    "carbs": 50,
                                    "recipe": {{
                                        "ingredients": "овсянка 50г, молоко 150мл, ягоды 50г",
                                        "instructions": "Сварить овсянку на молоке, добавить ягоды",
                                        "cooking_time": 10,
                                        "protein": 10,
                                        "fats": 5,
                                        "carbs": 50,
                                        "calories": 300
                                    }}
                                }}
                            ]
                        }}
                    ]
                }}
            ]
        }}
        
        Учитывай:
        - Сбалансированность БЖУ
        - Разнообразие блюд
        - Пищевые предпочтения и аллергии
        - Время приготовления (простые рецепты)
        - Доступность продуктов
        """
        
        messages = [
            {
                "role": "system",
                "content": self.system_prompts["program_generator"] + 
                          "\n\nТы также эксперт по питанию и создаешь планы питания."
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
        
        result = await self._make_openai_request(
            messages=messages,
            request_type=LLMRequestType.PROGRAM_GENERATE,
            max_tokens=2500
        )
        
        try:
            nutrition_plan = json.loads(result["content"])
            
            return {
                "plan": nutrition_plan,
                "metadata": {
                    "tokens_used": result["usage"]["total_tokens"],
                    "model": result["model"],
                    "latency_ms": result["latency_ms"]
                }
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Ошибка парсинга плана питания: {e}")
            raise LLMServiceError("Ошибка создания плана питания")
    
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


# Глобальный экземпляр сервиса
llm_service = LLMService() 
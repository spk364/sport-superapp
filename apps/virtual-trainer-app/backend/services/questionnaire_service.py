"""
Questionnaire Service for handling user profile setup
"""
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class Question:
    key: str
    question: str
    type: str
    options: Optional[List[str]] = None
    emoji: str = "❓"

class QuestionnaireService:
    PROFILE_QUESTIONS = [
        Question(
            key="goals",
            question="Какие у вас цели тренировок?",
            type="list",
            emoji="🎯",
            options=[
                "Похудение",
                "Набор мышечной массы",
                "Поддержание формы",
                "Увеличение силы",
                "Улучшение выносливости",
                "Реабилитация",
                "Подготовка к соревнованиям"
            ]
        ),
        Question(
            key="fitness_level",
            question="Какой у вас уровень физической подготовки?",
            type="single",
            emoji="💪",
            options=[
                "Начальный (новичок)",
                "Средний (тренируюсь 6-12 месяцев)",
                "Продвинутый (тренируюсь более года)",
                "Профессиональный"
            ]
        ),
        Question(
            key="equipment",
            question="Какое оборудование у вас есть?",
            type="list",
            emoji="🏋️",
            options=[
                "Собственный вес",
                "Гантели",
                "Штанга",
                "Турник",
                "Брусья",
                "Эспандеры",
                "Тренажерный зал",
                "Беговая дорожка",
                "Велотренажер"
            ]
        ),
        Question(
            key="limitations",
            question="Есть ли у вас ограничения или проблемы со здоровьем?",
            type="list_optional",
            emoji="⚠️",
            options=[
                "Проблемы со спиной",
                "Проблемы с коленями",
                "Проблемы с плечами",
                "Сердечно-сосудистые заболевания",
                "Нет ограничений",
                "Другое"
            ]
        ),
        Question(
            key="height",
            question="Какой у вас рост в сантиметрах?",
            type="number",
            emoji="📏"
        ),
        Question(
            key="weight",
            question="Какой у вас вес в килограммах?",
            type="number",
            emoji="⚖️"
        ),
        Question(
            key="age",
            question="Сколько вам лет?",
            type="number",
            emoji="🎂"
        ),
        Question(
            key="gender",
            question="Укажите ваш пол:",
            type="single",
            emoji="👤",
            options=["Мужской", "Женский"]
        ),
        Question(
            key="nutrition_goal",
            question="Какая у вас цель по питанию?",
            type="single",
            emoji="🍎",
            options=[
                "Похудение (дефицит калорий)",
                "Набор массы (профицит калорий)",
                "Поддержание веса",
                "Сушка (строгий дефицит)",
                "Не слежу за питанием"
            ]
        ),
        Question(
            key="food_preferences",
            question="Какие у вас пищевые предпочтения?",
            type="list_optional",
            emoji="🥗",
            options=[
                "Обычное питание",
                "Вегетарианство",
                "Веганство",
                "Кето-диета",
                "Низкоуглеводное",
                "Средиземноморская диета",
                "Палео",
                "Другое"
            ]
        ),
        Question(
            key="allergies",
            question="Есть ли у вас пищевые аллергии или непереносимость?",
            type="list_optional",
            emoji="🚫",
            options=[
                "Глютен",
                "Лактоза",
                "Орехи",
                "Морепродукты",
                "Яйца",
                "Соя",
                "Нет аллергий",
                "Другое"
            ]
        )
    ]

    def __init__(self, user_service, trainer_service, llm_service):
        self.user_service = user_service
        self.trainer_service = trainer_service
        self.llm_service = llm_service

    def start_questionnaire(self, user_id: str) -> Question:
        """Start the questionnaire process"""
        session = self.user_service.get_user_session(user_id)
        session["questionnaire_state"] = {
            "current_question": 0,
            "answers": {},
            "total_questions": len(self.PROFILE_QUESTIONS)
        }
        return self.PROFILE_QUESTIONS[0]

    def get_progress(self, user_id: str) -> Dict[str, int]:
        """Get questionnaire progress"""
        session = self.user_service.get_user_session(user_id)
        questionnaire = session.get("questionnaire_state", {})
        
        current = questionnaire.get("current_question", 0)
        total = questionnaire.get("total_questions", len(self.PROFILE_QUESTIONS))
        
        return {
            "current": current + 1,  # 1-based for display
            "total": total,
            "percentage": int((current / total) * 100) if total > 0 else 0
        }

    async def handle_answer(self, user_id: str, answer: str) -> Tuple[Optional[Question], bool, Optional[str]]:
        """
        Handle user's answer using LLM for natural language processing
        Returns: (next_question, is_completed, error_message)
        """
        session = self.user_service.get_user_session(user_id)
        questionnaire = session.get("questionnaire_state")
        
        if not questionnaire:
            return None, False, "Questionnaire not started"
        
        current_q = questionnaire["current_question"]
        question = self.PROFILE_QUESTIONS[current_q]
        
        # Process answer with LLM for natural language understanding
        processed_answer, error_msg = await self._process_answer_with_llm(question, answer)
        if error_msg:
            return question, False, error_msg
        
        # Store the processed answer
        questionnaire["answers"][question.key] = processed_answer
        
        # Move to next question
        questionnaire["current_question"] += 1
        
        # Check if questionnaire is completed
        if questionnaire["current_question"] >= len(self.PROFILE_QUESTIONS):
            await self._complete_questionnaire(user_id, questionnaire["answers"])
            return None, True, None
        
        # Return next question
        return self.PROFILE_QUESTIONS[questionnaire["current_question"]], False, None

    async def _process_answer_with_llm(self, question: Question, answer: str) -> Tuple[Any, Optional[str]]:
        """Process answer using LLM for natural language understanding"""
        
        # For number type, try direct conversion first
        if question.type == "number":
            try:
                value = int(answer.strip())
                if value <= 0:
                    return None, "Значение должно быть положительным числом"
                return value, None
            except ValueError:
                return None, "Пожалуйста, введите число"
        
        # For questions with options, use LLM to match natural language to options
        if question.options:
            # First try simple fallback matching for common cases
            fallback_result = self._simple_match_answer(question, answer)
            if fallback_result[0] is not None:
                return fallback_result
            
            # If simple matching fails, try LLM
            try:
                prompt = f"""
Пользователь отвечает на вопрос: "{question.question}"

Доступные варианты ответов:
{chr(10).join(f"- {option}" for option in question.options)}

Ответ пользователя: "{answer}"

Задача: определить, какой из доступных вариантов лучше всего соответствует ответу пользователя.

Правила:
- Если ответ четко соответствует одному варианту, верни только этот вариант
- Если ответ соответствует нескольким вариантам (для типа list), верни их через запятую
- Если ответ "нет", "никаких", "отсутствуют" для optional вопросов, верни "нет"
- Если ответ неясен, верни "UNCLEAR"

Верни только варианты из списка или "нет" или "UNCLEAR".
"""
                
                result = await self.llm_service.get_completion(prompt)
                processed_result = result.strip()
                
                if processed_result == "UNCLEAR":
                    return self._simple_match_answer(question, answer)
                
                if processed_result.lower() in ["нет", "никаких", "отсутствуют"]:
                    return [] if question.type in ["list", "list_optional"] else "нет", None
                
                # Process the result based on question type
                if question.type in ["list", "list_optional"]:
                    # Split by comma and clean up
                    selected_options = [opt.strip() for opt in processed_result.split(',')]
                    # Validate that all options are in the available list
                    valid_options = []
                    for opt in selected_options:
                        # Find best match in available options
                        best_match = self._find_best_option_match(opt, question.options)
                        if best_match and best_match not in valid_options:
                            valid_options.append(best_match)
                    
                    if not valid_options and question.type == "list":
                        return self._simple_match_answer(question, answer)
                    
                    return valid_options, None
                
                else:  # single choice
                    # Find best matching option
                    best_match = self._find_best_option_match(processed_result, question.options)
                    if best_match:
                        return best_match, None
                    else:
                        return self._simple_match_answer(question, answer)
                        
            except Exception as e:
                # Fallback to simple matching if LLM fails
                return self._simple_match_answer(question, answer)
        
        # For open-ended questions without options
        return answer.strip(), None

    def _find_best_option_match(self, user_text: str, options: List[str]) -> Optional[str]:
        """Find the best matching option from the list"""
        user_lower = user_text.lower()
        
        # Exact match first
        for option in options:
            if user_lower == option.lower():
                return option
        
        # Partial match
        for option in options:
            if user_lower in option.lower() or option.lower() in user_lower:
                return option
        
        # Word matching
        user_words = user_lower.split()
        best_match = None
        max_matches = 0
        
        for option in options:
            option_words = option.lower().split()
            matches = sum(1 for word in user_words if any(word in opt_word or opt_word in word for opt_word in option_words))
            if matches > max_matches:
                max_matches = matches
                best_match = option
        
        return best_match if max_matches > 0 else None

    def _simple_match_answer(self, question: Question, answer: str) -> Tuple[Any, Optional[str]]:
        """Simple fallback answer processing with flexible matching"""
        answer_lower = answer.lower().strip()
        
        # Handle negative responses for optional questions
        negative_responses = ["нет", "никаких", "отсутствуют", "нет ограничений", "нет аллергий", "обычное", "не", "no"]
        if any(neg in answer_lower for neg in negative_responses):
            if question.type in ["list_optional"]:
                return [], None
            elif question.type == "single" and "нет" in [opt.lower() for opt in question.options]:
                return "нет", None
        
        # Handle numbered responses (1, 2, 3, etc.)
        if answer_lower.isdigit() or (answer_lower.endswith('.') and answer_lower[:-1].isdigit()):
            try:
                num = int(answer_lower.rstrip('.'))
                if 1 <= num <= len(question.options):
                    selected_option = question.options[num - 1]
                    if question.type in ["list", "list_optional"]:
                        return [selected_option], None
                    else:
                        return selected_option, None
            except ValueError:
                pass
        
        # Handle comma-separated numbered responses (1,2,3)
        if question.type in ["list", "list_optional"] and (',' in answer or ' ' in answer):
            selected_options = []
            parts = answer.replace(',', ' ').split()
            for part in parts:
                part_clean = part.strip().rstrip('.')
                if part_clean.isdigit():
                    try:
                        num = int(part_clean)
                        if 1 <= num <= len(question.options):
                            selected_options.append(question.options[num - 1])
                    except ValueError:
                        continue
            if selected_options:
                return selected_options, None
        
        # Keyword matching
        matches = []
        for option in question.options:
            option_lower = option.lower()
            # Check if user's answer contains key words from the option
            if any(word in option_lower for word in answer_lower.split() if len(word) > 2):
                matches.append(option)
            # Or if option contains words from user's answer
            elif any(word in answer_lower for word in option_lower.split() if len(word) > 2):
                matches.append(option)
        
        if matches:
            if question.type in ["list", "list_optional"]:
                return matches, None
            else:
                return matches[0], None  # Return first match for single choice
        
        # If no matches found, provide helpful error
        if question.type == "list":
            return None, f"Не могу определить ваш выбор. Попробуйте написать номер варианта (например: 1) или ключевые слова из списка."
        elif question.type == "list_optional":
            return [], None  # Return empty list for optional questions
        else:
            return None, f"Не могу определить ваш выбор. Попробуйте написать номер варианта (например: 1) или ключевые слова."

    async def _complete_questionnaire(self, user_id: str, answers: Dict[str, Any]) -> None:
        """Complete the questionnaire and update user profile"""
        # Update user profile with answers
        self.user_service.update_user_profile(user_id, answers)
        
        # Calculate and update BMR if we have all required data
        if all(key in answers for key in ["weight", "height", "age", "gender"]):
            bmr = self.trainer_service.calculate_bmr(
                answers["weight"],
                answers["height"],
                answers["age"],
                answers["gender"]
            )
            self.user_service.update_user_profile(user_id, {"daily_calories": bmr})
        
        # Clear questionnaire state and save
        session = self.user_service.get_user_session(user_id)
        session["questionnaire_state"] = None
        self.user_service._save_user_data(user_id)  # Ensure the cleared state is saved 
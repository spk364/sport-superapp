"""
Virtual Trainer Telegram Bot
Главный файл бота с интеграцией LLM функций
"""

import asyncio
import logging
import os
import sys
from typing import Dict, Any
from datetime import datetime

from telegram import Update, BotCommand
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    filters, ContextTypes
)

# Добавляем путь к корню проекта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.llm_service import LLMService
from backend.core.config import settings

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Глобальный LLM сервис
llm_service = LLMService()

# Хранилище пользовательских сессий (в продакшене заменить на БД)
user_sessions: Dict[int, Dict[str, Any]] = {}


def calculate_bmr(weight: int, height: int, age: int, gender: str) -> int:
    """Расчет базового метаболизма по формуле Миффлина-Сан Жеора"""
    if gender.lower() in ['мужской', 'м', 'male']:
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:  # женский
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    
    # Умножаем на коэффициент активности (средняя активность)
    return int(bmr * 1.55)


def get_user_session(user_id: int) -> Dict[str, Any]:
    """Получить или создать сессию пользователя"""
    if user_id not in user_sessions:
        user_sessions[user_id] = {
            "chat_history": [],
            "context": {
                "goals": [],
                "fitness_level": "начальный",
                "equipment": [],
                "limitations": [],
                "nutrition_goal": "",
                "food_preferences": [],
                "allergies": [],
                "daily_calories": 0,
                "height": 0,
                "weight": 0,
                "age": 0,
                "gender": ""
            },
            "current_program": None,
            "questionnaire_state": None,  # Состояние опросника
            "created_at": datetime.now()
        }
    return user_sessions[user_id]


# Вопросы для опросника профиля
PROFILE_QUESTIONS = [
    {
        "key": "goals",
        "question": "🎯 *Какие у вас цели тренировок?*\n\nВыберите одну или несколько (через запятую):\n• Похудение\n• Набор мышечной массы\n• Поддержание формы\n• Увеличение силы\n• Улучшение выносливости\n• Реабилитация\n• Подготовка к соревнованиям\n\n*Пример ответа:* похудение, увеличение силы",
        "type": "list"
    },
    {
        "key": "fitness_level", 
        "question": "💪 *Какой у вас уровень физической подготовки?*\n\n• Начальный (новичок)\n• Средний (тренируюсь 6-12 месяцев)\n• Продвинутый (тренируюсь более года)\n• Профессиональный\n\n*Пример ответа:* средний",
        "type": "single"
    },
    {
        "key": "equipment",
        "question": "🏋️ *Какое оборудование у вас есть?*\n\nВыберите доступное (через запятую):\n• Собственный вес\n• Гантели\n• Штанга\n• Турник\n• Брусья\n• Эспандеры\n• Тренажерный зал\n• Беговая дорожка\n• Велотренажер\n\n*Пример ответа:* гантели, турник, собственный вес",
        "type": "list"
    },
    {
        "key": "limitations",
        "question": "⚠️ *Есть ли у вас ограничения или проблемы со здоровьем?*\n\n• Проблемы со спиной\n• Проблемы с коленями\n• Проблемы с плечами\n• Сердечно-сосудистые заболевания\n• Нет ограничений\n• Другое\n\n*Пример ответа:* проблемы со спиной\n*Если нет ограничений, напишите:* нет",
        "type": "list_optional"
    },
    {
        "key": "height",
        "question": "📏 *Какой у вас рост в сантиметрах?*\n\n*Пример ответа:* 175",
        "type": "number"
    },
    {
        "key": "weight", 
        "question": "⚖️ *Какой у вас вес в килограммах?*\n\n*Пример ответа:* 70",
        "type": "number"
    },
    {
        "key": "age",
        "question": "🎂 *Сколько вам лет?*\n\n*Пример ответа:* 25",
        "type": "number"
    },
    {
        "key": "gender",
        "question": "👤 *Укажите ваш пол:*\n\n• Мужской\n• Женский\n\n*Пример ответа:* мужской",
        "type": "single"
    },
    {
        "key": "nutrition_goal",
        "question": "🍎 *Какая у вас цель по питанию?*\n\n• Похудение (дефицит калорий)\n• Набор массы (профицит калорий)\n• Поддержание веса\n• Сушка (строгий дефицит)\n• Не слежу за питанием\n\n*Пример ответа:* похудение",
        "type": "single"
    },
    {
        "key": "food_preferences",
        "question": "🥗 *Какие у вас пищевые предпочтения?*\n\n• Обычное питание\n• Вегетарианство\n• Веганство\n• Кето-диета\n• Низкоуглеводное\n• Средиземноморская диета\n• Палео\n• Другое\n\n*Пример ответа:* вегетарианство, низкоуглеводное\n*Если обычное питание, напишите:* обычное",
        "type": "list_optional"
    },
    {
        "key": "allergies",
        "question": "🚫 *Есть ли у вас пищевые аллергии или непереносимость?*\n\n• Глютен\n• Лактоза\n• Орехи\n• Морепродукты\n• Яйца\n• Соя\n• Нет аллергий\n• Другое\n\n*Пример ответа:* глютен, орехи\n*Если нет аллергий, напишите:* нет",
        "type": "list_optional"
    }
]


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start"""
    user = update.effective_user
    user_id = user.id
    
    # Создаем сессию пользователя
    session = get_user_session(user_id)
    
    welcome_text = f"""
🏋️ *Добро пожаловать в Virtual Trainer, {user.first_name}!*

Я ваш персональный AI-тренер и нутрициолог, готовый помочь с:
• 💬 Консультациями по технике упражнений
• 📋 Созданием программ тренировок
• 🍎 Планами питания с рецептами
• 🛒 Списками покупок
• 📊 Анализом прогресса

*Доступные команды:*
/chat - Задать вопрос тренеру
/program - Создать программу тренировок
/nutrition - Создать план питания
/shopping - Список покупок
/recipes - Посмотреть рецепты
/show - Показать сохраненную программу
/profile - Настроить профиль
/help - Получить справку

Просто напишите мне любой вопрос о тренировках!
"""
    
    await update.message.reply_text(welcome_text, parse_mode='Markdown')


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /help"""
    help_text = """
🤖 **Команды Virtual Trainer:**

**Основные команды:**
/start - Главное меню
/chat - Режим чата с тренером  
/program - Создать программу тренировок
/nutrition - Создать план питания
/shopping - Список покупок
/recipes - Посмотреть рецепты
/show - Показать сохраненную программу
/profile - Настроить профиль
/help - Показать эту справку

**Чат с тренером:**
Просто напишите любой вопрос о тренировках, питании, технике упражнений. Я учитываю ваш профиль и цели.

**Создание программы:**
Я создам персональную программу на основе ваших целей, уровня подготовки и доступного оборудования.

**План питания:**
Создам рацион под ваши цели с учетом предпочтений, аллергий и расчетом БЖУ. Включает рецепты и список покупок.

**Настройка профиля:**
Укажите ваши цели, уровень подготовки, оборудование и ограничения для более точных рекомендаций.

💡 **Совет:** Чем больше информации о себе вы предоставите, тем более персонализированными будут мои советы!
"""
    
    await update.message.reply_text(help_text, parse_mode='Markdown')


async def chat_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Активация режима чата с тренером"""
    await update.message.reply_text(
        "💬 Режим чата активирован!\n\n"
        "Задавайте любые вопросы о тренировках, питании, технике упражнений. "
        "Я отвечу с учетом вашего профиля и целей.\n\n"
        "Для выхода из режима чата используйте /start"
    )


async def profile_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Настройка профиля пользователя"""
    user_id = update.effective_user.id
    session = get_user_session(user_id)
    context_data = session["context"]
    
    # Если профиль уже заполнен, показываем его
    if context_data.get('goals') and context_data.get('fitness_level') != 'начальный':
        profile_text = f"""
⚙️ *Ваш текущий профиль:*

🎯 *Цели:* {', '.join(context_data.get('goals', ['не указаны']))}
💪 *Уровень:* {context_data.get('fitness_level', 'не указан')}
🏋️ *Оборудование:* {', '.join(context_data.get('equipment', ['не указано']))}
⚠️ *Ограничения:* {', '.join(context_data.get('limitations', ['нет'])) if context_data.get('limitations') else 'нет'}

*Хотите обновить профиль?*
Введите "да" для запуска опросника или напишите вопрос тренеру.
"""
        await update.message.reply_text(profile_text, parse_mode='Markdown')
    else:
        # Запускаем опросник для нового профиля
        await start_questionnaire(update, session)


async def start_questionnaire(update: Update, session: dict) -> None:
    """Запуск опросника профиля"""
    session["questionnaire_state"] = {
        "current_question": 0,
        "answers": {}
    }
    
    # Приветствие опросника
    welcome_text = """
📋 *Создание профиля*

Давайте создадим ваш персональный профиль! 
Это поможет мне давать более точные рекомендации.

Опросник займет 2-3 минуты. В любой момент можете написать "стоп" для выхода.
"""
    await update.message.reply_text(welcome_text, parse_mode='Markdown')
    
    # Задаем первый вопрос
    await ask_next_question(update, session)


async def ask_next_question(update: Update, session: dict) -> None:
    """Задать следующий вопрос опросника"""
    questionnaire = session["questionnaire_state"]
    current_q = questionnaire["current_question"]
    
    if current_q < len(PROFILE_QUESTIONS):
        question_data = PROFILE_QUESTIONS[current_q]
        question_text = f"*Вопрос {current_q + 1} из {len(PROFILE_QUESTIONS)}*\n\n{question_data['question']}"
        await update.message.reply_text(question_text, parse_mode='Markdown')
    else:
        # Опросник завершен
        await finish_questionnaire(update, session)


async def finish_questionnaire(update: Update, session: dict) -> None:
    """Завершение опросника и сохранение профиля"""
    questionnaire = session["questionnaire_state"]
    answers = questionnaire["answers"]
    
    # Сохраняем ответы в контекст
    for key, value in answers.items():
        session["context"][key] = value
    
    # Очищаем состояние опросника
    session["questionnaire_state"] = None
    
    # Вычисляем базовый метаболизм и дневную норму калорий
    if context_data.get('height') and context_data.get('weight') and context_data.get('age'):
        bmr = calculate_bmr(
            context_data.get('weight', 0),
            context_data.get('height', 0), 
            context_data.get('age', 0),
            context_data.get('gender', '')
        )
        context_data['daily_calories'] = bmr
    
    # Показываем результат
    result_text = f"""
✅ *Профиль успешно создан!*

*🏋️ Физические данные:*
👤 Пол: {context_data.get('gender', '').title()}
📏 Рост: {context_data.get('height', 0)} см
⚖️ Вес: {context_data.get('weight', 0)} кг
🎂 Возраст: {context_data.get('age', 0)} лет

*💪 Тренировки:*
🎯 Цели: {', '.join(context_data.get('goals', []))}
💪 Уровень: {context_data.get('fitness_level', '')}
🏋️ Оборудование: {', '.join(context_data.get('equipment', []))}
⚠️ Ограничения: {', '.join(context_data.get('limitations', [])) if context_data.get('limitations') else 'нет'}

*🍎 Питание:*
🎯 Цель питания: {context_data.get('nutrition_goal', '')}
🥗 Предпочтения: {', '.join(context_data.get('food_preferences', [])) if context_data.get('food_preferences') else 'обычное питание'}
🚫 Аллергии: {', '.join(context_data.get('allergies', [])) if context_data.get('allergies') else 'нет'}
🔥 Дневная норма: {context_data.get('daily_calories', 0)} ккал

Теперь я могу создать для вас:
• Персональную программу тренировок (/program)
• План питания с рецептами (/nutrition)
• Список покупок (/shopping)
"""
    await update.message.reply_text(result_text, parse_mode='Markdown')


async def send_program_summary(update: Update, result: dict) -> None:
    """Отправка краткого описания программы"""
    program = result["program"]
    summary_text = f"""
🏋️ *Ваша персональная программа создана!*

📊 *Статистика:*
• Недель: {len(program.get('weeks', []))}
• Токенов использовано: {result['metadata']['tokens_used']}

Сейчас отправлю полную программу...
"""
    await update.message.reply_text(summary_text, parse_mode='Markdown')


async def send_full_program(update: Update, session: dict) -> None:
    """Отправка полной программы тренировок"""
    program = session["current_program"]
    
    for week in program.get("weeks", []):
        week_num = week.get("week_number", 1)
        week_text = f"📅 *Неделя {week_num}:*\n\n"
        
        for day in week.get("days", []):
            day_name = day.get("day_of_week", "")
            workout_type = day.get("workout_type", "")
            week_text += f"• *{day_name.title()}* - {workout_type}\n"
            
            exercises = day.get("exercises", [])
            for ex in exercises:
                name = ex.get("name", "")
                sets = ex.get("sets", "")
                reps = ex.get("reps", "")
                rest = ex.get("rest", "")
                notes = ex.get("notes", "")
                
                week_text += f"  - {name}"
                if sets and reps:
                    week_text += f" ({sets}x{reps})"
                if rest:
                    week_text += f", отдых: {rest}"
                if notes:
                    week_text += f"\n    💡 {notes}"
                week_text += "\n"
            week_text += "\n"
        
        # Проверяем длину сообщения (лимит Telegram ~4000 символов)
        if len(week_text) > 4000:
            # Разбиваем на части
            parts = week_text.split('\n\n')
            current_part = f"📅 *Неделя {week_num}:*\n\n"
            
            for part in parts[1:]:  # Пропускаем заголовок
                if len(current_part + part + '\n\n') > 3500:
                    await update.message.reply_text(current_part, parse_mode='Markdown')
                    current_part = part + '\n\n'
                else:
                    current_part += part + '\n\n'
            
            if current_part.strip():
                await update.message.reply_text(current_part, parse_mode='Markdown')
        else:
            await update.message.reply_text(week_text, parse_mode='Markdown')
    
    # Завершающее сообщение
    final_text = """
✅ *Программа полностью отправлена!*

*Команды:*
/program - создать новую программу
/chat - задать вопрос о программе
/profile - изменить профиль
"""
    await update.message.reply_text(final_text, parse_mode='Markdown')


async def show_program_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Показать сохраненную программу тренировок"""
    user_id = update.effective_user.id
    session = get_user_session(user_id)
    
    if not session.get("current_program"):
        await update.message.reply_text(
            "❌ У вас еще нет созданной программы.\nИспользуйте /program для создания новой программы.",
            parse_mode='Markdown'
        )
        return
    
    await update.message.reply_text("📋 *Ваша сохраненная программа:*", parse_mode='Markdown')
    await send_full_program(update, session)


async def program_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Создание программы тренировок"""
    user_id = update.effective_user.id
    session = get_user_session(user_id)
    
    await update.message.reply_text(
        "⏳ Создаю программу тренировок специально для вас...\n"
        "Это может занять 20-30 секунд."
    )
    
    try:
        # Подготовка данных клиента
        context_data = session["context"]
        client_data = {
            "goal": ", ".join(context_data.get("goals", ["общая физическая подготовка"])),
            "level": context_data.get("fitness_level", "начальный"),
            "sessions_per_week": 3,  # По умолчанию
            "equipment": context_data.get("equipment", ["собственный вес"]),
            "limitations": context_data.get("limitations", [])
        }
        
        # Генерация программы
        result = await llm_service.generate_workout_program(client_data)
        
        # Сохранение программы в сессии
        session["current_program"] = result["program"]
        
        # Сначала показываем краткую версию
        await send_program_summary(update, result)
        
        # Затем показываем полную программу
        await send_full_program(update, session)
        
    except Exception as e:
        logger.error(f"Ошибка создания программы: {e}")
        await update.message.reply_text(
            "❌ Извините, произошла ошибка при создании программы. "
            "Попробуйте еще раз позже."
        )


async def nutrition_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Создание плана питания"""
    user_id = update.effective_user.id
    session = get_user_session(user_id)
    context_data = session["context"]
    
    # Проверяем, заполнен ли профиль питания
    if not context_data.get('nutrition_goal') or not context_data.get('daily_calories'):
        await update.message.reply_text(
            "❌ Для создания плана питания нужно заполнить профиль.\n"
            "Используйте команду /profile для настройки данных о питании.",
            parse_mode='Markdown'
        )
        return
    
    await update.message.reply_text(
        "⏳ Создаю персональный план питания...\n"
        "Это может занять 30-40 секунд."
    )
    
    try:
        # Подготовка данных для генерации плана питания
        nutrition_data = {
            "nutrition_goal": context_data.get("nutrition_goal", ""),
            "daily_calories": context_data.get("daily_calories", 2000),
            "food_preferences": context_data.get("food_preferences", []),
            "allergies": context_data.get("allergies", []),
            "weight": context_data.get("weight", 70),
            "gender": context_data.get("gender", ""),
            "fitness_goals": context_data.get("goals", [])
        }
        
        # Генерация плана питания
        result = await llm_service.generate_nutrition_plan(nutrition_data)
        
        # Сохранение плана в сессии
        session["current_nutrition_plan"] = result["plan"]
        
        # Отправка плана питания
        await send_nutrition_plan(update, result)
        
    except Exception as e:
        logger.error(f"Ошибка создания плана питания: {e}")
        await update.message.reply_text(
            "❌ Извините, произошла ошибка при создании плана питания. "
            "Попробуйте еще раз позже."
        )


async def shopping_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Создание списка покупок"""
    user_id = update.effective_user.id
    session = get_user_session(user_id)
    
    if not session.get("current_nutrition_plan"):
        await update.message.reply_text(
            "❌ Сначала создайте план питания командой /nutrition",
            parse_mode='Markdown'
        )
        return
    
    await update.message.reply_text("📝 *Составляю список покупок...*", parse_mode='Markdown')
    
    try:
        # Генерация списка покупок на основе плана питания
        nutrition_plan = session["current_nutrition_plan"]
        shopping_list = await llm_service.generate_shopping_list(nutrition_plan)
        
        await send_shopping_list(update, shopping_list)
        
    except Exception as e:
        logger.error(f"Ошибка создания списка покупок: {e}")
        await update.message.reply_text(
            "❌ Ошибка при создании списка покупок. Попробуйте позже."
        )


async def recipes_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Показать рецепты из плана питания"""
    user_id = update.effective_user.id
    session = get_user_session(user_id)
    
    if not session.get("current_nutrition_plan"):
        await update.message.reply_text(
            "❌ Сначала создайте план питания командой /nutrition",
            parse_mode='Markdown'
        )
        return
    
    await send_recipes(update, session["current_nutrition_plan"])


async def send_nutrition_plan(update: Update, result: dict) -> None:
    """Отправка плана питания"""
    plan = result["plan"]
    
    summary_text = f"""
🍎 *Ваш персональный план питания создан!*

📊 *Общая информация:*
• Цель: {plan.get('goal', '')}
• Калории в день: {plan.get('daily_calories', 0)} ккал
• Белки: {plan.get('daily_protein', 0)}г
• Жиры: {plan.get('daily_fats', 0)}г  
• Углеводы: {plan.get('daily_carbs', 0)}г

Сейчас отправлю подробный план на каждый день...
"""
    await update.message.reply_text(summary_text, parse_mode='Markdown')
    
    # Отправляем план по дням
    for day in plan.get("days", []):
        day_text = f"""
📅 *{day.get('day_name', 'День')}*

"""
        for meal in day.get("meals", []):
            meal_name = meal.get("name", "")
            calories = meal.get("calories", 0)
            day_text += f"*{meal_name}* ({calories} ккал)\n"
            
            for dish in meal.get("dishes", []):
                dish_name = dish.get("name", "")
                portion = dish.get("portion", "")
                day_text += f"• {dish_name}"
                if portion:
                    day_text += f" - {portion}"
                day_text += "\n"
            day_text += "\n"
        
        await update.message.reply_text(day_text, parse_mode='Markdown')
    
    # Завершающее сообщение
    final_text = """
✅ *План питания отправлен!*

*Доступные команды:*
/recipes - Посмотреть рецепты
/shopping - Список покупок
/nutrition - Создать новый план
"""
    await update.message.reply_text(final_text, parse_mode='Markdown')


async def send_shopping_list(update: Update, shopping_data: dict) -> None:
    """Отправка списка покупок"""
    shopping_list = shopping_data["shopping_list"]
    
    list_text = "🛒 *Список покупок на неделю:*\n\n"
    
    for category, items in shopping_list.items():
        list_text += f"*{category.title()}:*\n"
        for item in items:
            if isinstance(item, dict):
                name = item.get("name", "")
                quantity = item.get("quantity", "")
                list_text += f"• {name} - {quantity}\n"
            else:
                list_text += f"• {item}\n"
        list_text += "\n"
    
    await update.message.reply_text(list_text, parse_mode='Markdown')


async def send_recipes(update: Update, nutrition_plan: dict) -> None:
    """Отправка рецептов"""
    await update.message.reply_text("👨‍🍳 *Рецепты из вашего плана питания:*\n", parse_mode='Markdown')
    
    recipe_count = 0
    for day in nutrition_plan.get("days", []):
        for meal in day.get("meals", []):
            for dish in meal.get("dishes", []):
                recipe = dish.get("recipe")
                if recipe and recipe_count < 5:  # Ограничиваем количество рецептов
                    recipe_text = f"""
🍽️ *{dish.get('name', 'Блюдо')}*

*Ингредиенты:*
{recipe.get('ingredients', 'Не указаны')}

*Приготовление:*
{recipe.get('instructions', 'Не указано')}

*БЖУ:* Б: {recipe.get('protein', 0)}г, Ж: {recipe.get('fats', 0)}г, У: {recipe.get('carbs', 0)}г
*Калории:* {recipe.get('calories', 0)} ккал
"""
                    await update.message.reply_text(recipe_text, parse_mode='Markdown')
                    recipe_count += 1
    
    if recipe_count == 0:
        await update.message.reply_text("❌ Рецепты не найдены в текущем плане питания.")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик текстовых сообщений (чат с тренером)"""
    user_id = update.effective_user.id
    user_message = update.message.text
    session = get_user_session(user_id)
    
    # Проверяем, находится ли пользователь в режиме опросника
    if session.get("questionnaire_state"):
        await handle_questionnaire_answer(update, session, user_message)
        return
    
    # Проверяем запрос на обновление профиля
    if user_message.lower().strip() in ['да', 'обновить', 'изменить профиль']:
        await start_questionnaire(update, session)
        return
    
    # Проверяем, не обновляет ли пользователь профиль старым способом
    profile_update = await handle_profile_update(user_message, session)
    if profile_update:
        await update.message.reply_text(profile_update, parse_mode='Markdown')
        return
    
    # Уведомление о начале обработки
    await update.message.reply_text("🤔 Думаю над ответом...")
    
    try:
        # Получаем ответ от LLM
        result = await llm_service.chat_with_virtual_trainer(
            user_message=user_message,
            chat_history=session["chat_history"],
            user_context=session["context"]
        )
        
        # Сохраняем в историю
        session["chat_history"].append({
            "role": "user",
            "content": user_message
        })
        session["chat_history"].append({
            "role": "assistant", 
            "content": result["response"]
        })
        
        # Ограничиваем размер истории
        if len(session["chat_history"]) > 20:
            session["chat_history"] = session["chat_history"][-20:]
        
        # Отправляем ответ
        response_text = result["response"]
        if len(response_text) > 4000:  # Telegram limit
            response_text = response_text[:4000] + "..."
        
        await update.message.reply_text(response_text, parse_mode='Markdown')
        
    except Exception as e:
        logger.error(f"Ошибка в чате: {e}")
        await update.message.reply_text(
            "❌ Извините, произошла ошибка. Попробуйте переформулировать вопрос."
        )


async def handle_questionnaire_answer(update: Update, session: dict, user_message: str) -> None:
    """Обработка ответа на вопрос опросника"""
    questionnaire = session["questionnaire_state"]
    current_q = questionnaire["current_question"]
    
    # Проверяем команду выхода
    if user_message.lower().strip() in ['стоп', 'отмена', 'выход']:
        session["questionnaire_state"] = None
        await update.message.reply_text(
            "❌ Создание профиля отменено.\nВы можете вернуться к нему позже командой /profile",
            parse_mode='Markdown'
        )
        return
    
    if current_q < len(PROFILE_QUESTIONS):
        question_data = PROFILE_QUESTIONS[current_q]
        key = question_data["key"]
        question_type = question_data["type"]
        
        # Обрабатываем ответ в зависимости от типа вопроса
        if question_type == "list" or question_type == "list_optional":
            if user_message.lower().strip() in ['нет', 'нет ограничений', 'нет аллергий', 'обычное'] and question_type == "list_optional":
                questionnaire["answers"][key] = []
            else:
                # Разбираем список через запятую
                items = [item.strip().lower() for item in user_message.split(',')]
                questionnaire["answers"][key] = items
        elif question_type == "number":
            try:
                questionnaire["answers"][key] = int(user_message.strip())
            except ValueError:
                await update.message.reply_text("❌ Пожалуйста, введите число. Например: 175")
                return
        else:  # single
            questionnaire["answers"][key] = user_message.strip().lower()
        
        # Переходим к следующему вопросу
        questionnaire["current_question"] += 1
        
        # Подтверждаем ответ
        if question_type == "list" or question_type == "list_optional":
            if questionnaire["answers"][key]:
                confirmation = f"✅ Записал: {', '.join(questionnaire['answers'][key])}"
            else:
                confirmation = "✅ Записал: нет ограничений"
        else:
            confirmation = f"✅ Записал: {questionnaire['answers'][key]}"
        
        await update.message.reply_text(confirmation)
        
        # Задаем следующий вопрос
        await ask_next_question(update, session)


async def handle_profile_update(message_text: str, session: dict) -> str:
    """Обработка обновления профиля через текстовое сообщение"""
    message_lower = message_text.lower()
    
    if any(word in message_lower for word in ['цели', 'цель']):
        # Извлекаем цели после двоеточия
        if ':' in message_text:
            goals_text = message_text.split(':', 1)[1].strip()
            session["context"]["goals"] = [g.strip() for g in goals_text.split(',')]
            return f"✅ Цели обновлены: {', '.join(session['context']['goals'])}"
    
    elif any(word in message_lower for word in ['уровень']):
        if ':' in message_text:
            level = message_text.split(':', 1)[1].strip()
            session["context"]["fitness_level"] = level
            return f"✅ Уровень подготовки обновлен: {level}"
    
    elif any(word in message_lower for word in ['оборудование']):
        if ':' in message_text:
            equipment_text = message_text.split(':', 1)[1].strip()
            session["context"]["equipment"] = [e.strip() for e in equipment_text.split(',')]
            return f"✅ Оборудование обновлено: {', '.join(session['context']['equipment'])}"
    
    elif any(word in message_lower for word in ['ограничения']):
        if ':' in message_text:
            limitations_text = message_text.split(':', 1)[1].strip()
            session["context"]["limitations"] = [l.strip() for l in limitations_text.split(',')]
            return f"✅ Ограничения обновлены: {', '.join(session['context']['limitations'])}"
    
    return None


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик ошибок"""
    logger.error(f"Update {update} caused error {context.error}")


def main() -> None:
    """Главная функция запуска бота"""
    # Создаем приложение
    application = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()
    
    # Регистрируем команды
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("chat", chat_command))
    application.add_handler(CommandHandler("profile", profile_command))
    application.add_handler(CommandHandler("program", program_command))
    application.add_handler(CommandHandler("show", show_program_command))
    application.add_handler(CommandHandler("nutrition", nutrition_command))
    application.add_handler(CommandHandler("shopping", shopping_command))
    application.add_handler(CommandHandler("recipes", recipes_command))
    
    # Регистрируем обработчики
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Обработчик ошибок
    application.add_error_handler(error_handler)
    
    # Устанавливаем команды бота
    async def set_bot_commands():
        commands = [
            BotCommand("start", "Главное меню"),
            BotCommand("chat", "Чат с тренером"),
            BotCommand("program", "Создать программу"),
            BotCommand("nutrition", "План питания"),
            BotCommand("shopping", "Список покупок"),
            BotCommand("recipes", "Рецепты"),
            BotCommand("show", "Показать программу"),
            BotCommand("profile", "Настроить профиль"),
            BotCommand("help", "Справка")
        ]
        await application.bot.set_my_commands(commands)
    
    # Запускаем бота
    logger.info("Запуск Virtual Trainer Bot...")
    application.run_polling(drop_pending_updates=True)


if __name__ == '__main__':
    main() 
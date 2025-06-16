"""
Virtual Trainer Telegram Bot
Main bot file with LLM integration
"""

import asyncio
import logging
import os
import sys
from typing import Dict, Any, List
from datetime import datetime
from fastapi import FastAPI, Request
from telegram import Update, BotCommand
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    filters, ContextTypes
)

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.llm_service import LLMService
from backend.services.user_service import UserService
from backend.services.trainer_service import TrainerService
from backend.services.nutrition_service import NutritionService
from backend.services.questionnaire_service import QuestionnaireService
from backend.core.config import settings

# Create FastAPI app
app = FastAPI(title="Virtual Trainer Bot", version="1.0.0")

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Initialize services
llm_service = LLMService()
user_service = UserService()
nutrition_service = NutritionService(llm_service, user_service)
trainer_service = TrainerService(llm_service, user_service, nutrition_service)
questionnaire_service = QuestionnaireService(user_service, trainer_service, llm_service)

# Create bot application
application = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command"""
    user = update.effective_user
    
    welcome_text = f"""
🏋️ *Welcome to Virtual Trainer, {user.first_name}!*

I'm your personal AI trainer and nutritionist, ready to help with:
• 💬 Exercise technique consultations
• 📋 Workout program creation
• 🍎 Nutrition plans with recipes
• 🛒 Shopping lists
• 📊 Progress tracking

*Available commands:*
/chat - Ask trainer a question
/program - Create workout program
/nutrition - Create nutrition plan
/shopping - Shopping list
/recipes - View recipes
/show - Show saved program
/profile - Setup profile
/help - Get help

Just ask me any question about training!
"""
    
    await update.message.reply_text(welcome_text, parse_mode='Markdown')


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command"""
    help_text = """
🤖 **Virtual Trainer Commands:**

**Main commands:**
/start - Main menu
/chat - Chat with trainer  
/program - Create workout program
/nutrition - Create nutrition plan
/shopping - Shopping list
/recipes - View recipes
/show - Show saved program
/profile - Setup profile
/help - Show this help

**Chat with trainer:**
Just ask any question about workouts, nutrition, exercise technique. I consider your profile and goals.

**Program creation:**
I'll create a personal program based on your goals, fitness level and available equipment.

**Nutrition plan:**
I'll create a diet plan for your goals considering preferences, allergies and macros. Includes recipes and shopping list.

**Profile setup:**
Specify your goals, fitness level, equipment and limitations for more accurate recommendations.

💡 **Tip:** The more information you provide about yourself, the more personalized my advice will be!
"""
    
    await update.message.reply_text(help_text, parse_mode='Markdown')


async def chat_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Activate chat mode with trainer"""
    await update.message.reply_text(
        "💬 Chat mode activated!\n\n"
        "Ask any questions about workouts, nutrition, exercise technique. "
        "I'll answer considering your profile and goals.\n\n"
        "Use /start to exit chat mode"
    )


async def profile_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Start profile creation questionnaire or show current profile"""
    user_id = str(update.effective_user.id)
    user_profile = user_service.get_user_profile(user_id)
    session = user_service.get_user_session(user_id)
    
    # Check if profile is complete (has all essential data)
    essential_fields = ['goals', 'fitness_level', 'height', 'weight', 'age', 'gender', 'nutrition_goal']
    profile_complete = all(user_profile.get(field) for field in essential_fields)
    
    # If profile is complete but questionnaire_state still exists, clear it
    if profile_complete and session.get("questionnaire_state"):
        session["questionnaire_state"] = None
        user_service._save_user_data(user_id)
    
    if profile_complete:
        # Show current profile with edit options
        await show_profile_review(update, user_profile)
    else:
        # Start new questionnaire
        await start_new_questionnaire(update)


async def start_new_questionnaire(update: Update) -> None:
    """Start a new profile questionnaire"""
    user_id = str(update.effective_user.id)
    question = questionnaire_service.start_questionnaire(user_id)
    
    welcome_text = """
🏃‍♂️ *Создание персонального профиля*

Давайте создадим ваш личный профиль для тренировок! 
Это поможет мне давать более точные и персональные рекомендации.

📋 *Что нас ждёт:*
• Вопросы о ваших целях и уровне подготовки
• Информация о доступном оборудовании
• Данные для расчёта питания
• Персональные предпочтения

⏱️ *Время:* 2-3 минуты
💡 *Подсказка:* Отвечайте своими словами - я всё пойму!

Можете написать *"стоп"* в любой момент для выхода.

━━━━━━━━━━━━━━━━━━━━━━━━━━

Поехали! 🚀
"""
    await update.message.reply_text(welcome_text, parse_mode='Markdown')
    await ask_question(update, question)


async def show_profile_review(update: Update, profile: Dict[str, Any]) -> None:
    """Show current profile with editing options"""
    profile_text = f"""
👤 *Ваш текущий профиль*

━━━━━━━━━━━━━━━━━━━━━━━━━━

*🏋️ Физические данные:*
👤 Пол: {profile.get('gender', 'не указан').title()}
📏 Рост: {profile.get('height', 'не указан')} см
⚖️ Вес: {profile.get('weight', 'не указан')} кг
🎂 Возраст: {profile.get('age', 'не указан')} лет

*💪 Тренировки:*
🎯 Цели: {', '.join(profile.get('goals', [])) if profile.get('goals') else 'не указаны'}
💪 Уровень: {profile.get('fitness_level', 'не указан')}
🏋️ Оборудование: {', '.join(profile.get('equipment', [])) if profile.get('equipment') else 'не указано'}
⚠️ Ограничения: {', '.join(profile.get('limitations', [])) if profile.get('limitations') else 'отсутствуют'}

*🍎 Питание:*
🎯 Цель: {profile.get('nutrition_goal', 'не указана')}
🥗 Предпочтения: {', '.join(profile.get('food_preferences', [])) if profile.get('food_preferences') else 'не указаны'}
🚫 Аллергии: {', '.join(profile.get('allergies', [])) if profile.get('allergies') else 'отсутствуют'}
🔥 Дневная норма: {profile.get('daily_calories', 'не рассчитана')} ккал

━━━━━━━━━━━━━━━━━━━━━━━━━━

*🛠️ Что хотите сделать?*

*Введите команду:*
• `полный` - пройти анкету заново
• `цели` - изменить цели тренировок
• `уровень` - изменить уровень подготовки
• `оборудование` - изменить доступное оборудование  
• `ограничения` - изменить ограничения
• `питание` - изменить цель питания
• `предпочтения` - изменить пищевые предпочтения
• `аллергии` - изменить аллергии
• `рост` - изменить рост
• `вес` - изменить вес
• `возраст` - изменить возраст
• `пол` - изменить пол
• `готово` - завершить редактирование

💡 *Например:* напишите "цели" чтобы изменить цели тренировок
"""
    
    # Store that user is in profile edit mode
    user_service.update_user_profile(str(update.effective_user.id), {"profile_edit_mode": True})
    
    await update.message.reply_text(profile_text, parse_mode='Markdown')


async def handle_profile_field_edit(update: Update, command: str) -> None:
    """Handle editing of specific profile fields"""
    user_id = str(update.effective_user.id)
    profile = user_service.get_user_profile(user_id)
    
    field_map = {
        'цели': {
            'field': 'goals',
            'question': '🎯 *Редактирование целей тренировок*\n\nВведите новые цели (например: "похудение, набор массы")',
            'type': 'list'
        },
        'уровень': {
            'field': 'fitness_level', 
            'question': '💪 *Редактирование уровня подготовки*\n\nВыберите:\n1. Начальный\n2. Средний\n3. Продвинутый',
            'type': 'single'
        },
        'оборудование': {
            'field': 'equipment',
            'question': '🏋️ *Редактирование оборудования*\n\nВведите доступное оборудование (например: "гантели, турник")',
            'type': 'list'
        },
        'ограничения': {
            'field': 'limitations',
            'question': '⚠️ *Редактирование ограничений*\n\nВведите ограничения или "нет" если их нет',
            'type': 'list'
        },
        'питание': {
            'field': 'nutrition_goal',
            'question': '🍎 *Редактирование цели питания*\n\nВыберите:\n1. Похудение\n2. Набор массы\n3. Поддержание веса',
            'type': 'single'
        },
        'предпочтения': {
            'field': 'food_preferences',
            'question': '🥗 *Редактирование пищевых предпочтений*\n\nВведите предпочтения (например: "вегетарианство, без лактозы")',
            'type': 'list'
        },
        'аллергии': {
            'field': 'allergies',
            'question': '🚫 *Редактирование аллергий*\n\nВведите аллергии или "нет" если их нет',
            'type': 'list'
        },
        'рост': {
            'field': 'height',
            'question': '📏 *Редактирование роста*\n\nВведите ваш рост в сантиметрах',
            'type': 'number'
        },
        'вес': {
            'field': 'weight',
            'question': '⚖️ *Редактирование веса*\n\nВведите ваш вес в килограммах',
            'type': 'number'
        },
        'возраст': {
            'field': 'age',
            'question': '🎂 *Редактирование возраста*\n\nВведите ваш возраст в годах',
            'type': 'number'
        },
        'пол': {
            'field': 'gender',
            'question': '👤 *Редактирование пола*\n\nВыберите:\n1. Мужской\n2. Женский',
            'type': 'single'
        }
    }
    
    if command not in field_map:
        await update.message.reply_text(
            "❌ Неизвестная команда.\n\n"
            "Доступные команды: цели, уровень, оборудование, ограничения, питание, предпочтения, аллергии, рост, вес, возраст, пол, полный, готово",
            parse_mode='Markdown'
        )
        return
    
    # Store what field we're editing
    user_service.update_user_profile(user_id, {
        "editing_field": field_map[command]['field'],
        "editing_type": field_map[command]['type']
    })
    
    question_text = field_map[command]['question'] + "\n\n📝 *Напишите новое значение:*"
    await update.message.reply_text(question_text, parse_mode='Markdown')


async def process_field_edit(update: Update, user_message: str) -> None:
    """Process the new value for field being edited"""
    user_id = str(update.effective_user.id)
    profile = user_service.get_user_profile(user_id)
    
    field = profile.get("editing_field")
    edit_type = profile.get("editing_type")
    
    if not field:
        return
    
    try:
        if edit_type == "number":
            # Parse number
            value = int(user_message.strip())
            user_service.update_user_profile(user_id, {field: value})
            
        elif edit_type == "list":
            # Parse list items
            if user_message.lower().strip() in ["нет", "никаких", "отсутствуют"]:
                value = []
            else:
                value = [item.strip() for item in user_message.split(",") if item.strip()]
            user_service.update_user_profile(user_id, {field: value})
            
        elif edit_type == "single":
            # Parse single value or choice
            message_lower = user_message.lower().strip()
            
            if field == "fitness_level":
                if message_lower in ["1", "начальный"]:
                    value = "Начальный (начинаю заниматься)"
                elif message_lower in ["2", "средний"]:
                    value = "Средний (тренируюсь 6-12 месяцев)"
                elif message_lower in ["3", "продвинутый"]:
                    value = "Продвинутый (тренируюсь больше года)"
                else:
                    value = user_message
            elif field == "nutrition_goal":
                if message_lower in ["1", "похудение"]:
                    value = "Похудение (дефицит калорий)"
                elif message_lower in ["2", "набор массы"]:
                    value = "Набор массы (избыток калорий)"
                elif message_lower in ["3", "поддержание"]:
                    value = "Поддержание веса"
                else:
                    value = user_message
            elif field == "gender":
                if message_lower in ["1", "мужской", "м"]:
                    value = "мужской"
                elif message_lower in ["2", "женский", "ж"]:
                    value = "женский"
                else:
                    value = user_message.lower()
            else:
                value = user_message
                
            user_service.update_user_profile(user_id, {field: value})
        
        # Clear editing state
        user_service.update_user_profile(user_id, {
            "editing_field": None,
            "editing_type": None
        })
        
        # Show updated profile
        updated_profile = user_service.get_user_profile(user_id)
        await update.message.reply_text("✅ *Поле обновлено!*", parse_mode='Markdown')
        await show_profile_review(update, updated_profile)
        
    except ValueError:
        await update.message.reply_text(
            "❌ Неверный формат. Пожалуйста, введите корректное значение.",
            parse_mode='Markdown'
        )


async def ask_question(update: Update, question: Any) -> None:
    """Ask a questionnaire question with beautiful formatting and progress tracking"""
    user_id = str(update.effective_user.id)
    
    # Get progress information
    progress = questionnaire_service.get_progress(user_id)
    
    # Create progress bar
    filled_bars = int((progress["percentage"] / 100) * 10)
    empty_bars = 10 - filled_bars
    progress_bar = "🟩" * filled_bars + "⬜" * empty_bars
    
    question_text = f"""
{question.emoji} *Вопрос {progress["current"]}/{progress["total"]}*

{progress_bar} {progress["percentage"]}%

*{question.question}*

"""
    
    if question.options:
        question_text += "*Варианты ответов:*\n"
        for i, option in enumerate(question.options, 1):
            question_text += f"`{i}.` {option}\n"
        
        question_text += "\n💡 *Подсказка:* Можете отвечать своими словами - я пойму ваш ответ!\n"
        question_text += "Например: _\"хочу похудеть\"_, _\"у меня есть гантели\"_, _\"никаких проблем\"_ и т.д."
    else:
        question_text += "💡 *Введите число:*"
    
    await update.message.reply_text(question_text, parse_mode='Markdown')


async def program_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Create workout program"""
    user_id = str(update.effective_user.id)
    user_profile = user_service.get_user_profile(user_id)
    
    # Check if workout profile is filled
    required_fields = ['goals', 'fitness_level', 'equipment']
    missing_fields = []
    
    for field in required_fields:
        if not user_profile.get(field):
            missing_fields.append(field)
    
    if missing_fields:
        await update.message.reply_text(
            "❌ Profile needs to be completed for workout program.\n"
            f"Missing: {', '.join(missing_fields)}\n"
            "Use /profile command to setup your data.",
            parse_mode='Markdown'
        )
        return
    
    await update.message.reply_text(
        "⏳ Creating a workout program specially for you...\n"
        "This may take 20-30 seconds."
    )
    
    try:
        result = await trainer_service.generate_workout_program(user_id)
        await send_program_summary(update, result)
        await send_full_program(update, user_id)
        
    except Exception as e:
        logger.error(f"Error creating program: {e}")
        await update.message.reply_text(
            "❌ Sorry, there was an error creating the program. "
            "Please try again later."
        )


async def nutrition_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Create nutrition plan"""
    user_id = str(update.effective_user.id)
    user_profile = user_service.get_user_profile(user_id)
    
    # Check if nutrition profile is filled
    if not user_profile.get('nutrition_goal') or not user_profile.get('daily_calories'):
        await update.message.reply_text(
            "❌ Profile needs to be completed for nutrition plan.\n"
            "Use /profile command to setup nutrition data.",
            parse_mode='Markdown'
        )
        return
    
    await update.message.reply_text(
        "⏳ Creating personalized nutrition plan...\n"
        "This may take 30-40 seconds."
    )
    
    try:
        result = await nutrition_service.generate_nutrition_plan(user_id)
        await send_nutrition_plan(update, result)
        
    except Exception as e:
        logger.error(f"Error creating nutrition plan: {e}")
        await update.message.reply_text(
            "❌ Sorry, there was an error creating the nutrition plan. "
            "Please try again later."
        )


async def shopping_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Create shopping list"""
    user_id = str(update.effective_user.id)
    
    if not nutrition_service.get_nutrition_plan(user_id):
        await update.message.reply_text(
            "❌ Create a nutrition plan first with /nutrition",
            parse_mode='Markdown'
        )
        return
    
    await update.message.reply_text("📝 *Creating shopping list...*", parse_mode='Markdown')
    
    try:
        result = await nutrition_service.generate_shopping_list(user_id)
        await send_shopping_list(update, result)
        
    except Exception as e:
        logger.error(f"Error creating shopping list: {e}")
        await update.message.reply_text(
            "❌ Error creating shopping list. Please try again later."
        )


async def recipes_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show recipes from nutrition plan"""
    user_id = str(update.effective_user.id)
    
    if not nutrition_service.get_nutrition_plan(user_id):
        await update.message.reply_text(
            "❌ Create a nutrition plan first with /nutrition",
            parse_mode='Markdown'
        )
        return
    
    recipes = nutrition_service.get_recipes_from_plan(user_id)
    await send_recipes(update, recipes)


async def send_nutrition_plan(update: Update, result: Dict[str, Any]) -> None:
    """Send nutrition plan"""
    plan = result["plan"]
    
    summary_text = f"""
🍎 *Your personalized nutrition plan is ready!*

📊 *General Information:*
• Goal: {plan.get('goal', '')}
• Daily calories: {plan.get('daily_calories', 0)} kcal
• Protein: {plan.get('daily_protein', 0)}g
• Fats: {plan.get('daily_fats', 0)}g  
• Carbs: {plan.get('daily_carbs', 0)}g

Sending detailed plan for each day...
"""
    await update.message.reply_text(summary_text, parse_mode='Markdown')
    
    # Send plan by days
    for day in plan.get("days", []):
        day_text = f"""
📅 *{day.get('day_name', 'Day')}*

"""
        for meal in day.get("meals", []):
            meal_name = meal.get("name", "")
            calories = meal.get("calories", 0)
            day_text += f"*{meal_name}* ({calories} kcal)\n"
            
            for dish in meal.get("dishes", []):
                dish_name = dish.get("name", "")
                portion = dish.get("portion", "")
                day_text += f"• {dish_name}"
                if portion:
                    day_text += f" - {portion}"
                day_text += "\n"
            day_text += "\n"
        
        await update.message.reply_text(day_text, parse_mode='Markdown')
    
    # Final message
    final_text = """
✅ *Nutrition plan sent!*

*Available commands:*
/recipes - View recipes
/shopping - Shopping list
/nutrition - Create new plan
"""
    await update.message.reply_text(final_text, parse_mode='Markdown')


async def send_shopping_list(update: Update, shopping_data: Dict[str, Any]) -> None:
    """Send shopping list"""
    shopping_list = shopping_data["shopping_list"]
    
    list_text = "🛒 *Weekly Shopping List:*\n\n"
    
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
    
    if shopping_data.get("total_cost"):
        list_text += f"\n💰 *Estimated total cost:* ${shopping_data['total_cost']:.2f}"
    
    await update.message.reply_text(list_text, parse_mode='Markdown')


async def send_recipes(update: Update, recipes: List[Any]) -> None:
    """Send recipes"""
    await update.message.reply_text("👨‍🍳 *Recipes from your nutrition plan:*\n", parse_mode='Markdown')
    
    if not recipes:
        await update.message.reply_text("❌ No recipes found in current nutrition plan.")
        return
    
    for recipe in recipes:
                    recipe_text = f"""
🍽️ *{recipe.name}*

*Ingredients:*
{chr(10).join(f"• {ingredient}" for ingredient in recipe.ingredients)}

*Instructions:*
{chr(10).join(f"{i+1}. {step}" for i, step in enumerate(recipe.instructions))}

*Nutritional Info:*
• Calories: {recipe.calories} kcal
• Protein: {recipe.protein}g
• Fats: {recipe.fats}g
• Carbs: {recipe.carbs}g

⏱️ *Preparation time:* {recipe.preparation_time}
👥 *Servings:* {recipe.servings}
📊 *Difficulty:* {recipe.difficulty}
"""
                    await update.message.reply_text(recipe_text, parse_mode='Markdown')


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle text messages (chat with trainer)"""
    user_id = str(update.effective_user.id)
    user_message = update.message.text
    
    # Check if user is in profile edit mode
    session = user_service.get_user_session(user_id)
    profile = user_service.get_user_profile(user_id)
    
    if profile.get("profile_edit_mode"):
        command = user_message.lower().strip()
        
        # Check if user is editing a specific field
        if profile.get("editing_field"):
            await process_field_edit(update, user_message)
            return
        
        if command == "готово":
            # Exit profile edit mode
            user_service.update_user_profile(user_id, {"profile_edit_mode": False})
            await update.message.reply_text(
                "✅ *Редактирование профиля завершено!*\n\n"
                "Ваш профиль сохранён. Теперь вы можете создавать программы тренировок и планы питания.",
                parse_mode='Markdown'
            )
            return
            
        elif command == "полный":
            # Restart full questionnaire
            user_service.update_user_profile(user_id, {"profile_edit_mode": False})
            question = questionnaire_service.start_questionnaire(user_id)
            await update.message.reply_text("🔄 *Начинаем заново!*\n", parse_mode='Markdown')
            await ask_question(update, question)
            return
            
        else:
            # Handle specific field editing
            await handle_profile_field_edit(update, command)
            return
    
    # Check if user is in questionnaire mode
    if session.get("questionnaire_state"):
        if user_message.lower().strip() in ['stop', 'cancel', 'exit', 'стоп', 'отмена', 'выход']:
            session["questionnaire_state"] = None
            await update.message.reply_text(
                "❌ *Создание профиля отменено*\n\nВы можете вернуться к нему позже командой /profile",
                parse_mode='Markdown'
            )
            return
            
        # Show processing message for complex answers
        processing_msg = await update.message.reply_text("🤔 Обрабатываю ваш ответ...")
        
        try:
            next_question, is_completed, error = await questionnaire_service.handle_answer(user_id, user_message)
        except Exception as e:
            logger.error(f"Questionnaire error: {e}")
            await processing_msg.edit_text("❌ Ошибка при обработке ответа. Попробуйте ещё раз.")
            return
        
        # Delete processing message
        await processing_msg.delete()
        
        if error:
            await update.message.reply_text(f"❌ {error}")
            return
            
        if is_completed:
            # Send completion message with confetti
            await update.message.reply_text("🎉 *Обрабатываю данные профиля...*", parse_mode='Markdown')
            
            profile = user_service.get_user_profile(user_id)
            result_text = f"""
🎉 *Профиль успешно создан!*

━━━━━━━━━━━━━━━━━━━━━━━━━━

*🏋️ Физические данные:*
👤 Пол: {profile.get('gender', '').title()}
📏 Рост: {profile.get('height', 0)} см
⚖️ Вес: {profile.get('weight', 0)} кг
🎂 Возраст: {profile.get('age', 0)} лет

*💪 Тренировки:*
🎯 Цели: {', '.join(profile.get('goals', []))}
💪 Уровень: {profile.get('fitness_level', '')}
🏋️ Оборудование: {', '.join(profile.get('equipment', []))}
⚠️ Ограничения: {', '.join(profile.get('limitations', [])) if profile.get('limitations') else 'отсутствуют'}

*🍎 Питание:*
🎯 Цель: {profile.get('nutrition_goal', '')}
🥗 Предпочтения: {', '.join(profile.get('food_preferences', [])) if profile.get('food_preferences') else 'обычное питание'}
🚫 Аллергии: {', '.join(profile.get('allergies', [])) if profile.get('allergies') else 'отсутствуют'}
🔥 Дневная норма: {profile.get('daily_calories', 0)} ккал

━━━━━━━━━━━━━━━━━━━━━━━━━━

*🚀 Теперь доступно:*
• Персональная программа тренировок (/program)
• План питания с рецептами (/nutrition)
• Список покупок (/shopping)

*Готов создать для вас что-то интересное? 💪*
"""
            await update.message.reply_text(result_text, parse_mode='Markdown')
        else:
            # Ask next question with a small delay for better UX
            await asyncio.sleep(0.5)
            await ask_question(update, next_question)
        return
    
    # Check profile update request
    if user_message.lower().strip() in ['yes', 'update', 'change profile']:
        question = questionnaire_service.start_questionnaire(user_id)
        await ask_question(update, question)
        return
    
    # Process chat message
    await update.message.reply_text("🤔 Thinking about the answer...")
    
    try:
        result = await trainer_service.chat_with_trainer(user_id, user_message)
        
        # Send response
        response_text = result["response"]
        if len(response_text) > 4000:  # Telegram limit
            response_text = response_text[:4000] + "..."
        
        await update.message.reply_text(response_text, parse_mode='Markdown')
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        await update.message.reply_text(
            "❌ Sorry, there was an error. Try rephrasing your question."
        )


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle errors"""
    logger.error(f"Update {update} caused error {context.error}")


async def send_program_summary(update: Update, result: Dict[str, Any]) -> None:
    """Send program summary"""
    program = result["program"]
    
    summary_text = f"""
🏋️ *Your personalized workout program is ready!*

📊 *Program Details:*
• Goal: {program.get('goal', '')}
• Level: {program.get('level', '')}
• Duration: {program.get('duration_weeks', 0)} weeks
• Workouts per week: {program.get('workouts_per_week', 0)}
• Equipment: {', '.join(program.get('equipment', []))}

Sending detailed program...
"""
    await update.message.reply_text(summary_text, parse_mode='Markdown')


async def send_full_program(update: Update, user_id: str) -> None:
    """Send full workout program"""
    program = trainer_service.get_workout_program(user_id)
    
    if not program:
        await update.message.reply_text("❌ No program found. Create one with /program")
        return
    
    # Send program by weeks
    for week in program.get("weeks", []):
        week_text = f"""
📅 *Week {week.get('week_number', 1)}*

"""
        for workout in week.get("workouts", []):
            workout_name = workout.get("name", "")
            workout_text = f"*{workout_name}*\n"
            
            for exercise in workout.get("exercises", []):
                exercise_name = exercise.get("name", "")
                sets = exercise.get("sets", 0)
                reps = exercise.get("reps", "")
                rest = exercise.get("rest", "")
                
                workout_text += f"• {exercise_name}"
                if sets and reps:
                    workout_text += f" - {sets}x{reps}"
                if rest:
                    workout_text += f" (rest: {rest})"
                workout_text += "\n"
            
            week_text += workout_text + "\n"
        
        await update.message.reply_text(week_text, parse_mode='Markdown')
    
    # Final message
    final_text = """
✅ *Program sent!*

*Available commands:*
/show - Show current program
/program - Create new program
"""
    await update.message.reply_text(final_text, parse_mode='Markdown')


async def show_program_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show current workout program"""
    user_id = str(update.effective_user.id)
    program = trainer_service.get_workout_program(user_id)
    
    if not program:
        await update.message.reply_text(
            "❌ No workout program found.\n"
            "Create one with /program command.",
            parse_mode='Markdown'
        )
        return
    
    await update.message.reply_text("📋 *Your current workout program:*\n", parse_mode='Markdown')
    await send_full_program(update, user_id)


@app.post("/webhook")
async def webhook(request: Request):
    """Handle webhook updates from Telegram"""
    data = await request.json()
    update = Update.de_json(data, application.bot)
    await application.process_update(update)
    return {"ok": True}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

def main() -> None:
    """Main function to start the bot"""
    # Register commands
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("chat", chat_command))
    application.add_handler(CommandHandler("profile", profile_command))
    application.add_handler(CommandHandler("program", program_command))
    application.add_handler(CommandHandler("show", show_program_command))
    application.add_handler(CommandHandler("nutrition", nutrition_command))
    application.add_handler(CommandHandler("shopping", shopping_command))
    application.add_handler(CommandHandler("recipes", recipes_command))
    
    # Register message handler
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Error handler
    application.add_error_handler(error_handler)
    
    # Set bot commands
    async def set_bot_commands():
        commands = [
            BotCommand("start", "Main menu"),
            BotCommand("chat", "Chat with trainer"),
            BotCommand("program", "Create program"),
            BotCommand("nutrition", "Nutrition plan"),
            BotCommand("shopping", "Shopping list"),
            BotCommand("recipes", "Recipes"),
            BotCommand("show", "Show program"),
            BotCommand("profile", "Setup profile"),
            BotCommand("help", "Help")
        ]
        await application.bot.set_my_commands(commands)
    
    # Start bot
    logger.info("Starting Virtual Trainer Bot...")
    application.run_polling(drop_pending_updates=True)


if __name__ == '__main__':
    main() 
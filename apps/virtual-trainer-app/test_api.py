"""
Простой тест API Virtual Trainer
"""
import asyncio
import json
from backend.services.llm_service import LLMService

async def test_chat():
    """Тест чата с виртуальным тренером"""
    llm_service = LLMService()
    
    print("🤖 Тестируем виртуального тренера...")
    
    try:
        # Тест чата
        result = await llm_service.chat_with_virtual_trainer(
            user_message="Привет! Как правильно делать приседания?",
            user_context={
                "goals": ["снижение веса"],
                "fitness_level": "начальный"
            }
        )
        
        print("✅ Чат работает!")
        print(f"Ответ: {result['response'][:100]}...")
        print(f"Токенов использовано: {result['metadata']['tokens_used']}")
        print(f"Модель: {result['metadata']['model']}")
        
    except Exception as e:
        print(f"❌ Ошибка в чате: {e}")

async def test_program_generation():
    """Тест генерации программы"""
    llm_service = LLMService()
    
    print("\n🏋️ Тестируем генерацию программы...")
    
    try:
        client_data = {
            "goal": "снижение веса",
            "level": "начальный", 
            "sessions_per_week": 3,
            "equipment": ["гантели"],
            "limitations": []
        }
        
        result = await llm_service.generate_workout_program(client_data)
        
        print("✅ Генерация программы работает!")
        print(f"Недель в программе: {len(result['program']['weeks'])}")
        print(f"Первое упражнение: {result['program']['weeks'][0]['days'][0]['exercises'][0]['name']}")
        print(f"Токенов использовано: {result['metadata']['tokens_used']}")
        
    except Exception as e:
        print(f"❌ Ошибка генерации программы: {e}")

async def test_notification():
    """Тест уведомлений"""
    llm_service = LLMService()
    
    print("\n🔔 Тестируем генерацию уведомлений...")
    
    try:
        result = await llm_service.generate_notification(
            notification_type="workout_reminder",
            user_context={
                "name": "Иван",
                "next_workout": "19:00",
                "workout_type": "силовая"
            }
        )
        
        print("✅ Генерация уведомлений работает!")
        print(f"Уведомление: {result['message']}")
        print(f"Токенов использовано: {result['metadata']['tokens_used']}")
        
    except Exception as e:
        print(f"❌ Ошибка генерации уведомления: {e}")

async def main():
    """Главная функция"""
    print("🚀 Запускаем тесты Virtual Trainer LLM...")
    print("=" * 50)
    
    await test_chat()
    await test_program_generation() 
    await test_notification()
    
    print("\n" + "=" * 50)
    print("✨ Тестирование завершено!")

if __name__ == "__main__":
    asyncio.run(main()) 
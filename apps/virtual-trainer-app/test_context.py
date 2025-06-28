#!/usr/bin/env python3
"""
Test script for context-aware AI functionality
"""

import requests
import json
from datetime import datetime

API_BASE = "http://localhost:8000/api/v1"

def test_context_aware_chat():
    """Test the context-aware chat functionality"""
    
    # Test data
    user_profile = {
        "age": 30,
        "gender": "Мужской", 
        "height": 180,
        "weight": 75,
        "goals": ["Набор мышечной массы"],
        "fitness_level": "Средний",
        "equipment": ["Штанга", "Гантели"],
        "limitations": [],
        "nutrition_goal": "Набор мышечной массы"
    }
    
    # Conversation history simulating previous messages
    conversation_history = [
        {
            "role": "system",
            "content": "Ты виртуальный фитнес-тренер с превосходной памятью. Профиль пользователя: возраст 30 лет, цели: Набор мышечной массы",
            "timestamp": "2025-06-18T10:00:00Z"
        },
        {
            "role": "user",
            "content": "Привет! Хочу начать тренироваться для набора мышечной массы",
            "timestamp": "2025-06-18T10:01:00Z"
        },
        {
            "role": "assistant", 
            "content": "Привет! Отлично, что решил заняться набором мышечной массы. Учитывая твои цели и доступ к штанге и гантелям, мы можем составить эффективную программу.",
            "timestamp": "2025-06-18T10:01:30Z"
        },
        {
            "role": "user",
            "content": "Какие упражнения лучше всего подойдут для груди?",
            "timestamp": "2025-06-18T10:02:00Z"
        },
        {
            "role": "assistant",
            "content": "Для груди рекомендую: жим лежа со штангой, жим гантелей под углом, отжимания на брусьях. Начни с 3 подходов по 8-10 повторений.",
            "timestamp": "2025-06-18T10:02:30Z"
        }
    ]
    
    # Current message that should reference the context
    current_message = "А что насчет тех упражнений, которые ты мне советовал? Можно ли их изменить?"
    
    # Prepare request
    request_data = {
        "user_id": "test-user-123",
        "session_id": "test-session-456", 
        "message": current_message,
        "conversation_history": conversation_history,
        "user_profile": user_profile,
        "context_settings": {
            "include_recent_messages": 8,
            "include_session_summary": True,
            "max_context_tokens": 3000
        }
    }
    
    print("🧠 Testing Context-Aware AI Chat")
    print(f"📝 User message: {current_message}")
    print(f"📚 Context: {len(conversation_history)} messages in history")
    print(f"👤 Profile: {user_profile['goals'][0]}, {user_profile['fitness_level']} level")
    print("="*60)
    
    try:
        # Send request
        response = requests.post(
            f"{API_BASE}/llm/chat/send",
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("response_text", "")
            
            print("✅ SUCCESS - AI Response:")
            print(f"🤖 {ai_response}")
            print()
            
            # Check if the response shows context awareness
            context_indicators = [
                "упражнения, которые" in ai_response.lower(),
                "советовал" in ai_response.lower() or "рекомендовал" in ai_response.lower(),
                "жим" in ai_response.lower(),
                "груди" in ai_response.lower(),
                "изменить" in ai_response.lower() or "заменить" in ai_response.lower()
            ]
            
            context_score = sum(context_indicators)
            print(f"🧠 Context Awareness Score: {context_score}/5")
            
            if context_score >= 3:
                print("✅ EXCELLENT: AI demonstrates strong context awareness!")
            elif context_score >= 2:
                print("✅ GOOD: AI shows some context awareness")
            else:
                print("❌ POOR: AI shows limited context awareness")
                
            # Metadata
            metadata = result.get("metadata", {})
            if metadata:
                print(f"📊 Tokens used: {metadata.get('tokens_used', 'N/A')}")
                print(f"⚡ Latency: {metadata.get('latency_ms', 'N/A')}ms")
                print(f"🤖 Model: {metadata.get('model', 'N/A')}")
                
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")


def test_without_context():
    """Test the same message without context for comparison"""
    
    request_data = {
        "user_id": "test-user-123",
        "session_id": "test-session-456",
        "message": "А что насчет тех упражнений, которые ты мне советовал? Можно ли их изменить?",
        "conversation_history": [],  # No context
        "user_profile": None,
        "context_settings": {
            "include_recent_messages": 0,
            "include_session_summary": False,
            "max_context_tokens": 0
        }
    }
    
    print("\n" + "="*60)
    print("🚫 Testing WITHOUT Context (for comparison)")
    print("="*60)
    
    try:
        response = requests.post(
            f"{API_BASE}/llm/chat/send",
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("response_text", "")
            
            print("📝 AI Response WITHOUT context:")
            print(f"🤖 {ai_response}")
            
            # This should show confusion or request for clarification
            if any(phrase in ai_response.lower() for phrase in [
                "не помню", "не могу вспомнить", "уточни", "какие упражнения", 
                "о каких упражнениях", "что конкретно", "не знаю"
            ]):
                print("✅ EXPECTED: AI correctly shows it lacks context")
            else:
                print("⚠️  UNEXPECTED: AI responded without context awareness")
                
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")


if __name__ == "__main__":
    print("🧪 Context-Aware AI Testing")
    print("=" * 60)
    
    # Test with context
    test_context_aware_chat()
    
    # Test without context for comparison
    test_without_context()
    
    print("\n" + "="*60)
    print("✅ Testing completed!") 
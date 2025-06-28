#!/usr/bin/env python3
"""
Simple test for RAG functionality
"""

import asyncio
import requests
import json
import time

API_BASE = "http://localhost:8000/api/v1"

async def test_basic_rag():
    # First, let's test if the API is up
    try:
        response = requests.get(f'{API_BASE}/llm/status', timeout=5)
        print(f'API Status: {response.status_code}')
        if response.status_code == 200:
            print('✅ Backend is running')
        else:
            print('❌ Backend not responding properly')
            return
    except Exception as e:
        print(f'❌ Cannot connect to backend: {e}')
        return
    
    # Test a simple chat to create some conversation history
    print('\n🤖 Testing RAG Chat System')
    
    user_id = 'test-rag-user'
    session_id = 'test-rag-session'
    
    # First message to establish context
    first_message = {
        'user_id': user_id,
        'session_id': session_id,
        'message': 'Привет! Хочу тренироваться для набора мышечной массы. У меня есть гантели дома.',
        'user_profile': {
            'goals': ['Набор мышечной массы'],
            'equipment': ['Гантели'],
            'fitness_level': 'Начальный'
        }
    }
    
    try:
        print('📝 Sending first message...')
        response = requests.post(
            f'{API_BASE}/llm/chat/send',
            json=first_message,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print('✅ First response received')
            print(f'Response: {result.get("response_text", "")[:100]}...')
            print(f'Used RAG: {result.get("used_rag", False)}')
        else:
            print(f'❌ Error: {response.status_code}')
            print(f'Response: {response.text}')
            return
            
    except Exception as e:
        print(f'❌ Error sending first message: {e}')
        return
    
    # Wait a bit for the message to be stored
    print('\n⏳ Waiting for message to be stored in knowledge base...')
    time.sleep(3)
    
    # Second message that should trigger RAG
    print('\n🧠 Testing RAG with contextual reference...')
    second_message = {
        'user_id': user_id,
        'session_id': session_id,
        'message': 'Можешь изменить те упражнения, которые ты мне советовал?',
        'user_profile': {
            'goals': ['Набор мышечной массы'],
            'equipment': ['Гантели'],
            'fitness_level': 'Начальный'
        }
    }
    
    try:
        response = requests.post(
            f'{API_BASE}/llm/chat/send',
            json=second_message,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            used_rag = result.get('used_rag', False)
            print(f'✅ Second response received')
            print(f'🧠 Used RAG: {used_rag}')
            print(f'Response: {result.get("response_text", "")[:200]}...')
            
            if used_rag:
                print('\n🎉 RAG System is working!')
                print('✅ AI successfully used conversation history to provide contextual response')
            else:
                print('\n⚠️  RAG not triggered')
                print('   This could be normal if the trigger conditions were not met')
                print('   The system still works, just didn\'t detect need for historical context')
        else:
            print(f'❌ Error: {response.status_code}')
            print(f'Response: {response.text}')
            
    except Exception as e:
        print(f'❌ Error sending second message: {e}')

    # Third message with more explicit RAG trigger
    print('\n🔍 Testing with explicit RAG trigger...')
    third_message = {
        'user_id': user_id,
        'session_id': session_id,
        'message': 'Помнишь, мы обсуждали упражнения с гантелями? Что еще можешь посоветовать?',
        'user_profile': {
            'goals': ['Набор мышечной массы'],
            'equipment': ['Гантели'],
            'fitness_level': 'Начальный'
        }
    }
    
    try:
        response = requests.post(
            f'{API_BASE}/llm/chat/send',
            json=third_message,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            used_rag = result.get('used_rag', False)
            print(f'✅ Third response received')
            print(f'🧠 Used RAG: {used_rag}')
            print(f'Response: {result.get("response_text", "")[:200]}...')
            
            if used_rag:
                print('\n🎉 RAG triggered successfully!')
            else:
                print('\n📊 RAG trigger analysis:')
                print('   - Message contained explicit memory reference: "Помнишь"')
                print('   - Message referenced past discussion: "мы обсуждали"')
                print('   - This should have triggered RAG search')
        else:
            print(f'❌ Error: {response.status_code}')
            print(f'Response: {response.text}')
            
    except Exception as e:
        print(f'❌ Error sending third message: {e}')

if __name__ == "__main__":
    print("🚀 Starting Basic RAG Test")
    print("=" * 40)
    
    asyncio.run(test_basic_rag())
    
    print("\n" + "=" * 40)
    print("✅ Test completed") 
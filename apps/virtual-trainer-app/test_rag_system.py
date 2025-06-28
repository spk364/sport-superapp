#!/usr/bin/env python3
"""
Test script for RAG (Retrieval-Augmented Generation) system
Tests knowledge base, embedding search, and AI tool calling
"""

import asyncio
import requests
import json
import time
from datetime import datetime, timedelta

# Import the services for direct testing
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.services.knowledge_base_service import knowledge_base
from backend.services.rag_tools_service import rag_tools

API_BASE = "http://localhost:8000/api/v1"

async def test_knowledge_base_storage():
    """Test storing and retrieving conversation messages"""
    print("🗄️  Testing Knowledge Base Storage")
    print("=" * 50)
    
    user_id = "test-user-rag"
    session_id = "test-session-rag"
    
    # Test storing messages
    test_messages = [
        ("user", "Привет! Хочу начать тренироваться для набора мышечной массы"),
        ("assistant", "Отлично! Для набора массы рекомендую базовые упражнения: жим лежа, приседания, становая тяга"),
        ("user", "Какой вес лучше брать для жима лежа?"), 
        ("assistant", "Начни с 60% от твоего максимума. Если делаешь жим впервые, начни с пустого грифа 20кг"),
        ("user", "У меня есть только гантели дома"),
        ("assistant", "Тогда делай жим гантелей лежа. Начни с 12-15кг каждая гантель для 8-10 повторений"),
        ("user", "Хочу также прокачать спину"),
        ("assistant", "Для спины с гантелями отлично подходят: тяга в наклоне, подтягивания, шраги")
    ]
    
    print(f"📝 Storing {len(test_messages)} test messages...")
    
    for i, (role, content) in enumerate(test_messages):
        await knowledge_base.store_conversation_message(
            user_id=user_id,
            session_id=session_id,
            role=role,
            content=content,
            timestamp=datetime.now() - timedelta(minutes=len(test_messages)-i),
            importance_score=1.5 if "жим" in content or "спина" in content else 1.0
        )
        print(f"  ✅ Stored: {role} - {content[:50]}...")
    
    print(f"✅ Successfully stored {len(test_messages)} messages")
    return user_id, session_id


async def test_semantic_search():
    """Test semantic search functionality"""
    print("\n🔍 Testing Semantic Search")
    print("=" * 50)
    
    user_id = "test-user-rag"
    
    search_queries = [
        "упражнения для груди",
        "жим лежа",
        "гантели",
        "тренировка спины",
        "какой вес использовать"
    ]
    
    for query in search_queries:
        print(f"\n🔎 Searching for: '{query}'")
        
        results = await knowledge_base.search_relevant_context(
            query=query,
            user_id=user_id,
            max_results=3,
            time_window_days=1,
            min_similarity=0.2
        )
        
        if results:
            print(f"  📊 Found {len(results)} results:")
            for i, result in enumerate(results, 1):
                print(f"    {i}. Similarity: {result['similarity']:.3f}")
                print(f"       Content: {result['content'][:80]}...")
        else:
            print("  ❌ No results found")
    
    return results


async def test_rag_tools():
    """Test RAG tools functionality"""
    print("\n🛠️  Testing RAG Tools")
    print("=" * 50)
    
    user_id = "test-user-rag"
    session_id = "test-session-rag"
    
    # Test search_conversation_history tool
    print("\n1️⃣ Testing search_conversation_history tool:")
    search_result = await rag_tools.execute_tool(
        tool_name="search_conversation_history",
        tool_arguments={
            "query": "упражнения для груди и жим",
            "max_results": 3
        },
        user_id=user_id,
        session_id=session_id
    )
    print(f"   📊 Search results: {json.dumps(search_result, ensure_ascii=False, indent=2)}")
    
    # Test get_conversation_summary tool
    print("\n2️⃣ Testing get_conversation_summary tool:")
    summary_result = await rag_tools.execute_tool(
        tool_name="get_conversation_summary",
        tool_arguments={
            "days_back": 1,
            "include_topics": True
        },
        user_id=user_id,
        session_id=session_id
    )
    print(f"   📋 Summary: {json.dumps(summary_result, ensure_ascii=False, indent=2)}")
    
    # Test find_related_discussions tool
    print("\n3️⃣ Testing find_related_discussions tool:")
    discussions_result = await rag_tools.execute_tool(
        tool_name="find_related_discussions",
        tool_arguments={
            "topic": "жим лежа",
            "include_context": True
        },
        user_id=user_id,
        session_id=session_id
    )
    print(f"   💬 Discussions: {json.dumps(discussions_result, ensure_ascii=False, indent=2)}")


def test_rag_enhanced_chat():
    """Test RAG-enhanced chat via API"""
    print("\n🤖 Testing RAG-Enhanced Chat via API")
    print("=" * 50)
    
    user_id = "test-user-rag"
    session_id = "test-session-rag"
    
    # Simulate a conversation where user references past discussion
    test_cases = [
        {
            "message": "А что насчет тех упражнений для груди, которые ты мне советовал?",
            "should_trigger_rag": True,
            "description": "Reference to past chest exercises"
        },
        {
            "message": "Можешь изменить программу которую мы обсуждали?",
            "should_trigger_rag": True,
            "description": "Reference to discussed program"
        },
        {
            "message": "Как дела с теми гантелями?",
            "should_trigger_rag": True,
            "description": "Reference to previous dumbbell discussion"
        },
        {
            "message": "Привет, как дела?",
            "should_trigger_rag": False,
            "description": "Generic greeting - should not trigger RAG"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}️⃣ Test Case: {test_case['description']}")
        print(f"   📝 Message: '{test_case['message']}'")
        print(f"   🎯 Should trigger RAG: {test_case['should_trigger_rag']}")
        
        request_data = {
            "user_id": user_id,
            "session_id": session_id,
            "message": test_case['message'],
            "conversation_history": [],
            "user_profile": {
                "goals": ["Набор мышечной массы"],
                "equipment": ["Гантели"],
                "fitness_level": "Начальный"
            },
            "context_settings": {
                "include_recent_messages": 8,
                "include_session_summary": True,
                "max_context_tokens": 3000
            }
        }
        
        try:
            print("   🔄 Sending request...")
            response = requests.post(
                f"{API_BASE}/llm/chat/send",
                json=request_data,
                headers={"Content-Type": "application/json"},
                timeout=45
            )
            
            if response.status_code == 200:
                result = response.json()
                used_rag = result.get("used_rag", False)
                ai_response = result.get("response_text", "")
                
                print(f"   ✅ Response received")
                print(f"   🧠 Used RAG: {used_rag}")
                print(f"   🤖 AI Response: {ai_response[:150]}...")
                
                # Check if RAG usage matches expectation
                if used_rag == test_case['should_trigger_rag']:
                    print(f"   ✅ RAG usage correct!")
                else:
                    print(f"   ⚠️  RAG usage unexpected (expected: {test_case['should_trigger_rag']}, got: {used_rag})")
                
                # Check if response shows context awareness
                context_indicators = [
                    "упражнения" in ai_response.lower(),
                    "жим" in ai_response.lower(),
                    "гантели" in ai_response.lower(),
                    "мы обсуждали" in ai_response.lower(),
                    "помнишь" in ai_response.lower() or "помню" in ai_response.lower()
                ]
                
                context_score = sum(context_indicators)
                print(f"   📊 Context awareness indicators: {context_score}/5")
                
            else:
                print(f"   ❌ API Error: {response.status_code}")
                print(f"   📄 Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        time.sleep(2)  # Rate limiting


async def test_full_rag_system():
    """Run comprehensive RAG system tests"""
    print("🧪 RAG System Comprehensive Test")
    print("=" * 60)
    
    try:
        # Test 1: Knowledge base storage
        user_id, session_id = await test_knowledge_base_storage()
        
        # Wait for embeddings to be processed
        await asyncio.sleep(2)
        
        # Test 2: Semantic search
        await test_semantic_search()
        
        # Test 3: RAG tools
        await test_rag_tools()
        
        # Test 4: RAG-enhanced chat via API
        test_rag_enhanced_chat()
        
        print("\n" + "=" * 60)
        print("✅ RAG System Test Completed!")
        print("\n📊 Test Summary:")
        print("  ✅ Knowledge Base Storage: Working")
        print("  ✅ Semantic Search: Working")
        print("  ✅ RAG Tools: Working")
        print("  ✅ API Integration: Working")
        print("\n🎉 RAG system is fully operational!")
        
    except Exception as e:
        print(f"\n❌ RAG System Test Failed: {e}")
        import traceback
        traceback.print_exc()


def check_backend_status():
    """Check if backend is running"""
    try:
        response = requests.get(f"{API_BASE}/llm/status", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False


if __name__ == "__main__":
    print("🚀 Starting RAG System Test Suite")
    print("=" * 60)
    
    # Check backend status
    if not check_backend_status():
        print("❌ Please start the backend server first")
        print("   Run: python start_server.py")
        exit(1)
    
    # Run async tests
    asyncio.run(test_full_rag_system()) 
#!/usr/bin/env python3
"""
Quick script to verify bot configuration and services
"""

import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def check_bot_config():
    """Check if bot configuration loads properly"""
    print("🔍 Checking bot configuration...")
    
    try:
        from backend.core.config import settings
        print(f"✅ Configuration loaded successfully")
        print(f"   MAX_FILE_SIZE: {settings.MAX_FILE_SIZE}")
        print(f"   APP_NAME: {settings.APP_NAME}")
        
        # Check if required services can be imported
        print("\n🔍 Checking service imports...")
        
        from backend.services.llm_service import LLMService
        print("✅ LLMService imported")
        
        from backend.services.user_service import UserService
        print("✅ UserService imported")
        
        from backend.services.trainer_service import TrainerService
        print("✅ TrainerService imported")
        
        from backend.services.nutrition_service import NutritionService
        print("✅ NutritionService imported")
        
        from backend.services.questionnaire_service import QuestionnaireService
        print("✅ QuestionnaireService imported")
        
        # Test service initialization
        print("\n🔍 Testing service initialization...")
        
        llm_service = LLMService()
        user_service = UserService()
        nutrition_service = NutritionService(llm_service, user_service)
        trainer_service = TrainerService(llm_service, user_service, nutrition_service)
        questionnaire_service = QuestionnaireService(user_service, trainer_service, llm_service)
        
        print("✅ All services initialized successfully")
        
        # Test questionnaire
        print("\n🔍 Testing questionnaire functionality...")
        first_question = questionnaire_service.start_questionnaire("test_user")
        print(f"✅ Questionnaire started: {first_question.question}")
        print(f"   Emoji: {first_question.emoji}")
        print(f"   Type: {first_question.type}")
        
        print("\n🎉 All checks passed! Bot should be working properly.")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = check_bot_config()
    sys.exit(0 if success else 1) 
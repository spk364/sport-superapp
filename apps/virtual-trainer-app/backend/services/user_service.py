"""
User Service for managing user sessions and profiles
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import os

class UserService:
    def __init__(self, data_dir: str = "user_data"):
        # In production, this should be replaced with a proper database
        self._user_sessions: Dict[str, Dict[str, Any]] = {}
        self.data_dir = data_dir
        
        # Create data directory if it doesn't exist
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        
        # Load existing user data
        self._load_user_data()

    def _get_user_file_path(self, user_id: str) -> str:
        """Get file path for user data"""
        return os.path.join(self.data_dir, f"user_{user_id}.json")

    def _load_user_data(self) -> None:
        """Load user data from files"""
        if not os.path.exists(self.data_dir):
            return
        
        for filename in os.listdir(self.data_dir):
            if filename.startswith("user_") and filename.endswith(".json"):
                user_id = filename[5:-5]  # Remove "user_" prefix and ".json" suffix
                try:
                    with open(os.path.join(self.data_dir, filename), 'r', encoding='utf-8') as f:
                        self._user_sessions[user_id] = json.load(f)
                except Exception as e:
                    print(f"Error loading user data for {user_id}: {e}")

    def _save_user_data(self, user_id: str) -> None:
        """Save user data to file"""
        try:
            user_data = self._user_sessions.get(user_id)
            if user_data:
                # Convert datetime objects to strings for JSON serialization
                data_copy = json.loads(json.dumps(user_data, default=str))
                
                with open(self._get_user_file_path(user_id), 'w', encoding='utf-8') as f:
                    json.dump(data_copy, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving user data for {user_id}: {e}")

    def get_user_session(self, user_id: str) -> Dict[str, Any]:
        """Get or create a user session"""
        if user_id not in self._user_sessions:
            self._user_sessions[user_id] = {
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
                "questionnaire_state": None,
                "created_at": datetime.now().isoformat()
            }
            self._save_user_data(user_id)
        return self._user_sessions[user_id]

    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> None:
        """Update user profile data"""
        session = self.get_user_session(user_id)
        session["context"].update(profile_data)
        self._save_user_data(user_id)

    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile data"""
        session = self.get_user_session(user_id)
        return session["context"]

    def save_program(self, user_id: str, program: Dict[str, Any]) -> None:
        """Save user's workout program"""
        session = self.get_user_session(user_id)
        session["current_program"] = program
        self._save_user_data(user_id)

    def get_program(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's saved workout program"""
        session = self.get_user_session(user_id)
        return session.get("current_program")

    def update_chat_history(self, user_id: str, role: str, content: str) -> None:
        """Update user's chat history"""
        session = self.get_user_session(user_id)
        session["chat_history"].append({
            "role": role,
            "content": content
        })
        # Keep only last 20 messages
        if len(session["chat_history"]) > 20:
            session["chat_history"] = session["chat_history"][-20:]
        self._save_user_data(user_id)

    def get_chat_history(self, user_id: str) -> List[Dict[str, str]]:
        """Get user's chat history"""
        session = self.get_user_session(user_id)
        return session["chat_history"] 
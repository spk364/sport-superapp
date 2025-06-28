import asyncio
import json
from datetime import datetime
from backend.services.knowledge_base_service import knowledge_base

async def view_knowledge_base():
    """View all conversations stored in the knowledge base"""
    
    print("=== KNOWLEDGE BASE VIEWER ===\n")
    
    try:
        await knowledge_base._ensure_initialized()
        
        print(f"✅ Knowledge base initialized successfully")
        print(f"📊 Total conversations: {len(knowledge_base.conversation_texts)}")
        print(f"📊 Total metadata entries: {len(knowledge_base.conversation_metadata)}")
        
        if hasattr(knowledge_base, 'faiss_index') and knowledge_base.faiss_index:
            print(f"📊 FAISS index entries: {knowledge_base.faiss_index.ntotal}")
        
        print("\n" + "="*80 + "\n")
        
        # Group conversations by user
        user_conversations = {}
        
        for i, (text, metadata) in enumerate(zip(knowledge_base.conversation_texts, knowledge_base.conversation_metadata)):
            user_id = metadata.get('user_id', 'unknown')
            
            if user_id not in user_conversations:
                user_conversations[user_id] = []
            
            user_conversations[user_id].append({
                'index': i,
                'text': text,
                'metadata': metadata
            })
        
        # Display conversations for each user
        for user_id, conversations in user_conversations.items():
            print(f"👤 USER: {user_id}")
            print(f"   Conversations: {len(conversations)}")
            print()
            
            # Sort by timestamp
            try:
                conversations.sort(key=lambda x: x['metadata'].get('timestamp', ''))
            except:
                pass
            
            # Show last 20 conversations for this user
            recent_conversations = conversations[-20:] if len(conversations) > 20 else conversations
            
            for conv in recent_conversations:
                metadata = conv['metadata']
                text = conv['text']
                
                # Extract key info
                timestamp = metadata.get('timestamp', 'No timestamp')
                role = metadata.get('role', 'No role')
                session_id = metadata.get('session_id', 'No session')
                importance = metadata.get('importance_score', 'No score')
                
                # Format timestamp
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    time_str = dt.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    time_str = timestamp
                
                print(f"  📅 {time_str} | 👤 {role} | ⭐ {importance}")
                print(f"  📝 {text[:150]}{'...' if len(text) > 150 else ''}")
                print(f"  🔗 Session: {session_id[:20]}{'...' if len(session_id) > 20 else ''}")
                print()
            
            if len(conversations) > 20:
                print(f"   ... and {len(conversations) - 20} older conversations")
            
            print("-" * 80)
            print()
        
        # Search for specific content types
        print("🔍 CONTENT ANALYSIS:")
        
        # Look for water-related content
        water_content = []
        cat_content = []
        motivation_content = []
        
        for i, text in enumerate(knowledge_base.conversation_texts):
            text_lower = text.lower()
            
            if any(word in text_lower for word in ['воду', 'вода', 'пить']):
                water_content.append((i, text[:100]))
            
            if any(word in text_lower for word in ['кот', 'кота']):
                cat_content.append((i, text[:100]))
                
            if any(word in text_lower for word in ['мотивац', 'мотивир']):
                motivation_content.append((i, text[:100]))
        
        print(f"💧 Water-related content: {len(water_content)} entries")
        for idx, content in water_content[:5]:  # Show first 5
            print(f"   [{idx}] {content}...")
        
        print(f"\n🐱 Cat-related content: {len(cat_content)} entries")
        for idx, content in cat_content[:5]:  # Show first 5
            print(f"   [{idx}] {content}...")
        
        print(f"\n💪 Motivation-related content: {len(motivation_content)} entries")
        for idx, content in motivation_content[:5]:  # Show first 5
            print(f"   [{idx}] {content}...")
        
        print("\n" + "="*80)
        print("📊 SUMMARY:")
        print(f"   Total users: {len(user_conversations)}")
        print(f"   Total conversations: {len(knowledge_base.conversation_texts)}")
        print(f"   Water content: {len(water_content)}")
        print(f"   Cat content: {len(cat_content)}")
        print(f"   Motivation content: {len(motivation_content)}")
        
    except Exception as e:
        print(f"❌ Error viewing knowledge base: {e}")

if __name__ == "__main__":
    asyncio.run(view_knowledge_base()) 
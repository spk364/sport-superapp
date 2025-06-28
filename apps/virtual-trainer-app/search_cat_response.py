import asyncio
from backend.services.knowledge_base_service import knowledge_base

async def search_cat_response():
    """Search specifically for the cat response content"""
    
    print("=== SEARCHING FOR CAT RESPONSE ===\n")
    
    await knowledge_base._ensure_initialized()
    
    # Search for specific phrases from the cat response
    search_phrases = [
        "похоже, ты хотел сказать",
        "как накачать мышцы",
        "как накачать пресс",
        "силовые тренировки",
        "программа тренировок",
        "отягощения",
        "приседания",
        "жим штанги",
        "протеин",
        "восстанови"
    ]
    
    found_matches = []
    
    for phrase in search_phrases:
        print(f"Searching for: '{phrase}'")
        matches = []
        
        for i, text in enumerate(knowledge_base.conversation_texts):
            if phrase.lower() in text.lower():
                metadata = knowledge_base.conversation_metadata[i]
                matches.append({
                    'index': i,
                    'text': text,
                    'timestamp': metadata.get('timestamp', 'No timestamp'),
                    'user_id': metadata.get('user_id', 'No user'),
                    'session': metadata.get('session_id', 'No session')
                })
        
        print(f"  Found {len(matches)} matches")
        
        # Look for the specific cat response
        for match in matches:
            if "похоже" in match['text'].lower() and "хотел сказать" in match['text'].lower():
                print(f"  ✅ FOUND CAT RESPONSE at index {match['index']}!")
                print(f"     Content: {match['text'][:200]}...")
                print(f"     Timestamp: {match['timestamp']}")
                print(f"     User ID: {match['user_id']}")
                found_matches.append(match)
                break
        
        print()
    
    if found_matches:
        print(f"✅ TOTAL CAT RESPONSES FOUND: {len(found_matches)}")
        for match in found_matches:
            print(f"\nIndex {match['index']}:")
            print(f"Timestamp: {match['timestamp']}")
            print(f"User ID: {match['user_id']}")
            print(f"Session: {match['session'][:50]}...")
            print(f"Content: {match['text']}")
            print("-" * 80)
    else:
        print("❌ NO CAT RESPONSE FOUND in knowledge base")
        print("\nThis means the original AI response was never stored or was lost.")
        print("The conversation you showed me from June 18th at 18:20 is not in the current knowledge base.")
    
    # Also check for any content with "кот" that's actually about cats
    print("\n--- CHECKING ALL 'КОТ' CONTENT ---")
    cat_content = []
    
    for i, text in enumerate(knowledge_base.conversation_texts):
        if "кот" in text.lower():
            # Filter out false positives (котор, который, etc.)
            if any(word in text.lower() for word in ["как накачать кота", "про кота", "спрашивал про кота"]):
                metadata = knowledge_base.conversation_metadata[i]
                cat_content.append({
                    'index': i,
                    'text': text[:150],
                    'timestamp': metadata.get('timestamp', 'No timestamp')
                })
    
    print(f"Actual cat-related content: {len(cat_content)} entries")
    for content in cat_content:
        print(f"  [{content['index']}] {content['timestamp']}: {content['text']}...")

if __name__ == "__main__":
    asyncio.run(search_cat_response()) 
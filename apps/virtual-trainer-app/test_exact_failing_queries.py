import asyncio
from backend.services.knowledge_base_service import knowledge_base

async def test_exact_failing_queries():
    """Test the exact queries that are failing in the live API"""
    
    print("=== TESTING EXACT FAILING QUERIES ===\n")
    
    await knowledge_base._ensure_initialized()
    
    user_id = "9ff91fd7-1da3-4a37-8550-38902251e578"
    
    # These are the exact queries that are failing
    failing_queries = [
        "когда я спрашивал про кота",
        "что ты отвечал про кота"
    ]
    
    for query in failing_queries:
        print(f"--- Testing: '{query}' ---")
        
        try:
            results = await knowledge_base.search_relevant_context(
                query=query,
                user_id=user_id,
                max_results=5,
                min_similarity=0.3
            )
            
            print(f"Found {len(results)} results:")
            
            cat_content_found = False
            cat_question_found = False
            cat_answer_found = False
            
            for i, result in enumerate(results):
                content = result['content']
                content_lower = content.lower()
                
                # Check for different types of cat content
                if "как накачать кота" in content_lower:
                    cat_question_found = True
                    print(f"  ✅ Result {i+1} (CAT QUESTION): {result['similarity']:.3f}")
                elif "похоже, ты хотел сказать" in content_lower and "мышцы" in content_lower:
                    cat_answer_found = True
                    print(f"  ✅ Result {i+1} (CAT ANSWER): {result['similarity']:.3f}")
                elif "кот" in content_lower:
                    cat_content_found = True
                    print(f"  ✅ Result {i+1} (CAT MENTION): {result['similarity']:.3f}")
                else:
                    print(f"     Result {i+1}: {result['similarity']:.3f}")
                
                print(f"        Content: {content[:100]}...")
                print()
            
            # Analysis
            if cat_answer_found:
                print(f"✅ CAT AI RESPONSE found for '{query}'")
            elif cat_question_found:
                print(f"⚠️  CAT USER QUESTION found but no AI response for '{query}'")
            elif cat_content_found:
                print(f"⚠️  CAT MENTION found but not relevant for '{query}'")
            else:
                print(f"❌ NO CAT CONTENT found for '{query}'")
                
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("\n" + "="*50 + "\n")
    
    # Test with different query variations
    print("--- TESTING QUERY VARIATIONS ---")
    
    variations = [
        "кот",
        "накачать кота",
        "мышцы кот",
        "похоже ты хотел кот"
    ]
    
    for variation in variations:
        print(f"Testing '{variation}':")
        
        try:
            results = await knowledge_base.search_relevant_context(
                query=variation,
                user_id=user_id,
                max_results=2,
                min_similarity=0.3
            )
            
            cat_response_found = any(
                "похоже, ты хотел сказать" in r['content'].lower() 
                for r in results
            )
            
            print(f"  Found {len(results)} results, Cat response: {cat_response_found}")
            
        except Exception as e:
            print(f"  Error: {e}")
    
    print("\n=== TEST COMPLETE ===")

if __name__ == "__main__":
    asyncio.run(test_exact_failing_queries()) 
import asyncio
from backend.services.knowledge_base_service import knowledge_base

async def test_rag_search():
    """Test RAG search directly"""
    
    print("=== TESTING RAG SEARCH DIRECTLY ===\n")
    
    user_id = "9ff91fd7-1da3-4a37-8550-38902251e578"
    
    # Test different search queries
    queries = [
        "вода",
        "пить воду", 
        "как пить",
        "питье",
        "water",
        "воду"
    ]
    
    print("Ensuring knowledge base is initialized...")
    await knowledge_base._ensure_initialized()
    
    if not knowledge_base._initialized:
        print("❌ Knowledge base failed to initialize")
        return
    
    print("✅ Knowledge base initialized successfully")
    print(f"Loaded {len(knowledge_base.conversation_texts)} conversations")
    print(f"FAISS index size: {knowledge_base.faiss_index.ntotal if knowledge_base.faiss_index else 0}")
    
    for query in queries:
        print(f"\n--- Searching for: '{query}' ---")
        
        try:
            results = await knowledge_base.search_relevant_context(
                query=query,
                user_id=user_id,
                max_results=5,
                time_window_days=30,
                min_similarity=0.2  # Lower threshold
            )
            
            print(f"Found {len(results)} results:")
            for i, result in enumerate(results):
                print(f"  {i+1}. Similarity: {result['similarity']:.3f}")
                print(f"      Content: {result['content'][:100]}...")
                print(f"      Timestamp: {result['timestamp']}")
                print()
                
        except Exception as e:
            print(f"❌ Search failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_rag_search()) 
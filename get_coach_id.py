import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from backend.database.models import User

DATABASE_URL = "sqlite+aiosqlite:///./trainer.db"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_coach_id():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User.id).where(User.email == "test.coach@example.com")
        )
        coach_id = result.scalars().first()
        if coach_id:
            print(f"Coach ID: {coach_id}")
        else:
            print("Coach not found.")

if __name__ == "__main__":
    asyncio.run(get_coach_id()) 
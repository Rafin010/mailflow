import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

_DEFAULT_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mailflow.db").replace("\\", "/")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{_DEFAULT_DB}")

# Create Async Engine (SQLite needs check_same_thread=False for async/await concurrency if used wrongly, but aiosqlite handles it)
# We need to disable Postgres specific pool settings if we use sqlite
engine_kwargs = {}
if "sqlite" in DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(DATABASE_URL, echo=os.getenv("SQL_ECHO", "0") == "1", **engine_kwargs)

# Create Async Session Maker
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

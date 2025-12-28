# app.py
from fastapi import FastAPI
import asyncio
from api.routes import router
from lifecycle import load_assets, redis_expiration_listener

app = FastAPI(title="MeetNMeal API")
app.include_router(router)

## When running the app:
# all assets will be loaded, and redis expiration listener will be started
@app.on_event("startup")
async def startup_event():
    load_assets()
    # Start background cleanup task (Redis listener)
    asyncio.create_task(redis_expiration_listener())

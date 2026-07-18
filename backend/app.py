from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from api.routes import router
from lifecycle import load_assets, redis_expiration_listener

app = FastAPI(title="MeetNMeal API")

# Enable CORS for all origins (Local, Vercel production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def health_check():
    return {"status": "ok", "app": "MeetNMeal Backend"}

## When running the app:
# all assets will be loaded, and redis expiration listener will be started
@app.on_event("startup")
async def startup_event():
    load_assets()
    # Start background cleanup task (Redis listener)
    asyncio.create_task(redis_expiration_listener())

## This file contains all the lifecycle events
## 1. load_assets(): Loads all the assets required for the application
## 2. run_cleanup_loop(): Checks every 2 minutes whether any group is expired or not (When redis not used)
## 3. redis_expiration_listener(): Listens to the redis expiration events and broadcasts the session expiry to that group

import os
import pickle
import pandas as pd
import asyncio
import redis.asyncio as redis
from api.websockets import manager
from src import shared
from src.distanceCal import load_location_coordinates
from api.session_store import cleanup_expired_groups

import zipfile

def load_assets():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    # Auto-extract zipped pickle files if missing in environment
    unique_pkl = os.path.join(DATA_DIR, "zomato_uniqueBranches.pkl")
    if not os.path.exists(unique_pkl):
        print("Extracting zomato_uniqueBranches.zip...")
        with zipfile.ZipFile(os.path.join(DATA_DIR, "zomato_uniqueBranches.zip"), 'r') as zip_ref:
            zip_ref.extractall(DATA_DIR)

    all_pkl = os.path.join(DATA_DIR, "zomato_allBranches.pkl")
    if not os.path.exists(all_pkl):
        print("Extracting zomato_allBranches.zip...")
        with zipfile.ZipFile(os.path.join(DATA_DIR, "zomato_allBranches.zip"), 'r') as zip_ref:
            zip_ref.extractall(DATA_DIR)

    shared.vectorizer = pickle.load(open(os.path.join(DATA_DIR, "dish_vectorizer.pkl"), "rb"))
    shared.tfidf_matrix = pickle.load(open(os.path.join(DATA_DIR, "dish_tfidf_matrix.pkl"), "rb"))

    shared.zomato_unique = pd.read_pickle(unique_pkl)
    shared.zomato = pd.read_pickle(all_pkl)

    shared.coord_dict = load_location_coordinates(
        os.path.join(DATA_DIR, "BLRCoordinates.csv")
    )

    print("All Assests Loaded Sucessfully !")

## Checks every 2 minutes whether any group is expired or not
## NOT required as we are using Redis Expiration
async def run_cleanup_loop():
    while True:
        await asyncio.sleep(120) # Run every 2 mins
        count = cleanup_expired_groups()
        if count > 0:
            print(f"Cleaned up {count} expired groups.")


async def redis_expiration_listener():
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        r = redis.from_url(redis_url, decode_responses=True)
        
        # Enable keyspace notifications for 'Expired' events if not already enabled
        try:
            await r.config_set("notify-keyspace-events", "Ex")
        except Exception as config_err:
            print("Skipped config_set (Cloud Redis handles configuration):", config_err)
        
        pubsub = r.pubsub()
        # Subscribe to expiry events on DB 0
        await pubsub.psubscribe("__keyevent@0__:expired")
        
        print("Listening for Redis expiry events...")
        
        async for message in pubsub.listen():
            if message["type"] == "pmessage":
                expired_key = message["data"]
                
                # Broadcast session expiry to that group
                await manager.broadcast(expired_key, {
                    "type": "SESSION_EXPIRED",
                    "message": "This session has expired."
                })
                
                # Clean up connections
                await manager.close_group(expired_key)
                
    except Exception as e:
        print(f"Error in Redis expiry listener: {e}")

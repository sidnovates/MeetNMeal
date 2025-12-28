import uuid
import json
import redis
import pandas as pd
from datetime import datetime, timedelta
from fastapi import HTTPException

from src.recommendor import recommend_group
from src import shared
from .schemas import UserPreference

# Initialize Redis
# Assuming local redis server
redis_client = redis.Redis()
EXPIRATION_SECONDS = 600  # 10 minutes

def get_group_from_redis(group_id: str):
    try:
        data = redis_client.get(group_id)
    except redis.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Redis connection failed")
        
    if not data:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )
    return json.loads(data)

def save_group_to_redis(group_id: str, data: dict):
    # Using setex to ensure the group expires if abandoned
    redis_client.setex(group_id, EXPIRATION_SECONDS, json.dumps(data))

def create_group():
    group_id = str(uuid.uuid4())[:8]
    

    group_data = {
        "participants": {},
        "result": None,
    }
    
    save_group_to_redis(group_id, group_data)
    return group_id


def add_user(group_id):
    group = get_group_from_redis(group_id)

    ##check if group_id already computed results
    if group["result"] is not None:
        raise HTTPException(
            status_code=400,
            detail="Group already computed results"
        )

    user_id = str(uuid.uuid4())[:6]
    group["participants"][user_id] = {
        "preferences": None,
        "ready": False
    }
    
    save_group_to_redis(group_id, group)
    return user_id

def submit_preferences(group_id, user_id, prefs: UserPreference):
    
    group = get_group_from_redis(group_id)

    if user_id not in group["participants"]:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    ## Checking if a user has already submitted preferences
    if group["participants"][user_id]["ready"]:
        raise HTTPException(
            status_code=400,
            detail="User already submitted preferences"
        )

    try:
        # prefs is a Pydantic model, convert to dict for storage
        group["participants"][user_id]["preferences"] = prefs.dict()
        group["participants"][user_id]["ready"] = True
        
        save_group_to_redis(group_id, group)
        return {"status": "submitted"}

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Failed to submit preferences"
        )

##For getting group status
def group_status(group_id):
    group = get_group_from_redis(group_id)

    try: 
        participants = group["participants"]
        ready_count = sum(p["ready"] for p in participants.values())

        return {
            "total": len(participants),
            "ready": ready_count,
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Failed to get group status"
        )

##For computing group choice
def compute_group_choice(group_id):
    group = get_group_from_redis(group_id)
    
    if not group["participants"]:
        raise HTTPException(
            status_code=400,
            detail="Group is empty"
        )
        
    participants = group["participants"]
    ## all() returns true if and only if all values are true, even if one false returns false
    if not all(p["ready"] for p in participants.values()):
        raise HTTPException(
            status_code=400,
            detail="Not all users are ready"
        )

    try:
        users = [
            p["preferences"]
            for p in group["participants"].values()
            if p["ready"] and p["preferences"]
        ]

        if not users:
            raise HTTPException(
                status_code=400,
                detail="No ready users with preferences",
            )

        # Recommend
        # returns a pandas DataFrame
        result_df = recommend_group(
            df_full=shared.zomato_unique,
            coord_dict=shared.coord_dict,
            users_list=users,
            top_k=10,
        )

        # store result as list of dicts (JSON serializable)
        group["result"] = result_df.to_dict(orient="records")
        
        save_group_to_redis(group_id, group)

        return {"status": "computed"}

    except Exception as e:
        print(f"Error computing group choice: {e}") # Log to console
        raise HTTPException(
            status_code=400,
            detail=f"Failed to compute group choice: {str(e)}"
        )

## For getting computed result
def getComputedResult(group_id):
    group = get_group_from_redis(group_id)

    try:
        if group["result"] is None:
            raise HTTPException(status_code=404, detail="Result not computed yet")
        else:
            # Reconstruct DataFrame from JSON data
            return pd.DataFrame(group["result"])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Failed to get computed result"
        )
import uuid
from datetime import datetime, timedelta
from fastapi import HTTPException

from src.recommendor import recommend_group
from src import shared

GROUPS = {}

def create_group():
    group_id = str(uuid.uuid4())[:8]
    GROUPS[group_id] = {
        "participants": {},
        "result": None,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=15)
    }
    return group_id

def cleanup_expired_groups():
    """
    Removes groups that have passed their expiration time.
    Returns the number of groups deleted.
    """
    now = datetime.utcnow()
    expired_ids = [gid for gid, data in GROUPS.items() if data["expires_at"] < now]
    
    for gid in expired_ids:
        del GROUPS[gid]
        
    return len(expired_ids)


def add_user(group_id):

    if group_id not in GROUPS:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )
    ##check if group_id already computed results
    if GROUPS[group_id]["result"] is not None:
        raise HTTPException(
            status_code=400,
            detail="Group already computed results"
        )

    user_id = str(uuid.uuid4())[:6]
    GROUPS[group_id]["participants"][user_id] = {
        "preferences": None,
        "ready": False
    }
    return user_id

def submit_preferences(group_id, user_id, prefs):

    if group_id not in GROUPS:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )
    if user_id not in GROUPS[group_id]["participants"]:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    ## Checking if a user has already submitted preferences
    if GROUPS[group_id]["participants"][user_id]["ready"]:
        raise HTTPException(
            status_code=400,
            detail="User already submitted preferences"
        )

    try:
        GROUPS[group_id]["participants"][user_id]["preferences"] = prefs.dict()
        GROUPS[group_id]["participants"][user_id]["ready"] = True
        return {"status": "submitted"}

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Failed to submit preferences"
        )

##For getting group status
def group_status(group_id):
    if group_id not in GROUPS:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        ) 

    try: 
        participants = GROUPS[group_id]["participants"]
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
    if group_id not in GROUPS:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )
    
    
    if not GROUPS[group_id]["participants"]:
        raise HTTPException(
            status_code=400,
            detail="Group is empty"
        )
        
    participants = GROUPS[group_id]["participants"]
    ## all() returns true if and only if all values are true, even if one false returns false
    if not all(p["ready"] for p in participants.values()):
        raise HTTPException(
            status_code=400,
            detail="Not all users are ready"
        )

    try:
        users = [
            p["preferences"]
            for p in GROUPS[group_id]["participants"].values()
            if p["ready"] and p["preferences"]
        ]

        if not users:
            raise HTTPException(
                status_code=400,
                detail="No ready users with preferences",
            )

        # Recommend
        result = recommend_group(
            df_full=shared.zomato_unique,
            coord_dict=shared.coord_dict,
            users_list=users,
            top_k=10,
        )

        GROUPS[group_id]["result"] = result

        return {"status": "computed"}

    except Exception as e:
        print(f"Error computing group choice: {e}") # Log to console
        raise HTTPException(
            status_code=400,
            detail=f"Failed to compute group choice: {str(e)}"
        )

## For getting computed result
def getComputedResult(group_id):
    if group_id not in GROUPS:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )
    try:
        if GROUPS[group_id]["result"] is None:
            raise HTTPException(status_code=404, detail="Result not computed yet")
        else:
            return GROUPS[group_id]["result"]

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Failed to get computed result"
        )
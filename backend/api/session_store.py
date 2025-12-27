import uuid
from datetime import datetime

GROUPS = {}

def create_group():
    group_id = str(uuid.uuid4())[:8]
    GROUPS[group_id] = {
        "participants": {},
        "result": None,
        "created_at": datetime.utcnow()
    }
    return group_id

def add_user(group_id):
    user_id = str(uuid.uuid4())[:6]
    GROUPS[group_id]["participants"][user_id] = {
        "preferences": None,
        "ready": False
    }
    return user_id

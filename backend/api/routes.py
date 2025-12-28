from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from .websockets import manager

from .schemas import (
    CreateGroupResponse,
    JoinGroupResponse,
    UserPreference,
    RecommendationResponse,
)

# from .session_store import (
#     create_group,
#     add_user,
#     submit_preferences,
#     group_status,
#     compute_group_choice,
#     getComputedResult
# )

from .session_redis import (
    create_group,
    add_user,
    submit_preferences,
    group_status,
    compute_group_choice,
    getComputedResult
)
from src import shared

router = APIRouter()

# ─────────────────────────────────────────────
# ➕ Create Group
# ─────────────────────────────────────────────
@router.post("/group/create", response_model=CreateGroupResponse)
def create_group_api():
    """
    Creates a new group session and returns a group_id.
    """
    group_id = create_group()
    return {"group_id": group_id}


# ─────────────────────────────────────────────
# ➕ Join Group
# ─────────────────────────────────────────────
@router.post("/group/join/{group_id}", response_model=JoinGroupResponse)
def join_group_api(group_id: str):
    """
    Adds a user to an existing group and returns a user_id.
    """
    user_id = add_user(group_id)
    return {"user_id": user_id}


# ─────────────────────────────────────────────
# 📝 Submit User Preferences
# ─────────────────────────────────────────────
@router.post("/group/submit/{group_id}/{user_id}")
async def submit_preferences_api(
    group_id: str,
    user_id: str,
    prefs: UserPreference,
):
    """
    Stores preferences for a user and marks them as ready.
    """
    
    result = submit_preferences(group_id, user_id, prefs)
    
    # Broadcast update via WebSocket
    await manager.broadcast(group_id, {
        "type": "USER_READY",
        "user_id": user_id,
        "status": "ready"
    })
    
    return result

# ─────────────────────────────────────────────
# 📊 Group Status
# ─────────────────────────────────────────────
@router.get("/group/status/{group_id}")
def group_status_api(group_id: str):
    """
    Returns total users and how many are ready.
    """
    
    return group_status(group_id)

# ─────────────────────────────────────────────
# ⚙️ Compute Group Recommendation
# ─────────────────────────────────────────────
@router.post("/group/compute/{group_id}")
async def compute_group_api(group_id: str):
    """
    Runs group recommendation once all users are ready.
    """

    result = compute_group_choice(group_id)

    # Broadcast update via WebSocket
    await manager.broadcast(group_id, {
        "event": "RESULT_COMPUTED"
    })
    
    return result


# ─────────────────────────────────────────────
# 📦 Fetch Recommendation Result
# ─────────────────────────────────────────────
@router.get("/group/result/{group_id}", response_model=RecommendationResponse)
def fetch_result_api(group_id: str):
    """
    Returns top-k restaurant recommendations for the group.
    """

    df = getComputedResult(group_id)

    filtered_df = df[
        [
            "name",
            "cuisines",
            "rest_type",
            "approx_cost(for two people)",
            "location",
            "distance_km",
            "distance_score",
            "final_score_adjusted",
        ]
    ].copy()

    filtered_df = filtered_df.rename(
        columns={
            "approx_cost(for two people)": "approx_cost_for_two_people"
        }
    )

    filtered_df = filtered_df.fillna(0)

    # Convert list fields to string for schema safety
    def list_to_str(val):
        if isinstance(val, list):
            return ", ".join(map(str, val))
        return str(val)

    filtered_df["cuisines"] = filtered_df["cuisines"].apply(list_to_str)
    filtered_df["rest_type"] = filtered_df["rest_type"].apply(list_to_str)

    restaurants = filtered_df.to_dict(orient="records")

    return {"restaurants": restaurants}

# # ─────────────────────────────────────────────
# # 🔌 WebSocket Endpoint
# # ─────────────────────────────────────────────
@router.websocket("/ws/{group_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, group_id: str, user_id: str):
    await manager.connect(websocket, group_id)
    try:
        while True:
            ## waits for msg from client forever when connected
            ## when the client disconnects due to reasons like refreshing a browser, closing a tab,etc.abs
            ## client sends WebSocketDisconnect event and this is caught in the except block
            ## we then remove the client from the group
            
            # Keep connection alive; currently we only push from server
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, group_id)

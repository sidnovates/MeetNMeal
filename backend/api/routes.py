from fastapi import APIRouter, HTTPException

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
def submit_preferences_api(
    group_id: str,
    user_id: str,
    prefs: UserPreference,
):
    """
    Stores preferences for a user and marks them as ready.
    """

    # GROUPS[group_id]["participants"][user_id]["preferences"] = prefs.dict()
    # GROUPS[group_id]["participants"][user_id]["ready"] = True
    return submit_preferences(group_id, user_id, prefs)

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
def compute_group_api(group_id: str):
    """
    Runs group recommendation once all users are ready.
    """

    return compute_group_choice(group_id)


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


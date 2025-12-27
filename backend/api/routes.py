from fastapi import APIRouter, HTTPException

from .schemas import (
    CreateGroupResponse,
    JoinGroupResponse,
    UserPreference,
    RecommendationResponse,
)

from .session_store import (
    create_group,
    add_user,
)

from src.recommendor import recommend_group

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
    GROUPS[group_id]["participants"][user_id]["preferences"] = prefs.dict()
    GROUPS[group_id]["participants"][user_id]["ready"] = True

    return {"status": "submitted"}


# ─────────────────────────────────────────────
# 📊 Group Status
# ─────────────────────────────────────────────
@router.get("/group/status/{group_id}")
def group_status_api(group_id: str):
    """
    Returns total users and how many are ready.
    """
    participants = GROUPS[group_id]["participants"]
    ready_count = sum(p["ready"] for p in participants.values())

    return {
        "total": len(participants),
        "ready": ready_count,
    }


# ─────────────────────────────────────────────
# ⚙️ Compute Group Recommendation
# ─────────────────────────────────────────────
@router.post("/group/compute/{group_id}")
def compute_group_api(group_id: str):
    """
    Runs group recommendation once all users are ready.
    """

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
    result = recommend_group(
        df_full=zomato_unique,
        coord_dict=coord_dict,
        users_list=users,
        top_k=10,
    )

    GROUPS[group_id]["result"] = result

    return {"status": "computed"}


# ─────────────────────────────────────────────
# 📦 Fetch Recommendation Result
# ─────────────────────────────────────────────
@router.get("/group/result/{group_id}", response_model=RecommendationResponse)
def fetch_result_api(group_id: str):
    """
    Returns top-k restaurant recommendations for the group.
    """

    if GROUPS[group_id]["result"] is None:
        raise HTTPException(status_code=404, detail="Result not computed yet")

    df = GROUPS[group_id]["result"]

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

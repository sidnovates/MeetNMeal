from pydantic import BaseModel
from typing import List, Optional

class CreateGroupResponse(BaseModel):
    group_id: str

class JoinGroupResponse(BaseModel):
    user_id: str

class UserPreference(BaseModel):
    cuisines: List[str]
    rest_type: List[str]
    dist_pref: List[str]
    budget: int
    lat:float
    lng:float

class RestaurantResponse(BaseModel):
    name: str
    cuisines: str
    rest_type: str
    approx_cost_for_two_people: float
    location: str
    distance_km: float
    distance_score: float
    final_score_adjusted: float

class RecommendationResponse(BaseModel):
    restaurants: List[RestaurantResponse]

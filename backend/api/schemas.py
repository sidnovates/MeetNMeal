## Schema for API responses (How messages should be recieved from the client or sent to the client)

from pydantic import BaseModel
from typing import List, Optional

class CreateGroupResponse(BaseModel):
    group_id: str

class JoinGroupResponse(BaseModel):
    user_id: str

class UserPreference(BaseModel):
    cuisines: List[str]
    rest_type: List[str]
    dish_pref: List[str]
    budget: int
    location: str

class RestaurantResponse(BaseModel):
    name: str
    rate: Optional[float] = None
    cuisines: str
    rest_type: str
    cost: float
    location: str
    distance_km: float
    distance_score: float
    final_score_adjusted: float

class RecommendationResponse(BaseModel):
    restaurants: List[RestaurantResponse]

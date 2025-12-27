import os
import pandas as pd
from src.recommendor import recommend_group
from src.distanceCal import load_location_coordinates

# Define base directory (where run.py is located)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

zomato_unique = pd.read_pickle(
    os.path.join(DATA_DIR, "zomato_uniqueBranches.pkl")
)
coord_dict = load_location_coordinates(
    os.path.join(DATA_DIR, "BLRCoordinates.csv")
)

users = [
    {
        "cuisines": ["chinese", "thai"],
        "rest_type": ["cafe"],
        "dish_pref": ["biryani"],
        "budget": 700,
        "lat": 12.91,
        "lng": 77.64
    },
    {
        "cuisines": ["italian"],
        "rest_type": ["casual_dining"],
        "dish_pref": ["pasta"],
        "budget": 1000,
        "lat": 12.93,
        "lng": 77.62
    },
    {
        "cuisines": ["chinese"],
        "rest_type": ["cafe"],
        "dish_pref": ["noodles"],
        "budget": 800,
        "lat": 12.97,
        "lng": 77.64
    },
    {
        "cuisines": ["north indian"],
        "rest_type": ["casual_dining"],
        "dish_pref": ["paneer"],
        "budget": 600,
        "lat": 12.94,
        "lng": 77.65
    }
]

final_results = recommend_group(
    df_full=zomato_unique,
    coord_dict=coord_dict,
    users_list=users,
    top_k=10
)
# Save to CSV
output_path = os.path.join(BASE_DIR, "output.csv")
output_columns = [
    "name", "cuisines", "rest_type",
    "approx_cost(for two people)", "location",
    "distance_km", "distance_score", "final_score_adjusted"
]
final_results[output_columns].to_csv(output_path, index=False)
print(f"Results saved to {output_path}")
print(final_results[output_columns])
import numpy as np
import math
import pandas as pd

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # earth radius in KM

    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))

    return R * c  # distance in km


def load_location_coordinates(path):
    # ="/kaggle/input/blrcoordinates/location.csv"
    """
    CSV format:
    location, latitude, longitude
    HSR, 12.91, 77.64
    BTM, 12.90, 77.61
    ...
    """
    coords = pd.read_csv(path)
    coords["location"] = coords["location"].str.lower().str.strip()

    coord_dict = {}
    for _, row in coords.iterrows():
        coord_dict[row["location"]] = (row["latitude"], row["longitude"])

    return coord_dict


def find_closest_branch(restaurant_name, user_lat, user_lng, coord_dict):
    """
    zomato_allBranches : original dataframe with ALL branches (has location)
    restaurant_name    : restaurant brand name (string)
    user_lat, user_lng : user / group centroid coordinates
    coord_dict         : mapping of location -> (lat, lng)
    """
    # import os
    # BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # DATA_PATH = os.path.join(BASE_DIR, "data", "zomato_allBranches.pkl")
    # zomato = pd.read_pickle(DATA_PATH)
    
    branches = zomato[zomato["name"] == restaurant_name]

    best_branch = None
    best_distance = float("inf")

    for _, row in branches.iterrows():

        loc = str(row["location"]).lower().strip()

        # Skip branches whose location we cannot geocode
        if loc not in coord_dict:
            continue

        rest_lat, rest_lng = coord_dict[loc]
        dist = haversine(user_lat, user_lng, rest_lat, rest_lng)

        if dist < best_distance:
            best_distance = dist
            best_branch = row

    return best_branch, best_distance

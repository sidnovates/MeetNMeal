from collections import Counter
import numpy as np
def aggregate_group_cuisines(users_list):
    all_cuisines = []

    for user in users_list:
        if user.get("cuisines"):
            all_cuisines.extend(user["cuisines"])

    if not all_cuisines:
        return None

    return Counter(all_cuisines)   # <-- frequencies preserved

def aggregate_group_rest_types(users_list):
    all_types = []

    for user in users_list:
        if user.get("rest_type"):
            all_types.extend(user["rest_type"])

    if not all_types:
        return None

    return Counter(all_types)
    
def aggregate_group_dishes(users_list):
    all_dishes = []

    for user in users_list:
        if user.get("dish_pref"):
            all_dishes.extend(user["dish_pref"])

    if not all_dishes:
        return None

    return Counter(all_dishes)


def aggregate_group_budget(users_list):
    budgets = [user["budget"] for user in users_list if user.get("budget")]

    if not budgets:
        return None

    return int(np.median(budgets))

from src import shared

def aggregate_group_location(users_list):
    lats = []
    lngs = []

    for u in users_list:
        loc_name = u.get("location")
        if loc_name:
            # Check exact or lower case match
            key = loc_name.lower().strip()
            if key in shared.coord_dict:
                lat, lng = shared.coord_dict[key]
                lats.append(lat)
                lngs.append(lng)

    if not lats or not lngs:
        # Default to Bangalore center if no valid locations found
        return 12.9716, 77.5946

    group_lat = sum(lats) / len(lats)
    group_lng = sum(lngs) / len(lngs)

    return group_lat, group_lng


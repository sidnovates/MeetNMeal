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

def aggregate_group_location(users_list):
    lats = [u["lat"] for u in users_list if u.get("lat") is not None]
    lngs = [u["lng"] for u in users_list if u.get("lng") is not None]

    if not lats or not lngs:
        return None, None

    group_lat = sum(lats) / len(lats)
    group_lng = sum(lngs) / len(lngs)

    return group_lat, group_lng


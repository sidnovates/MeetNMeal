import pickle
import pandas as pd
from src.group_aggregation import (
    aggregate_group_cuisines,
    aggregate_group_rest_types,
    aggregate_group_dishes,
    aggregate_group_budget,
    aggregate_group_location,

)
from src.distanceCal import (
    find_closest_branch
)
from src.scoring import (
    apply_weighted_cuisine_scoring,
    apply_weighted_rest_type_scoring,
    apply_weighted_dish_score,
    apply_rating_score,
    apply_cost_score,
    compute_distance_score,
    apply_final_score
)

def get_final_recommendations_with_distance(
    # df_full, 
    top30_df, user_lat, user_lng, coord_dict, top_k=10
):
    final_rows = []

    for _, row in top30_df.iterrows():

        rest_name = row["name"]
        # print(rest_name)
        best_branch, best_distance = find_closest_branch(
            # df_full,
            rest_name, user_lat, user_lng, coord_dict
        )

        if best_distance > 10:   # skip anything beyond 10 km
            continue

        if best_branch is None:
            continue

        dist_score = compute_distance_score(best_distance)

        final_score_adjusted = (
            0.35 * row["cuisine_score"] +
            0.20 * row["rest_type_score"] +
            0.25 * row["dish_score"] +
            0.10 * row["rating_score"] +
            0.10 * row["cost_score"] +
            0.30 * dist_score
        )

        best_branch = best_branch.copy()
        best_branch["distance_km"] = best_distance
        best_branch["distance_score"] = dist_score
        best_branch["final_score_adjusted"] = final_score_adjusted

        final_rows.append(best_branch)

    final_df = pd.DataFrame(final_rows)
    final_df = final_df.sort_values("final_score_adjusted", ascending=False)

    return final_df.head(top_k)


def recommend_group(df_full, coord_dict, users_list, top_k=10):

    # 1. Aggregate weighted preferences
    cuisine_counter = aggregate_group_cuisines(users_list)
    rest_counter = aggregate_group_rest_types(users_list)
    dish_counter = aggregate_group_dishes(users_list)
    group_budget = aggregate_group_budget(users_list)
    group_lat, group_lng = aggregate_group_location(users_list)

    # 2. Load vectorizer & matrix dynamically
    import os
    # src/ is one level down from backend/
    # recommendor.py is in src/, so go up one level to backend/, then into data/
    # usage: os.path.dirname(__file__) -> .../backend/src
    
    # BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # DATA_DIR = os.path.join(BASE_DIR, "data")

    # vectorizer = pickle.load(open(os.path.join(DATA_DIR, "dish_vectorizer.pkl"), "rb"))
    # tfidf_matrix = pickle.load(open(os.path.join(DATA_DIR, "dish_tfidf_matrix.pkl"), "rb"))

    # 3. Apply weighted scoring
    df = df_full.copy()

    df = apply_weighted_cuisine_scoring(df, cuisine_counter)
    df = apply_weighted_rest_type_scoring(df, rest_counter)
    df = apply_rating_score(df)               # unchanged
    df = apply_cost_score(df, group_budget)   # unchanged
    df = apply_weighted_dish_score(df, dish_counter, vectorizer, tfidf_matrix)

    # 4. Base scoring to pick top 30
    df = apply_final_score(df)
    top30 = df.sort_values("final_score", ascending=False).head(30)

    # 5. Apply distance + branch selection
    final_results = get_final_recommendations_with_distance(
        top30_df=top30,
        user_lat=group_lat,
        user_lng=group_lng,
        coord_dict=coord_dict,
        top_k=top_k
    )

    return final_results

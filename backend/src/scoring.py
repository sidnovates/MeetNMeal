
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
## CUISING SCORING

def apply_weighted_cuisine_scoring(df, cuisine_counter):
    if not cuisine_counter:
        df["cuisine_score"] = 0
        return df

    df["cuisine_score"] = df["cuisines"].apply(
        lambda rest_cui: sum(cuisine_counter.get(c, 0) for c in rest_cui)
    )

    max_score = df["cuisine_score"].max()
    if max_score > 0:
        df["cuisine_score"] = df["cuisine_score"] / max_score

    return df


## RESTAURANT TYPE SCORING

def apply_weighted_rest_type_scoring(df, rest_counter):
    if not rest_counter:
        df["rest_type_score"] = 0
        return df

    df["rest_type_score"] = df["rest_type"].apply(
        lambda rt: sum(rest_counter.get(t, 0) for t in rt)
    )

    max_score = df["rest_type_score"].max()
    if max_score > 0:
        df["rest_type_score"] = df["rest_type_score"] / max_score

    return df

## DISH SCORING

def apply_weighted_dish_score(df, dish_counter, vectorizer, tfidf_matrix):
    if not dish_counter:
        df["dish_score"] = 0
        return df

    query_words = []
    for dish, freq in dish_counter.items():
        query_words.extend([dish] * freq)  # repeat dish by weight

    query_str = " ".join(query_words)

    user_vec = vectorizer.transform([query_str])
    sim_scores = cosine_similarity(user_vec, tfidf_matrix).flatten()

    df["dish_score"] = sim_scores
    return df

## RATING SCORE

def apply_rating_score(df):
    df.loc[:, "rating_score"] = df["MeanRating"] / 5
    return df

## COST SCORING

def apply_cost_score(df, user_budget):
    
    if user_budget is None:
        df["cost_score"] = 0
        return df
    df.loc[:, "cost_diff"] = abs(df["approx_cost(for two people)"] - user_budget)
    df.loc[:, "cost_score"] = 1 / (df["cost_diff"] + 1)

    
    return df

## LOCATION SCORING

def compute_distance_score(distance_km):
    return 1 / (distance_km + 1)

## FINAL COMPLETE SCORING

def apply_final_score(df):
    df["final_score"] = (
        0.35 * df["cuisine_score"] +
        0.20 * df["rest_type_score"] +
        0.25 * df["dish_score"] +
        0.10 * df["rating_score"] +
        0.10 * df["cost_score"]
    )
    return df
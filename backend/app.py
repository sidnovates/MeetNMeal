# app.py
from fastapi import FastAPI
import pickle
import pandas as pd
import os

from src.distanceCal import load_location_coordinates

app = FastAPI(title="MeetNMeal API")

##on Starting all assests will be loaded
@app.on_event("startup")
def load_assets():
    global vectorizer, tfidf_matrix, zomato , zomato_unique, coord_dict,zomato

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    vectorizer = pickle.load(open(os.path.join(DATA_DIR, "dish_vectorizer.pkl"), "rb"))
    tfidf_matrix = pickle.load(open(os.path.join(DATA_DIR, "dish_tfidf_matrix.pkl"), "rb"))

    zomato_unique = pd.read_pickle(
    os.path.join(DATA_DIR, "zomato_uniqueBranches.pkl")
    )
    zomato = pd.read_pickle(os.path.join(DATA_DIR, "zomato_allBranches.pkl"))

    coord_dict = load_location_coordinates(
        os.path.join(DATA_DIR, "BLRCoordinates.csv")
    )

    print("All Assests Loaded Sucessfully !")



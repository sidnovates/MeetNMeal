# app.py
from fastapi import FastAPI
import pickle
import pandas as pd
import os

from src.distanceCal import load_location_coordinates
from src import shared
from api.routes import router

app = FastAPI(title="MeetNMeal API")
app.include_router(router)

##on Starting all assests will be loaded
@app.on_event("startup")
def load_assets():
    
    BASE_DIR = r"C:\Siddharth\Desktop\RecSystem\MeetNMeal\backend"
    DATA_DIR = os.path.join(BASE_DIR, "data")

    shared.vectorizer = pickle.load(open(os.path.join(DATA_DIR, "dish_vectorizer.pkl"), "rb"))
    shared.tfidf_matrix = pickle.load(open(os.path.join(DATA_DIR, "dish_tfidf_matrix.pkl"), "rb"))

    shared.zomato_unique = pd.read_pickle(
        os.path.join(DATA_DIR, "zomato_uniqueBranches.pkl")
    )
    shared.zomato = pd.read_pickle(os.path.join(DATA_DIR, "zomato_allBranches.pkl"))

    shared.coord_dict = load_location_coordinates(
        os.path.join(DATA_DIR, "BLRCoordinates.csv")
    )

    print("All Assests Loaded Sucessfully !")



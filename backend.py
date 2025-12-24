import json
import os
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

required_files = [
    "melbourne_housing_xgboost.pkl",
    "suburb_map.json", "seller_map.json",
    "type_map.json", "method_map.json",
    "council_map.json", "region_map.json",
    "property_map.json"
]

# Verify files exist
for f in required_files:
    if not os.path.exists(f):
        print(f" WARNING: Missing '{f}'. App may crash.")

# Load Model
model = joblib.load("melbourne_housing_xgboost.pkl")


# Helper to load JSONs
def load_json(name):
    with open(name, 'r') as f:
        return json.load(f)


# Load Maps
suburb_map = load_json('suburb_map.json')
seller_map = load_json('seller_map.json')
type_map = load_json('type_map.json')
method_map = load_json('method_map.json')
council_map = load_json('council_map.json')
region_map = load_json('region_map.json')
property_map = load_json('property_map.json')

# Calculate Global Averages (Fallbacks for unknown inputs)
avg_suburb = sum(suburb_map.values()) / len(suburb_map)
avg_seller = sum(seller_map.values()) / len(seller_map)
avg_type = sum(type_map.values()) / len(type_map)
avg_method = sum(method_map.values()) / len(method_map)
avg_council = sum(council_map.values()) / len(council_map)
avg_region = sum(region_map.values()) / len(region_map)
avg_prop = sum(property_map.values()) / len(property_map)


# --- 2. INPUT DATA MODEL ---
class House(BaseModel):
    Rooms: int
    Distance: float
    Bathroom: int
    Car: int
    Landsize: float
    BuildingArea: float
    Suburb: str
    SellerG: str
    Type: str
    Method: str
    CouncilArea: str
    Regionname: str


@app.get("/")
def home():
    return {"message": "Backend Running XGBoost"}


@app.post("/predict")
def predict(house: House):
    # A. TRANSLATE TEXT -> TARGET ENCODED NUMBERS
    # We use .get(value, default_average) to handle unknown categories safely
    suburb_enc = suburb_map.get(house.Suburb, avg_suburb)
    seller_enc = seller_map.get(house.SellerG, avg_seller)
    type_enc = type_map.get(house.Type, avg_type)
    method_enc = method_map.get(house.Method, avg_method)
    council_enc = council_map.get(house.CouncilArea, avg_council)
    region_enc = region_map.get(house.Regionname, avg_region)

    # Auto-lookup PropertyCount based on Suburb
    prop_count = property_map.get(house.Suburb, avg_prop)

    # B. CONSTRUCT DATAFRAME
    # CRITICAL: The columns must be in the EXACT order the model expects
    input_data = pd.DataFrame([{
        'Rooms': house.Rooms,
        'Type': type_enc,
        'Method': method_enc,
        'Distance': house.Distance,
        'Bathroom': house.Bathroom,
        'Car': house.Car,
        'Landsize': house.Landsize,
        'BuildingArea': house.BuildingArea,
        'CouncilArea': council_enc,
        'Regionname': region_enc,
        'Propertycount': prop_count,
        'Suburb_Encoded': suburb_enc,
        'SellerG_Encoded': seller_enc
    }])

    # C. ENSURE NUMERIC TYPES
    input_data = input_data.astype(float)

    # D. PREDICT
    try:
        prediction = model.predict(input_data)
        return {"predicted_price": float(prediction[0])}
    except Exception as e:
        return {"error": str(e), "details": "Model columns mismatch or data error."}
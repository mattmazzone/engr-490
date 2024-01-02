from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from firebase_admin import initialize_app, auth, credentials
from dotenv import load_dotenv
import requests, os, json
from functools import wraps
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

cred = credentials.Certificate('tripwise-sdk-key.json')
fb_app = initialize_app(cred)

interests_dict = {
    "Restaurants": ["restaurant", "cafe", "bakery", "bar"],
    "Arts": ["art_gallery", "movie_theater", "museum", "tourist_attraction"],
    "Bars": ["bar", "nightclub", "liquor_store"],
    "Sports": ["gym", "stadium", "park", "bowling_alley"],
    "Politics": ["city_hall", "local_government_office", "courthouse", "embassy"],
    "History": ["museum", "tourist_attraction", "church", "synagogue", "mosque"],
    "Social Media": ["cafe"],
    "Real Estate": ["lodging"],
    "Dating": ["cafe", "movie_theater", "park", "bar"],
    "Religion": ["church", "mosque", "synagogue", "hindu_temple"],
    "Sightseeing": ["tourist_attraction", "museum", "art_gallery", "park", "zoo", "aquarium"],
    "Cars": ["car_rental"],
    "Coffee": ["cafe", "bakery", "restaurant"],
    "Nature": ["park", "campground", "zoo", "aquarium"],
}

# https://developers.google.com/maps/documentation/places/web-service/supported_types#table1
table1_types = [
  "accounting",
  "airport",
  "amusement_park",
  "aquarium",
  "art_gallery",
  "atm",
  "bakery",
  "bank",
  "bar",
  "beauty_salon",
  "bicycle_store",
  "book_store",
  "bowling_alley",
  "bus_station",
  "cafe",
  "campground",
  "car_dealer",
  "car_rental",
  "car_repair",
  "car_wash",
  "casino",
  "cemetery",
  "church",
  "city_hall",
  "clothing_store",
  "convenience_store",
  "courthouse",
  "dentist",
  "department_store",
  "doctor",
  "drugstore",
  "electrician",
  "electronics_store",
  "embassy",
  "fire_station",
  "florist",
  "funeral_home",
  "furniture_store",
  "gas_station",
  "gym",
  "hair_care",
  "hardware_store",
  "hindu_temple",
  "home_goods_store",
  "hospital",
  "insurance_agency",
  "jewelry_store",
  "laundry",
  "lawyer",
  "library",
  "light_rail_station",
  "liquor_store",
  "local_government_office",
  "locksmith",
  "lodging",
  "meal_delivery",
  "meal_takeaway",
  "mosque",
  "movie_rental",
  "movie_theater",
  "moving_company",
  "museum",
  "night_club",
  "painter",
  "park",
  "parking",
  "pet_store",
  "pharmacy",
  "physiotherapist",
  "plumber",
  "police",
  "post_office",
  "primary_school",
  "real_estate_agency",
  "restaurant",
  "roofing_contractor",
  "rv_park",
  "school",
  "secondary_school",
  "shoe_store",
  "shopping_mall",
  "spa",
  "stadium",
  "storage",
  "store",
  "subway_station",
  "supermarket",
  "synagogue",
  "taxi_stand",
  "tourist_attraction",
  "train_station",
  "transit_station",
  "travel_agency",
  "university",
  "veterinary_care",
  "zoo",
];

# https://developers.google.com/maps/documentation/places/web-service/supported_types#table2
table2_types = [
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "administrative_area_level_4",
  "administrative_area_level_5",
  "administrative_area_level_6",
  "administrative_area_level_7",
  "archipelago",
  "colloquial_area",
  "continent",
  "country",
  "establishment",
  "finance",
  "floor",
  "food",
  "general_contractor",
  "geocode",
  "health",
  "intersection",
  "landmark",
  "locality",
  "natural_feature",
  "neighborhood",
  "place_of_worship",
  "plus_code",
  "point_of_interest",
  "political",
  "post_box",
  "postal_code",
  "postal_code_prefix",
  "postal_code_suffix",
  "postal_town",
  "premise",
  "room",
  "route",
  "street_address",
  "street_number",
  "sublocality",
  "sublocality_level_1",
  "sublocality_level_2",
  "sublocality_level_3",
  "sublocality_level_4",
  "sublocality_level_5",
  "subpremise",
  "town_square",
];

# Authentication middleware
def authenticate(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return make_response(jsonify({"error": "Authorization token is missing"}), 401)

        try:
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return make_response(jsonify({"error": "You are not authorized"}), 401)
    return decorated_function

@app.route('/api/recommend-cold-start', methods=['POST'])
def recommend_cold_start():
    # Get nearby places and user interests array from POST body
    content_type = request.headers.get('Content-Type')
    if (content_type != 'application/json'):
        return make_response(jsonify({"error": "Content type not application/json"}), 500)
    
    request_body = request.json
    # Array
    nearby_places = request_body["nearbyPlaces"]["results"]
    # Array
    user_interests = request_body["userInterests"]

    # Filter out nearby places that don't match user intestests
    relevant_interests = []
    for category in user_interests:
        if category in interests_dict:
            # Concat the two lists together
            relevant_interests += interests_dict[category]
    
    filtered_place_ids = {}
    for place_info in nearby_places:
        types = place_info["types"]
        # Figure out which categories the place falls under
        matching_interests = list(set(relevant_interests) & set(types))
        num_matching_interests = len(matching_interests)
        if (num_matching_interests in filtered_place_ids):
            filtered_place_ids[num_matching_interests].append(place_info["place_id"])
        else:
            filtered_place_ids[num_matching_interests] = [place_info["place_id"]]

    # Return filtered list
    return filtered_place_ids

def normalize(row: pd.Series) -> pd.Series:
    # don't factor the name of the place into normalization
    if "user_name" in row:
        selected = row.drop(["user_name"])
    # elif "place_name" in row:
    #     selected = row.drop(["place_name"])
    else:
        selected = row.drop(["place_name"])

    # compute the length of the vector using L2 normalization
    norm = np.linalg.norm(selected)
    if norm != 0:
        selected_normalized = selected / norm
        row.update(selected_normalized)
        return row
    return row

@app.route('/api/recommend', methods=['POST'])
@authenticate
def recommend():
    request_body = request.json
    return request_body
    # # Get place vectors that correspond to the nearby places
    # places_df = pd.json_normalize(request_body["nearbyPlaceVectors"])
    # # Get user vectors from database
    # historical_user_df = pd.json_normalize(request_body["userVectors"])
    # # join user and places on place_id 
    # user_places_df = pd.merge(historical_user_df, places_df, on="place_name")
    # # Sum all the columns of the newly created user-place table
    # users_summed = user_places_df.drop(["place_name"], axis=1).groupby("user_name").sum().reset_index()
    # # Normalize the user-place table
    # users_sum_normalized = users_summed.apply(normalize, axis=1)
    # # Normalize the places table
    # places_normalized_df = places_df.apply(normalize, axis=1)
    # # Drop useless columns for calculations
    # users_sum_normalized_copy = users_sum_normalized.drop(["user_name"], axis=1)
    # places_normalized_df_copy = places_normalized_df.drop(["place_name"], axis=1)
    # # Get cosine similarity between normalized places table and the normalized user-place table
    # users_places_similarity_df = cosine_similarity(users_sum_normalized_copy, places_normalized_df_copy)
    # # Return the similarity table
    # users_places_similarity_df = pd.DataFrame(users_places_similarity_df).transpose()
    # return pd.DataFrame.to_json(users_places_similarity_df)


# Start the server
if __name__ == '__main__':
    app.run(port=4000, debug=True)
from math import e
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from firebase_admin import initialize_app, auth, credentials
from dotenv import load_dotenv
import requests, os, json
from functools import wraps
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
from utils import normalize, create_places_df

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
            return make_response(jsonify({"error": e}), 500)
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

@app.route('/api/recommend', methods=['POST'])
@authenticate
def recommend():
    request_body = request.get_json()
    # Calculate place vectors that correspond to the nearby places
    nearby_places = request_body["places"]
    places_df = create_places_df(nearby_places)
    # Calculate user vectors from database from recent trips
    # historical_user_df = request_body["recentTrips"]
    return make_response(jsonify(places_df), 200)

    
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
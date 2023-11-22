from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from firebase_admin import initialize_app, auth, credentials, firestore
from dotenv import load_dotenv
import requests, os, json
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

cred = credentials.Certificate('tripwise-sdk-key.json')
fb_app = initialize_app(cred)

#Mapping user Interests to google API tags
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
            return make_response(jsonify({"error": "You are not authorized"}), 401)
    return decorated_function

@app.route('/api/recommend-cold-start', method=['POST'])
@authenticate
def recommend_cold_start():
    # Get nearby places and user interests array from POST body

    # Filter out nearby places that don't match user intestests

    # Return filtered list
    return 


@app.route('/api/recommend', methods=['POST'])
@authenticate
def recommend():
    # Get nearby places from POST body

    # Get user vector from database

    # join user and places on place_id 

    # Sum all the columns of the newly created user-place table

    # Normalize the user-place table

    # Normalize the places table

    # Get cosine similarity between normalized places table and the normalized user-place table

    # Return the similarity table
    return 


# Start the server
if __name__ == '__main__':
    app.run(port=3000, debug=True)
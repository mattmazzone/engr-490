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
    content_type = request.headers.get('Content-Type')
    if (content_type != 'application/json'):
        return make_response(jsonify({"error": "Content type not application/json"}), 500)
    
    request_body = request.json
    nearby_places = request_body["nearbyPlaces"]["results"]
    user_interests = request_body["userInterests"]

    # Filter out nearby places that don't match user intestests
    filtered_places = {}
    for place in nearby_places.items():
        pass
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
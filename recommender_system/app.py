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

# Authentication middleware
def autheticate(id_token):
    decoded_token = auth.verify_id_token(id_token)
    return decoded_token['uid']

# Profile route
@app.route('/api/profile/<userId>', methods=['GET'])
def profile(userId):
    try:
        id_token = request.headers.get("Authorization")
        # Will throw an exception if the token isn't valid
        autheticate(id_token)
        
        # Retreive user info
        db = firestore.client()
        doc = db.collection("users").document(userId).get()
        if not doc.exists:
            return make_response(jsonify({"status": 404, "msg": "User not found" })), 404
        userData = doc.to_dict()
        print(userData)

        return make_response(jsonify(userData)), 200
    except Exception as e:
        print(e)
        return make_response(jsonify({"status": 500, "msg": e.__doc__})), 500

# Route to get nearby places using Google Maps API
@app.route("/api/places/nearby/", methods=["GET"])
@authenticate
def get_nearby_places():
    included_types = request.args.get("includedTypes", "[restaurant]")
    max_result_count = int(request.args.get("maxResultCount", 10))
    latitude = float(request.args.get("latitude", 0.0))
    longitude = float(request.args.get("longitude", 0.0))
    radius = int(request.args.get("radius", 1000))
    try:
        included_types = json.loads(included_types)
        print(included_types)
    except json.JSONDecodeError:
        if isinstance(included_types, str):
            included_types = included_types.split(",")
        else:
            included_types = []

    payload = {
        "includedTypes": included_types,
        "maxResultCount": max_result_count,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "radius": radius
            }
        }
    }

    try:
        response = requests.post(
            "https://places.googleapis.com/v1/places:searchNearby",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": os.getenv("GOOGLE_MAPS_API_KEY"),
                "X-Goog-FieldMask": "places.displayName"
            }
        )
        return make_response(jsonify(response.json())), 200
    except Exception as e:
        # Error logging and handling
        print(f"Error getting nearby places: {e}")
        return make_response(jsonify({"error": str(e)})), 500

# Start the server
if __name__ == '__main__':
    app.run(port=3000, debug=True)
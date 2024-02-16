from math import e
import re
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from firebase_admin import initialize_app, auth, credentials
from dotenv import load_dotenv
import requests
import os
import json
from functools import wraps
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
from utils import create_df, create_rating_df, multiply_rating, create_scheduled_activities, create_interests_df
import json
from datetime import date, datetime, timedelta, time


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


@app.route('/api/recommend', methods=['POST'])
@authenticate
def recommend():
    request_body = request.get_json()
    nearby_places = request_body["nearbyPlaces"]
    recent_places = request_body["recentTripsPlaceDetails"]
    free_slots = request_body["freeSlots"]
    trip_meetings = request_body["tripMeetings"]
    interests = request_body['interests']

    if len(recent_places) < 5:
        # Use interests
        similarity_tables = []
        for places in nearby_places:
            # Create nearby places df
            nearby_places_df = create_df(places)

            interests_df = create_interests_df(interests)

            #  drop useless index column (calcultion purposes)
            nearby_places_df_copy = nearby_places_df.reset_index(drop=True)
            interests_df_copy = interests_df.reset_index(drop=True)

            # compute cosine similarity and convert back to df
            similarity_df = cosine_similarity(
                interests_df_copy, nearby_places_df_copy)
            similarity_df = pd.DataFrame(similarity_df)

            cols = {}
            for i in range(len(nearby_places_df.index)):
                cols[i] = nearby_places_df.index[i]
            similarity_df = similarity_df.rename(cols, axis=1)
            similarity_df = similarity_df.rename(
                index={0: 'similarity'})
            similarity_df = similarity_df.transpose()

            print(similarity_df)

            similarity_tables.append(similarity_df)

        scheduled_activities = create_scheduled_activities(
            similarity_tables, nearby_places, free_slots, trip_meetings)
        return make_response(jsonify({'scheduledActivities': scheduled_activities}), 200)

    else:
        # Create recent places df & user rating df for the recent places
        # Doesn't ever change
        recent_places_df = create_df(recent_places)
        # recent_place_ratings_df = create_rating_df(recent_places)

        similarity_tables = []
        # For each meeting location, get similarity scores for all nearby places in that location
        for places in nearby_places:
            # Create nearby places df
            nearby_places_df = create_df(places)

            #  drop useless index column (calcultion purposes)
            recent_places_df_copy = recent_places_df.reset_index(drop=True)
            nearby_places_df_copy = nearby_places_df.reset_index(drop=True)

            # compute cosine similarity and convert back to df
            similarity_df = cosine_similarity(
                recent_places_df_copy, nearby_places_df_copy)
            similarity_df = pd.DataFrame(similarity_df)

            # Rename columns and row indecies
            recent_place_ids = recent_places_df.index
            similarity_df = similarity_df.set_index(recent_place_ids)
            cols = {}
            for i in range(len(nearby_places_df.index)):
                cols[i] = nearby_places_df.index[i]
            similarity_df = similarity_df.rename(cols, axis=1)

            # DONT DELETE THIS
            # Weight all similarities by the normalized user rating (rating/5) of the recent place
            # recent_place_ratings = recent_place_ratings_df.to_dict()
            # weighted_similarity_df = similarity_df.apply(
            #     multiply_rating, axis=1, args=(recent_place_ratings,))

            # mean_vals_df = weighted_similarity_df.mean(axis=0).to_frame().rename(columns={
            #     0: 'similarity'}, errors='raise')
            # similarity_tables.append(mean_vals_df)

            mean_vals_df = similarity_df.mean(axis=0).to_frame().rename(columns={
                0: 'similarity'}, errors='raise')
            similarity_tables.append(mean_vals_df)

        scheduled_activities = create_scheduled_activities(
            similarity_tables, nearby_places, free_slots, trip_meetings)
        return make_response(jsonify({'scheduledActivities': scheduled_activities}), 200)


# Start the server
if __name__ == '__main__':
    app.run(port=4000, debug=True)

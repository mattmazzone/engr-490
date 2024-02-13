from math import e
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
from utils import create_df, create_rating_df, multiply_rating, create_scheduled_activities
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
            filtered_place_ids[num_matching_interests].append(
                place_info["place_id"])
        else:
            filtered_place_ids[num_matching_interests] = [
                place_info["place_id"]]

    # Return filtered list
    return filtered_place_ids


@app.route('/api/recommend', methods=['POST'])
@authenticate
def recommend():
    request_body = request.get_json()
    nearby_places = request_body["nearbyPlaces"]
    recent_places = request_body["recentTripsPlaceDetails"]
    free_slots = request_body["freeSlots"]
    trip_meetings = request_body["tripMeetings"]

    # Create recent places df & user rating df for the recent places
    # Doesn't ever change
    recent_places_df = create_df(recent_places)
    recent_place_ratings_df = create_rating_df(recent_places)

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

        # Weight all similarities by the normalized user rating (rating/5) of the recent place
        recent_place_ratings = recent_place_ratings_df.to_dict()
        weighted_similarity_df = similarity_df.apply(
            multiply_rating, axis=1, args=(recent_place_ratings,))

        mean_vals_df = weighted_similarity_df.mean(axis=0).to_frame().rename(columns={
            0: 'similarity'}, errors='raise')
        similarity_tables.append(mean_vals_df)

    scheduled_activities = create_scheduled_activities(
        similarity_tables, nearby_places, free_slots, trip_meetings)
    return make_response(jsonify({'scheduledActivities': scheduled_activities}), 200)


@app.route('/api/scheduleActivities', methods=['POST'])
@authenticate
def scheduleActivities():
    print("Started python")
    request_body = request.get_json()

    # Get the free time slots from the body
    freeTimeSlots = [{'start': '2024-02-04T08:00:00.000+00:00', 'end': '2024-02-04T23:00:00.000+00:00'},
                     {'start': '2024-02-05T08:00:00.000+00:00', 'end': '2024-02-05T23:00:00.000+00:00'}]

    # library test for activities and insert activities into the free time slots
    activities = [
        {"name": "Brunch", "types": "brunch_restaurant", "similarity": 0.8},
        {"name": "Breakfast Restaurant",
         "types": "breakfast_restaurant", "similarity": 0.7},
        {"name": "Dinner Restaurant",
         "types": "dinner_restaurant", "similarity": 0.6},
        {"name": "Restaurant", "types": "restaurant", "similarity": 0.5},
        {"name": "Mall", "types": "mall", "similarity": 0.4},
        {"name": "Store", "types": "store", "similarity": 0.3},
        {"name": "Paintball", "types": "paintball", "similarity": 0.9},
        {"name": "Library", "types": "library", "similarity": 0.7},
        {"name": "Historic Site", "types": "historic_site", "similarity": 0.6},
        {"name": "Arena", "types": "arena", "similarity": 0.8},
        {"name": "Morning Brunch", "types": "brunch_restaurant", "similarity": 0.85},
        {"name": "Sunrise Breakfast",
         "types": "breakfast_restaurant", "similarity": 0.72},
        {"name": "Evening Dinner", "types": "restaurant", "similarity": 0.65},
        {"name": "City Restaurant", "types": "restaurant", "similarity": 0.78},
        {"name": "Shopping Mall", "types": "mall", "similarity": 0.91},
        {"name": "Afternoon Tea", "types": "brunch_restaurant", "similarity": 0.82},
        {"name": "Morning Coffee",
         "types": "breakfast_restaurant", "similarity": 0.75},
        {"name": "Sunset Dinner", "types": "restaurant", "similarity": 0.68},
        {"name": "Cafe", "types": "restaurant", "similarity": 0.79},
        {"name": "Shopping Spree", "types": "mall", "similarity": 0.88},
        {"name": "Boutique", "types": "store", "similarity": 0.81},
        {"name": "Art Gallery Visit", "types": "historic_site", "similarity": 0.73},
        {"name": "Stadium Event", "types": "arena", "similarity": 0.85},
        {"name": "Outdoor Adventure", "types": "paintball", "similarity": 0.92},
        {"name": "Study Session", "types": "library", "similarity": 0.76},
        {"name": "Café Le Petit", "types": "restaurant", "similarity": 0.8},
        {"name": "Sunrise Diner", "types": "breakfast_restaurant", "similarity": 0.7},
        {"name": "Evening Bistro", "types": "restaurant", "similarity": 0.6},
        {"name": "Local Eatery", "types": "restaurant", "similarity": 0.5},
        {"name": "Fashion Plaza", "types": "mall", "similarity": 0.4},
        {"name": "Quick Stop", "types": "store", "similarity": 0.3},
        {"name": "Adventure Park", "types": "paintball", "similarity": 0.9},
        {"name": "Silent Library", "types": "library", "similarity": 0.7},
        {"name": "Heritage Museum", "types": "historic_site", "similarity": 0.6},
        {"name": "Sports Arena", "types": "arena", "similarity": 0.8},
        {"name": "Twilight Dining", "types": "restaurant", "similarity": 0.65},
        {"name": "Art Gallery", "types": "art_gallery", "similarity": 0.7},
        {"name": "Hiking Trail", "types": "hiking_trail", "similarity": 0.15}
        # Add more activities as needed
    ]

    # funcitons to get the timestamp and date string
    def timestamp_to_string(timestamp):
        dt_object = datetime.fromisoformat(timestamp)
        return dt_object.strftime("%Y-%m-%d %H:%M:%S")

    def datetime_to_timestamp(date_str):
        timestamp = date_str.isoformat()
        return timestamp

    # function to find the highest similarity activity and take into account the activities already scheduled
    def find_highest_similarity_activity(activities_scheduled, types, restaurant):
        sorted_activities = sorted(
            activities, key=lambda x: x['similarity'], reverse=True)
        if restaurant == True:
            for activity in sorted_activities:
                if activity not in activities_scheduled and activity["types"] in types:
                    return activity
        else:
            for activity in sorted_activities:
                if activity not in activities_scheduled and activity["types"] not in types:
                    return activity

        return activities[0]

    # Define the time slots for brunch/breakfast_restaurant, restaurant, and dinner
    breakfast_time_range = {"start": time(8, 0, 0), "end": time(10, 0, 0)}
    lunch_time_range = {"start":   time(12, 0, 0), "end": time(14, 0, 0)}
    dinner_time_range = {"start": time(18, 0, 0), "end": time(20, 0, 0)}

    # Initialize array to store scheduled activities
    activities_Scheduled = []

    # Initialize array to store trip meetings
    tripMeetings = []

    # Iterate through free time slots
    for slot in freeTimeSlots:
        # gather the start and end time of the slot with the date
        start_time = datetime.strptime(
            timestamp_to_string(slot['start']), "%Y-%m-%d %H:%M:%S")
        end_time = datetime.strptime(
            timestamp_to_string(slot['end']), "%Y-%m-%d %H:%M:%S")

        # Function to create meeting object based on free slot time
        def create_meeting(activity, start_time, end_time):
            return {
                "name": activity['name'],
                "type": activity['types'],
                "start": start_time,
                "end": end_time
            }

        # initializing previous meeting to none
        previous_meeting_type = None

        # if the time slots is longer than 1 hour, split it into 1 hour slots to create multiple meetings within that long slot
        interval_duration = timedelta(hours=1)
        current_time = start_time
        current_end_time = start_time + interval_duration

        # while loop to fill all the time slots within the long slot
        while current_end_time < end_time:
            # look at previous meeting if restaurant, brunch_restaurant, breakfast_restaurant, then skip to activities type
            if previous_meeting_type not in ['restaurant', 'brunch_restaurant', 'breakfast_restaurant']:
                # Determine the time range for the current slot
                if breakfast_time_range['start'] <= current_time.time() <= breakfast_time_range['end'] and breakfast_time_range['start'] <= current_end_time.time() <= breakfast_time_range['end']:
                    # find the activity that fits the breakfast rule and is not already scheduled
                    activity = find_highest_similarity_activity(
                        activities_Scheduled, ['brunch_restaurant', 'breakfast_restaurant'], True)
                    # append the activity to the scheduled activities array
                    activities_Scheduled.append(activity)
                    # create a meeting object and append it to the tripMeetings array
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(
                        current_time), datetime_to_timestamp(current_end_time)))
                elif lunch_time_range['start'] <= current_time.time() <= lunch_time_range['end'] and lunch_time_range['start'] <= current_end_time.time() <= lunch_time_range['end']:
                    # find the activity that fits the lunch rule and is not already scheduled
                    activity = find_highest_similarity_activity(
                        activities_Scheduled, ['restaurant'], True)
                    # append the activity to the scheduled activities array
                    activities_Scheduled.append(activity)
                    # create a meeting object and append it to the tripMeetings array
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(
                        current_time), datetime_to_timestamp(current_end_time)))
                elif dinner_time_range['start'] <= current_time.time() <= dinner_time_range['end'] and dinner_time_range['start'] <= current_end_time.time() <= dinner_time_range['end']:
                    # find the activity that fits the dinner rule
                    activity = find_highest_similarity_activity(
                        activities_Scheduled, ['restaurant'], True)
                    # append the activity to the scheduled activities array
                    activities_Scheduled.append(activity)
                    # create a meeting object and append it to the tripMeetings array
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(
                        current_time), datetime_to_timestamp(current_end_time)))
                else:
                    # For other time slots, select the highest similarity activity not of type restaurant, brunch, breakfast_restaurant and is not already scheduled
                    activity = find_highest_similarity_activity(activities_Scheduled, [
                                                                'restaurant', 'brunch_restaurant', 'breakfast_restaurant'], False)
                    # append the activity to the scheduled activities array
                    activities_Scheduled.append(activity)
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(
                        current_time), datetime_to_timestamp(current_end_time)))
            else:
                # For other time slots, select the highest similarity activity not of type restaurant, brunch, breakfast_restaurant and is not already scheduled
                activity = find_highest_similarity_activity(activities_Scheduled, [
                                                            'restaurant', 'brunch_restaurant', 'breakfast_restaurant'], False)
                # append the activity to the scheduled activities array
                activities_Scheduled.append(activity)
                tripMeetings.append(create_meeting(activity, datetime_to_timestamp(
                    current_time), datetime_to_timestamp(current_end_time)))

            # getting the type of previous meeting
            previous_meeting_type = activity['types']

            # Increment the current time with its interval of 1 hour by the interval duration (1 hour)
            current_time += interval_duration
            current_end_time += interval_duration

    print("Schedule: ", tripMeetings)
    return make_response(jsonify({"meetings": tripMeetings}), 200)


# Start the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)

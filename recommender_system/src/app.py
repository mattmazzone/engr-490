from math import e
from tracemalloc import start
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from firebase_admin import initialize_app, auth, credentials
import requests, os, json
from functools import wraps
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from utils import normalize, create_df
from datetime import datetime, timedelta, time

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
    nearby_places = request_body["nearbyPlaces"]
    nearby_places_df = create_df(nearby_places['places'])
    # Calculate user vectors from database from recent trips
    recent_trips = request_body["recentTripsPlaceDetails"]
    recent_places_df = create_df(recent_trips)
    # Aggregate ALL rows and sum all the rows to make a one row dataframe 
    recent_places_summed = recent_places_df.groupby(lambda f: True).sum().reset_index().drop(["index"], axis=1)
    # Normalize the recent places table
    recent_places_normalized_df = recent_places_summed.apply(normalize, axis=1)
    print(recent_places_normalized_df[['university','school','ramen_restaurant','japanese_restaurant','restaurant']])
    # Normalize the places table
    nearby_places_normalized_df = nearby_places_df.apply(normalize, axis=1)
    # Drop useless columns for calculations
    recent_places_normalized_df_copy = recent_places_normalized_df.reset_index(drop=True)
    nearby_places_normalized_df_copy = nearby_places_normalized_df.reset_index(drop=True)
    # Get cosine similarity between normalized places table and the normalized user-place table
    users_places_similarity_df = cosine_similarity(recent_places_normalized_df_copy, nearby_places_normalized_df_copy)
    # Return the similarity table
    users_places_similarity_df = pd.DataFrame(users_places_similarity_df).transpose()
    # set the index to place ids instead
    place_ids = nearby_places_df.index
    users_places_similarity_df = users_places_similarity_df.set_index(place_ids)
    users_places_similarity_df = users_places_similarity_df.rename(columns={0 : "similarity"})
    return make_response(users_places_similarity_df.to_dict(), 200)


@app.route('/api/scheduleActivities', methods=['POST'])
@authenticate
def scheduleActivities():
    print("Started python")
    request_body = request.get_json()
    
    #Get the free time slots from the body
    freeTimeSlots = [{'start': '2024-02-04T08:00:00.000+00:00', 'end': '2024-02-05T23:00:00.000+00:00'}, 
                     {'start': '2024-02-05T08:00:00.000+00:00', 'end': '2024-02-06T23:00:00.000+00:00'}, 
                     {'start': '2024-02-06T08:00:00.000+00:00', 'end': '2024-02-06T16:45:00.000+00:00'}, 
                     {'start': '2024-02-06T18:45:00.000+00:00', 'end': '2024-02-07T23:00:00.000+00:00'}, 
                     {'start': '2024-02-07T08:00:00.000+00:00', 'end': '2024-02-08T23:00:00.000+00:00'}, 
                     {'start': '2024-02-08T08:00:00.000+00:00', 'end': '2024-02-09T23:00:00.000+00:00'}, 
                     {'start': '2024-02-09T08:00:00.000+00:00', 'end': '2024-02-10T23:00:00.000+00:00'}, 
                     {'start': '2024-02-10T08:00:00.000+00:00', 'end': '2024-02-11T23:00:00.000+00:00'}]
    print(freeTimeSlots)
    
    #library test for activities and insert activities into the free time slots
    activities = [
            {"name": "Brunch", "types": "brunch_restaurant", "similarity": 0.8},
            {"name": "Breakfast Restaurant", "types": "breakfast_restaurant", "similarity": 0.7},
            {"name": "Dinner Restaurant", "types": "dinner_restaurant", "similarity": 0.6},
            {"name": "Restaurant", "types": "restaurant", "similarity": 0.5},
            {"name": "Mall", "types": "mall", "similarity": 0.4},
            {"name": "Store", "types": "store", "similarity": 0.3},
            {"name": "Paintball", "types": "paintball", "similarity": 0.9},
            {"name": "Library", "types": "library", "similarity": 0.7},
            {"name": "Historic Site", "types": "historic_site", "similarity": 0.6},
            {"name": "Arena", "types": "arena", "similarity": 0.8}
            # Add more activities as needed
        ]

    # Function to convert timestamp to time string
    def timestamp_to_time(timestamp):
        # Convert the timestamp to a datetime object
        dt_object = datetime.fromisoformat(timestamp)
        # Extract the time portion and format it as HH:MM:SS
        return dt_object.time().isoformat()
    
    def timestamp_to_date(timestamp):
        dt_object = datetime.fromisoformat(timestamp)
        return dt_object.strftime("%Y-%m-%d")
    
    def datetime_to_timestamp(date_str, time_str):
        dt_object = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
        timestamp = dt_object.isoformat()
        return timestamp

    # Define the time slots for brunch/breakfast_restaurant, restaurant, and dinner
    breakfast_time_range = {"start": time(8,0,0), "end": time(10,0,0)}
    lunch_time_range = {"start":   time(12,0,0), "end": time(14,0,0)}
    dinner_time_range = {"start": time(18,0,0), "end": time(20,0,0)}
    print("Time ranges")
    print(breakfast_time_range['start'], breakfast_time_range['end'])
    print(lunch_time_range['start'], lunch_time_range['end'])
    print(dinner_time_range['start'], dinner_time_range['end'])

    activites_Scheduled = []

    # Iterate through free time slots
    for slot in freeTimeSlots:
        #gather the start and end time of the slot with the date
        start_time = datetime.strptime(timestamp_to_time(slot['start']), "%H:%M:%S").time()
        end_time = datetime.strptime(timestamp_to_time(slot['end']), "%H:%M:%S").time()
        date = timestamp_to_date(slot['start'])
        print("Time: ")
        print("Start time: ", start_time)
        print("End time: ", end_time)
        print("Date: ", date)

        # Function to create meeting object based on free slot time
        def create_meeting(activity, start_time, end_time):
            return {
                "location": activity['name'],
                "start": start_time,
                "end": end_time
            }
        
        # Initialize array to store trip meetings
        tripMeetings = []

        # initializing previous meeting to none
        previous_meeting_type = None

        #if the time slots is longer than 1 hour, split it into 1 hour slots to create multiple meetings within that long slot
        interval_duration = timedelta(hours=1)
        current_time = start_time
        dummy_date = datetime(2000,1,1).date()
        end_datetime = datetime.combine(dummy_date, current_time) + interval_duration
        current_end_time = end_datetime.time()
        print("Time of current and end current time:")
        print(current_time)
        print(current_end_time)
        
        #while loop to fill all the time slots within the long slot
        while current_end_time < end_time:
            # look at previous meeting if restaurant, brunch_restaurant, breakfast_restaurant, then skip to activities type
            if previous_meeting_type not in ['restaurant', 'brunch_restaurant', 'breakfast_restaurant']:
                # Determine the time range for the current slot
                if breakfast_time_range['start'] <= current_time <= breakfast_time_range['end'] and breakfast_time_range['start'] <= current_end_time <= breakfast_time_range['end']:
                    #find the activity that fits the breakfast rule
                    activity = max([act for act in activities if act['types'] in ['brunch_restaurant', 'breakfast_restaurant']], key=lambda x: x['similarity'])
                    #create a meeting object and append it to the tripMeetings array
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(date,current_time), datetime_to_timestamp(date,current_end_time)))
                elif lunch_time_range['start'] <= current_time <= lunch_time_range['end'] and lunch_time_range['start'] <= current_end_time <= lunch_time_range['end']:
                    #find the activity that fits the lunch rule
                    activity = max([act for act in activities if act['types'] == 'restaurant'], key=lambda x: x['similarity'])
                    #create a meeting object and append it to the tripMeetings array
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(date,current_time), datetime_to_timestamp(date,current_end_time)))
                elif dinner_time_range['start'] <= current_time <= dinner_time_range['end'] and dinner_time_range['start'] <= current_end_time <= dinner_time_range['end']:
                    #find the activity that fits the dinner rule
                    activity = max([act for act in activities if act['types'] == 'restaurant'], key=lambda x: x['similarity'])
                    #create a meeting object and append it to the tripMeetings array
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(date,current_time), datetime_to_timestamp(date,current_end_time)))
                else:
                    # For other time slots, select the highest similarity activity not of type restaurant, brunch, breakfast_restaurant
                    activity = max([act for act in activities if act['types'] not in ['restaurant', 'brunch_restaurant', 'breakfast_restaurant']], key=lambda x: x['similarity'])
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(date,current_time), datetime_to_timestamp(date,current_end_time)))
            else:
                # For other time slots, select the highest similarity activity not of type restaurant, brunch, breakfast_restaurant
                activity = max([act for act in activities if act['types'] not in ['restaurant', 'brunch_restaurant', 'breakfast_restaurant']], key=lambda x: x['similarity'])
                tripMeetings.append(create_meeting(activity, datetime_to_timestamp(date,current_time), datetime_to_timestamp(date,current_end_time)))

            #getting the type of previous meeting
            previous_meeting_type = activity['types']

            # Increment the current time with its interval of 1 hour by the interval duration (1 hour)d
            dummy_date = datetime(2000,1,1).date()
            start_datetime = datetime.combine(dummy_date, current_time) + interval_duration
            end_datetime = start_datetime + interval_duration
            current_time = start_datetime.time()
            current_end_time = end_datetime.time()
            print(current_time)
            print(current_end_time)

    print(tripMeetings)
    return make_response(jsonify({"meetings": tripMeetings}), 200)

# Start the server
if __name__ == '__main__':
    app.run(port=4000, debug=True)
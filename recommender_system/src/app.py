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
from utils import create_df, create_rating_df, multiply_rating, create_scheduled_activities, create_interests_df, calculate_similarity_score, convert_opening_hours
import json
from datetime import date, datetime, timedelta, time


load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

cred = credentials.Certificate(os.path.join(
    os.path.dirname(__file__), '../tripwise-sdk-key.json'))
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
            return make_response(jsonify({"error": e}), 500)
    return decorated_function


foodTypes = {
#Categories
    "100-1000-0000": "Restaurant",
    "100-1000-0001": "Casual Dining",
    "100-1000-0002": "Fine Dining",
    "100-1000-0003": "Take Out and Delivery Only",
    "100-1000-0004": "Food Market-Stall",
    "100-1000-0005": "Taqueria",
    "100-1000-0006": "Deli",
    "100-1000-0007": "Cafeteria",
    "100-1000-0008": "Bistro",
    "100-1000-0009": "Fast Food",
    "100-1100-0000": "Coffee-Tea",
    "100-1100-0010": "Coffee Shop",
    "100-1100-0331": "Tea House",
    #Cuisines
  "101-000": "American",
  "101-001": "American-Californian",
  "101-002": "American-Southwestern",
  "101-003": "American-Barbecue/Southern",
  "101-004": "American-Creole",
  "101-039": "American-Native American",
  "101-040": "American-Soul Food",
  "101-070": "American-Cajun",
  "102-000": "Mexican",
  "102-005": "Mexican-Yucateca",
  "102-006": "Mexican-Oaxaquena",
  "102-007": "Mexican-Veracruzana",
  "102-008": "Mexican-Poblana",
  "103-000": "Canadian",
  "150-000": "Australian",
  "151-000": "Hawaiian/Polynesian",
  "152-000": "Caribbean",
  "153-000": "Cuban",
  "200-000": "Asian",
  "201-000": "Chinese",
  "201-009": "Chinese-Szechuan",
  "201-010": "Chinese-Cantonese",
  "201-041": "Chinese-Shanghai",
  "201-042": "Chinese-Beijing",
  "201-043": "Chinese-Hunan/Hubei",
  "201-044": "Chinese-Jiangsu/Zhejiang",
  "201-045": "Chinese-Shandong",
  "201-046": "Chinese-Northeastern",
  "201-047": "Chinese-Inner Mongolian",
  "201-048": "Chinese-Yunnan/Guizhou",
  "201-049": "Chinese-Taiwanese",
  "201-050": "Chinese-Guangxi",
  "201-051": "Chinese-Jiangxi",
  "201-052": "Chinese-Northwestern",
  "201-053": "Chinese-Porridge",
  "201-054": "Chinese-Islamic",
  "201-055": "Chinese-Hot Pot",
  "202-000": "Indian",
  "202-011": "Indian-Tandoori",
  "202-012": "Indian-Punjabi",
  "202-013": "Indian-Rajasthani",
  "202-014": "Indian-Mughlai",
  "202-015": "Indian-Bengali",
  "202-016": "Indian-Goan",
  "202-017": "Indian-Jain",
  "202-018": "Indian-Konkani",
  "202-019": "Indian-Gujarati",
  "202-020": "Indian-Parsi",
  "202-021": "Indian-South Indian",
  "202-022": "Indian-Maharashtrian",
  "202-023": "Indian-North Indian",
  "202-024": "Indian-Malvani",
  "202-025": "Indian-Hyderabadi",
  "203-000": "Japanese",
  "203-026": "Japanese-Sushi",
  "204-000": "Southeast Asian",
  "205-000": "Thai",
  "206-000": "Vietnamese",
  "207-000": "Korean",
  "208-000": "Pakistani",
  "209-000": "Malaysian",
  "210-000": "Bruneian",
  "211-000": "Indonesian",
  "212-000": "Filipino",
  "250-000": "Middle Eastern",
  "251-000": "Azerbaijani",
  "252-000": "Turkish",
  "253-000": "Lebanese",
  "254-000": "Yemeni",
  "255-000": "Burmese",
  "256-000": "Cambodian",
  "257-000": "Singaporean",
  "258-000": "Sri Lankan",
  "259-000": "Tibetan",
  "300-000": "European",
  "301-000": "French",
  "301-027": "French-Alsatian",
  "301-028": "French-Auvergnate",
  "301-029": "French-Basque",
  "301-030": "French-Corse",
  "301-031": "French-Lyonnaise",
  "301-032": "French-Provencale",
  "301-033": "French-Sud-ouest",
  "302-000": "German",
  "303-000": "Greek",
  "304-000": "Italian",
  "305-000": "Irish",
  "306-000": "Austrian",
  "307-000": "Belgian",
  "308-000": "British Isles",
  "309-000": "Dutch",
  "310-000": "Swiss",
  "311-000": "Spanish",
  "311-034": "Spanish-Tapas",
  "313-000": "Portuguese",
  "314-000": "Maltese",
  "315-000": "Sicilian",
  "350-000": "Scandinavian",
  "351-000": "Finnish",
  "352-000": "Swedish",
  "353-000": "Norwegian",
  "354-000": "Danish",
  "370-000": "East European",
  "371-000": "Hungarian",
  "372-000": "Mediterranean",
  "373-000": "Baltic",
  "374-000": "Belorusian",
  "375-000": "Ukrainian",
  "376-000": "Polish",
  "377-000": "Russian",
  "378-000": "Bohemian",
  "379-000": "Balkan",
  "380-000": "Caucasian",
  "381-000": "Romanian",
  "382-000": "Armenian",
  "404-000": "Argentinean",
  "406-000": "Brazilian",
  "406-035": "Brazilian-Baiana",
  "406-038": "Brazilian-Bakery",
  "406-036": "Brazilian-Capixaba",
  "406-037": "Brazilian-Mineira",
  "405-000": "Chilean",
  "403-000": "Latin American",
  "407-000": "Peruvian",
  "400-000": "South American",
  "401-000": "Surinamese",
  "402-000": "Venezuelan",
  "500-000": "African",
  "501-000": "Moroccan",
  "502-000": "Egyptian",
  "503-000": "Ethiopian",
  "504-000": "Seychellois",
  "505-000": "South African",
  "506-000": "North African",
  "600-000": "Oceanic",
  "800-056": "Steak House",
  "800-057": "Pizza",
  "800-058": "Snacks and Beverages",
  "800-059": "Hot Dogs",
  "800-060": "Sandwich",
  "800-061": "Breakfast",
  "800-062": "Chicken",
  "800-063": "Ice Cream",
  "800-064": "International",
  "800-065": "Continental",
  "800-066": "Fusion",
  "800-067": "Burgers",
  "800-068": "Creperie",
  "800-069": "Pastries",
  "800-071": "Fondue",
  "800-072": "Brunch",
  "800-073": "Bistro",
  "800-074": "BrewPub",
  "800-075": "Seafood",
  "800-076": "Vegan",
  "800-077": "Vegetarian",
  "800-078": "Grill",
  "800-079": "Jewish/Kosher",
  "800-080": "Soup",
  "800-081": "Lunch",
  "800-082": "Dinner",
  "800-083": "Natural/Healthy",
  "800-084": "Organic",
  "800-085": "Noodles"
}

@app.route('/api/recommend', methods=['POST'])
@authenticate
def recommend():

    #Call function to get list of google recommendations
        #Check if meetings has any slots that has locations
        #create table of pastTrips 
    
        #if true -> loop through each meeting
                            #call api to get 20 random places per meeting based of location and interests
                            #generate table based off places and pastTrips
                            #create a dictionary of [random place, similarityScore] for each place 
        #if false -> call api api to get 20 random places per meeting based of USERSETlocation and interests


    #SEND create SCHEDULE(googleAPIplaces[place, score], HEREAPIplaces, meetings, tripStartTime, tripEndTime)
            #go through googleAPIplaces

    request_body = request.get_json()
    nearby_places_object = request_body["nearbyPlaces"]
    nearby_places = []
    for object in nearby_places_object:
        if "places" in object:
            nearby_places.append(object["places"])
    time_zones = []
    for object in nearby_places_object:
        if "timeZone" in object:
            time_zones.append(object["timeZone"])
    recent_places = request_body["recentTripsPlaceDetails"]
    free_slots = request_body["freeSlots"]
    trip_meetings = request_body["tripMeetings"]
    interests = request_body['interests']
    nearbyRestaurants = request_body['nearbyRestaurants']
    recentRestaurants = request_body['recentRestaurants']
    
    
    
    restoTypeList = list(foodTypes.keys())
    
    # Extracting the restaurants from the interests
    pattern = re.compile(r'^\d{3}-\d{3}$')
    resto_interests = [interest for interest in interests if pattern.match(interest)]
    
    if len(recent_places) < 5:
        print("Interests:")
        for day, categories in nearbyRestaurants.items():
            for category, restaurants in categories.items():  # Iterate over each category within the day
                for restaurant in restaurants:  # Iterate over each restaurant in the category
                    # Convert the opening hours
                    restaurant["openingHours"] = convert_opening_hours(restaurant["openingHours"])
                    # Calculate the similarity score for the restaurant based on user interests
                    restaurant["similarity"] = calculate_similarity_score(restaurant, [{'place_similarity': {'types': resto_interests}}], all_types=restoTypeList)
    else:
        # Do similarity based off past Trips
        for day, categories in nearbyRestaurants.items():
            for category, restaurants in categories.items():  # Iterate over each category within the day
                for restaurant in restaurants:  # Iterate over each restaurant in the category
                    # Convert the opening hours
                    restaurant["openingHours"] = convert_opening_hours(restaurant["openingHours"])
                    # Calculate and add similarity score to each restaurant
                    restaurant["similarity"] = calculate_similarity_score(restaurant, recentRestaurants, all_types=restoTypeList)



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
            similarity_tables, nearby_places, free_slots, trip_meetings, time_zones)
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
            similarity_tables, nearby_places, free_slots, trip_meetings, time_zones)
        return make_response(jsonify({'scheduledActivities': scheduled_activities}), 200)



@app.route('/api/scheduleActivities', methods=['POST'])
@authenticate
def scheduleActivities():
    print("Started python")
    request_body = request.get_json()

    #Get the free time slots from the body
    freeTimeSlots = [{'start': '2024-02-04T08:00:00.000+00:00', 'end': '2024-02-04T23:00:00.000+00:00'}, 
                     {'start': '2024-02-05T08:00:00.000+00:00', 'end': '2024-02-05T23:00:00.000+00:00'}]
    
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
            {"name": "Arena", "types": "arena", "similarity": 0.8},
            {"name": "Morning Brunch", "types": "brunch_restaurant", "similarity": 0.85},
            {"name": "Sunrise Breakfast", "types": "breakfast_restaurant", "similarity": 0.72},
            {"name": "Evening Dinner", "types": "restaurant", "similarity": 0.65},
            {"name": "City Restaurant", "types": "restaurant", "similarity": 0.78},
            {"name": "Shopping Mall", "types": "mall", "similarity": 0.91},
            {"name": "Afternoon Tea", "types": "brunch_restaurant", "similarity": 0.82},
            {"name": "Morning Coffee", "types": "breakfast_restaurant", "similarity": 0.75},
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

    #funcitons to get the timestamp and date string
    def timestamp_to_string(timestamp):
        dt_object = datetime.fromisoformat(timestamp)
        return dt_object.strftime("%Y-%m-%d %H:%M:%S")
    
    def datetime_to_timestamp(date_str):
        timestamp = date_str.isoformat()
        return timestamp
    
    #function to find the highest similarity activity and take into account the activities already scheduled
    def find_highest_similarity_activity(activities_scheduled, types, restaurant):
        sorted_activities = sorted(activities, key=lambda x: x['similarity'], reverse=True)
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
    breakfast_time_range = {"start": time(8,0,0), "end": time(10,0,0)}
    lunch_time_range = {"start":   time(12,0,0), "end": time(14,0,0)}
    dinner_time_range = {"start": time(18,0,0), "end": time(20,0,0)}

    # Initialize array to store scheduled activities
    activities_Scheduled = []

    # Initialize array to store trip meetings
    tripMeetings = []

    # Iterate through free time slots
    for slot in freeTimeSlots:
        #gather the start and end time of the slot with the date
        start_time = datetime.strptime(timestamp_to_string(slot['start']), "%Y-%m-%d %H:%M:%S")
        end_time = datetime.strptime(timestamp_to_string(slot['end']), "%Y-%m-%d %H:%M:%S")

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

        #if the time slots is longer than 1 hour, split it into 1 hour slots to create multiple meetings within that long slot
        interval_duration = timedelta(hours=1)
        current_time = start_time
        current_end_time = start_time + interval_duration
        
        #while loop to fill all the time slots within the long slot
        while current_end_time < end_time:
            # look at previous meeting if restaurant, brunch_restaurant, breakfast_restaurant, then skip to activities type
            if previous_meeting_type not in ['restaurant', 'brunch_restaurant', 'breakfast_restaurant']:
                # Determine the time range for the current slot
                if breakfast_time_range['start'] <= current_time.time() <= breakfast_time_range['end'] and breakfast_time_range['start'] <= current_end_time.time() <= breakfast_time_range['end']:
                    #find the activity that fits the breakfast rule and is not already scheduled
                    activity = find_highest_similarity_activity(activities_Scheduled, ['brunch_restaurant', 'breakfast_restaurant'], True)
                    # append the activity to the scheduled activities array
                    activities_Scheduled.append(activity)
                    #create a meeting object and append it to the tripMeetings array
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(current_time), datetime_to_timestamp(current_end_time)))
                elif lunch_time_range['start'] <= current_time.time() <= lunch_time_range['end'] and lunch_time_range['start'] <= current_end_time.time() <= lunch_time_range['end']:
                    #find the activity that fits the lunch rule and is not already scheduled
                    activity = find_highest_similarity_activity(activities_Scheduled, ['restaurant'], True)
                    # append the activity to the scheduled activities array
                    activities_Scheduled.append(activity)
                    #create a meeting object and append it to the tripMeetings array
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(current_time), datetime_to_timestamp(current_end_time)))
                elif dinner_time_range['start'] <= current_time.time() <= dinner_time_range['end'] and dinner_time_range['start'] <= current_end_time.time() <= dinner_time_range['end']:
                    #find the activity that fits the dinner rule
                    activity = find_highest_similarity_activity(activities_Scheduled, ['restaurant'], True)
                    # append the activity to the scheduled activities array
                    activities_Scheduled.append(activity)
                    #create a meeting object and append it to the tripMeetings array
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(current_time), datetime_to_timestamp(current_end_time)))
                else:
                    # For other time slots, select the highest similarity activity not of type restaurant, brunch, breakfast_restaurant and is not already scheduled
                    activity = find_highest_similarity_activity(activities_Scheduled, ['restaurant', 'brunch_restaurant', 'breakfast_restaurant'], False)
                    # append the activity to the scheduled activities array
                    activities_Scheduled.append(activity)
                    tripMeetings.append(create_meeting(activity, datetime_to_timestamp(current_time), datetime_to_timestamp(current_end_time)))
            else:
                # For other time slots, select the highest similarity activity not of type restaurant, brunch, breakfast_restaurant and is not already scheduled
                activity = find_highest_similarity_activity(activities_Scheduled, ['restaurant', 'brunch_restaurant', 'breakfast_restaurant'], False)
                # append the activity to the scheduled activities array
                activities_Scheduled.append(activity)
                tripMeetings.append(create_meeting(activity, datetime_to_timestamp(current_time), datetime_to_timestamp(current_end_time)))

            #getting the type of previous meeting
            previous_meeting_type = activity['types']

            # Increment the current time with its interval of 1 hour by the interval duration (1 hour)
            current_time += interval_duration
            current_end_time += interval_duration

    print("Schedule: ",tripMeetings)
    return make_response(jsonify({"meetings": tripMeetings}), 200)

# Start the server
if __name__ == '__main__':
    app.run(port=4000, debug=True)

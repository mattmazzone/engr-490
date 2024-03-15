from ast import Raise
from calendar import week
from contextlib import closing
import copy
from datetime import date, datetime, timedelta, time, timezone
from weakref import ref
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import random
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re

# https://developers.google.com/maps/documentation/places/web-service/place-types
place_types = {
    # Table A
    "car_dealer": 0,
    "car_rental": 0,
    "car_repair": 0,
    "car_wash": 0,
    "electric_vehicle_charging_station": 0,
    "gas_station": 0,
    "parking": 0,
    "rest_stop": 0,
    "farm": 0,
    "art_gallery": 0,
    "museum": 0,
    "performing_arts_theater": 0,
    "library": 0,
    "preschool": 0,
    "primary_school": 0,
    "school": 0,
    "secondary_school": 0,
    "university": 0,
    "amusement_center": 0,
    "amusement_park": 0,
    "aquarium": 0,
    "banquet_hall": 0,
    "bowling_alley": 0,
    "casino": 0,
    "community_center"
    "convention_center": 0,
    "cultural_center": 0,
    "dog_park": 0,
    "event_venue": 0,
    "hiking_area": 0,
    "historical_landmark": 0,
    "marina": 0,
    "movie_rental": 0,
    "movie_theater": 0,
    "national_park": 0,
    "night_club": 0,
    "park": 0,
    "tourist_attraction": 0,
    "visitor_center": 0,
    "wedding_venue": 0,
    "zoo": 0,
    "accounting": 0,
    "atm": 0,
    "bank": 0,
    "american_restaurant"
    "bakery": 0,
    "bar": 0,
    "barbecue_restaurant": 0,
    "brazilian_restaurant": 0,
    "breakfast_restaurant": 0,
    "brunch_restaurant": 0,
    "cafe": 0,
    "chinese_restaurant": 0,
    "coffee_shop": 0,
    "fast_food_restaurant": 0,
    "french_restaurant": 0,
    "greek_restaurant": 0,
    "hamburger_restaurant": 0,
    "ice_cream_shop": 0,
    "indian_restaurant": 0,
    "indonesian_restaurant": 0,
    "italian_restaurant": 0,
    "japanese_restaurant": 0,
    "korean_restaurant": 0,
    "lebanese_restaurant": 0,
    "meal_delivery": 0,
    "meal_takeaway": 0,
    "mediterranean_restaurant": 0,
    "mexican_restaurant": 0,
    "middle_eastern_restaurant": 0,
    "pizza_restaurant": 0,
    "ramen_restaurant": 0,
    "restaurant": 0,
    "sandwich_shop": 0,
    "seafood_restaurant": 0,
    "spanish_restaurant": 0,
    "steak_house": 0,
    "sushi_restaurant": 0,
    "thai_restaurant": 0,
    "turkish_restaurant": 0,
    "vegan_restaurant": 0,
    "vegetarian_restaurant": 0,
    "vietnamese_restaurant": 0,
    "administrative_area_level_1": 0,
    "administrative_area_level_2": 0,
    "country": 0,
    "locality": 0,
    "postal_code": 0,
    "school_district": 0,
    "city_hall": 0,
    "courthouse": 0,
    "embassy": 0,
    "fire_station": 0,
    "local_government_office": 0,
    "police": 0,
    "post_office": 0,
    "dental_clinic": 0,
    "dentist": 0,
    "doctor": 0,
    "drugstore": 0,
    "hospital": 0,
    "medical_lab": 0,
    "pharmacy": 0,
    "physiotherapist": 0,
    "spa": 0,
    "bed_and_breakfast"
    "campground": 0,
    "camping_cabin": 0,
    "cottage": 0,
    "extended_stay_hotel": 0,
    "farmstay": 0,
    "guest_house": 0,
    "hostel": 0,
    "hotel": 0,
    "lodging": 0,
    "motel": 0,
    "private_guest_room": 0,
    "resort_hotel": 0,
    "rv_park": 0,
    "church": 0,
    "hindu_temple": 0,
    "mosque": 0,
    "synagogue": 0,
    "barber_shop": 0,
    "beauty_salon": 0,
    "cemetery": 0,
    "child_care_agency": 0,
    "consultant": 0,
    "courier_service": 0,
    "electrician": 0,
    "florist": 0,
    "funeral_home": 0,
    "hair_care": 0,
    "hair_salon": 0,
    "insurance_agency": 0,
    "laundry": 0,
    "lawyer": 0,
    "locksmith": 0,
    "moving_company": 0,
    "painter": 0,
    "plumber": 0,
    "real_estate_agency": 0,
    "roofing_contractor": 0,
    "storage": 0,
    "tailor": 0,
    "telecommunications_service_provider": 0,
    "travel_agency": 0,
    "veterinary_care": 0,
    "auto_parts_store": 0,
    "bicycle_store": 0,
    "book_store": 0,
    "cell_phone_store": 0,
    "clothing_store": 0,
    "convenience_store": 0,
    "department_store": 0,
    "discount_store": 0,
    "electronics_store": 0,
    "furniture_store": 0,
    "gift_shop": 0,
    "grocery_store": 0,
    "hardware_store": 0,
    "home_goods_store": 0,
    "home_improvement_store": 0,
    "jewelry_store": 0,
    "liquor_store": 0,
    "market": 0,
    "pet_store": 0,
    "shoe_store": 0,
    "shopping_mall": 0,
    "sporting_goods_store": 0,
    "store": 0,
    "supermarket": 0,
    "wholesaler": 0,
    "athletic_field": 0,
    "fitness_center": 0,
    "golf_course": 0,
    "gym": 0,
    "playground": 0,
    "ski_resort": 0,
    "sports_club": 0,
    "sports_complex": 0,
    "stadium": 0,
    "swimming_pool": 0,
    "airport": 0,
    "bus_station": 0,
    "bus_stop": 0,
    "ferry_terminal": 0,
    "heliport": 0,
    "light_rail_station": 0,
    "park_and_ride": 0,
    "subway_station": 0,
    "taxi_stand": 0,
    "train_station": 0,
    "transit_depot": 0,
    "transit_station": 0,
    "truck_stop": 0,

    # Table B
    # "administrative_area_level_3":0,
    # "administrative_area_level_4":0,
    # "administrative_area_level_5":0,
    # "administrative_area_level_6":0,
    # "administrative_area_level_7":0,
    "archipelago": 0,
    # "colloquial_area":0,
    # "continent":0,
    # "establishment":0,
    # "floor":0,
    # "food":0,
    # "general_contractor":0,
    # "geocode":0,
    # "health":0,
    # "intersection":0,
    # "landmark":0,
    "natural_feature": 0,
    # "neighborhood":0,
    # "place_of_worship":0,
    # "plus_code": 0,
    # "point_of_interest":0,
    # "political":0,
    # "post_box":0,
    # "postal_code_prefix":0,
    # "postal_code_suffix":0,
    # "postal_town":0,
    # "premise":0,
    # "room":0,
    # "route":0,
    # "street_address":0,
    # "street_number":0,
    # "sublocality":0,
    # "sublocality_level_1":0,
    # "sublocality_level_2":0,
    # "sublocality_level_3":0,
    # "sublocality_level_4":0,
    # "sublocality_level_5":0,
    # "subpremise":0,
    # "town_square":0,
}


# Transforms the json returned from the google places api into a
# properly formatted dataframe (1s and 0s, not normalized yet).
# Add a print at the end to see what the df looks like
def create_df(google_places_json) -> pd.DataFrame:
    data = []
    row_indices = []
    for place in google_places_json:
        types = place['types']
        place_types_copy = copy.deepcopy(place_types)
        for type in types:
            # should always be true
            if type in place_types_copy:
                place_types_copy[type] = 1
        data.append(place_types_copy)
        row_indices.append(place['id'])

    places_df = pd.DataFrame(data, index=row_indices)
    return places_df


def create_rating_df(recent_places) -> pd.DataFrame:
    recent_places_ratings = []
    for place in recent_places:
        rating = {}
        rating['id'] = place['id']
        rating['rating'] = place['rating']
        recent_places_ratings.append(rating)
    data = []
    row_indices = []
    for place in recent_places_ratings:
        data.append({'rating': place['rating']})
        row_indices.append(place['id'])

    return pd.DataFrame(data, index=row_indices)


def multiply_rating(row: pd.Series, recent_place_ratings) -> pd.Series:
    rating: float = recent_place_ratings['rating'][row.name]
    normalized_rating = rating / 5
    row_weighted = row * normalized_rating
    row.update(row_weighted)
    return row


def is_same_day(date1: datetime, date2: datetime) -> bool:
    return date1.year == date2.year and date1.month == date2.month and date1.day == date2.day


def find_relavent_meeting(trip_meetings, end_time):
    for i in range(len(trip_meetings)):
        meeting = trip_meetings[i]
        if meeting['start'] >= end_time:
            return i

    return -1

def addHighestRestaurant(places, nearby_places_picked, start_time, end_time):
    if start_time.weekday() == 6:
        weekday = 0
    else:
        weekday = start_time.weekday()+1
    
    for place in places:
        newIndex = weekday
        change = False
        best_place_id = place['placeId']
        #make sure there is information when accessing the regular opening hours of the place
        openingHours = place.get('openingHours')
        if openingHours is None:
            continue
        if best_place_id not in nearby_places_picked:
            for i in range(len(place['openingHours'])):
                if weekday == openingHours[i]['open']['day']:
                    newIndex = i
                    change = True
                    break
            if change == False & newIndex == weekday:
                continue
            #get the opening time
            openingDay = place['openingHours'][newIndex]['open']['day']
            openingHour = place['openingHours'][newIndex]['open']['hour']
            openingMinute = place['openingHours'][newIndex]['open']['minute']
            openingTime = time(openingHour, openingMinute)
            #get the closing time
            closingDay = place['openingHours'][newIndex]['close']['day']
            closingHour = place['openingHours'][newIndex]['close']['hour']
            closingMinute = place['openingHours'][newIndex]['close']['minute']
            if closingHour == 24:
                closingHour = 0
                closingDay = closingDay + 1
            closingTime = time(closingHour, closingMinute)

            print("Opening time: ", openingTime)
            print("Start time: ", start_time.time())
            print("End time: ", end_time.time())
            print ("Closing time: ", closingTime) 

            if openingTime <= start_time.time() and (openingDay != closingDay or closingTime >= end_time.time()):
                nearby_places_picked.add(best_place_id)
                return {'place_id': best_place_id, 'place_name': place['title'], 'address': place['address'], 'score': place['similarity'], 'types': place['types']}

# Function to parse datetime with multiple formats        
def parse_datetime(date_str, format_str):
    
    for fmt in format_str:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Time data '{date_str}' does not match any format in {format_str}")



def addHighestPlace(places, nearby_places_picked, start_time, end_time):
    if start_time.weekday() == 6:
        weekday = 0
    else:
        weekday = start_time.weekday()+1

    for place in places:
        best_place_id = place['info']['id']
        #make sure there is information when accessing the regular opening hours of the place
        openingHours = place['info'].get('regularOpeningHours')
        information = place.get('info')
        if openingHours is None or information is None:
            continue
        if best_place_id not in nearby_places_picked:
            #make sure to select the right index for the day of the week
            if len(place['info']['regularOpeningHours']['periods']) < 7:
                comparison = weekday
                change = False
                for i in range(len(place['info']['regularOpeningHours']['periods'])-1):
                    if weekday == place['info']['regularOpeningHours']['periods'][i]['open']['day']:
                        weekday = i
                        change = True
                        break
                if weekday == comparison and change == False:
                    continue    
            
            #get the opening time
            openingDay = place['info']['regularOpeningHours']['periods'][weekday]['open']['day']
            openingHour = place['info']['regularOpeningHours']['periods'][weekday]['open']['hour']
            openingMinute = place['info']['regularOpeningHours']['periods'][weekday]['open']['minute']
            openingTime = time(openingHour, openingMinute)
            
            #get the closing time
            closingDay = place['info']['regularOpeningHours']['periods'][weekday]['close']['day']
            closingHour = place['info']['regularOpeningHours']['periods'][weekday]['close']['hour']
            closingMinute = place['info']['regularOpeningHours']['periods'][weekday]['close']['minute']
            closingTime = time(closingHour, closingMinute)

            print("Opening time: ", openingTime)
            print("Start time: ", start_time.time())
            print("End time: ", end_time.time())
            print ("Closing time: ", closingTime) 

            if openingTime <= start_time.time() and (openingDay != closingDay or closingTime >= end_time.time()):
                nearby_places_picked.add(best_place_id)
                return {'place_id': best_place_id, 'place_name': place['info']['displayName']['text'], 'address': place['info']['formattedAddress'], 'score': place['similarity']}

def create_scheduled_activities(similarity_tables, nearby_places, free_slots, trip_meetings, time_zones, nearbyRestaurants):
    format_trips = ['%Y-%m-%dT%H:%M:%S%z', '%Y-%m-%dT%H:%M:%S.%f%z', '%Y-%m-%dT%H:%M:%S.%f%Z']
    format_slots = ['%Y-%m-%dT%H:%M:%S.%f%z',
                    '%Y-%m-%dT%H:%M:%S.%f%Z',]
    activity_duration = timedelta(hours=1.5)
    broken_up_free_slots = []
    

    for index,meeting in enumerate(trip_meetings):
        meeting['start'] = parse_datetime(meeting['start'], format_trips)
        meeting['end'] = parse_datetime(meeting['end'], format_trips)
        timezone_offset = timedelta(seconds=time_zones[index]['rawOffset'] + time_zones[index]['dstOffset'])
        meeting['start'] = meeting['start'] + timezone_offset
        meeting['end'] = meeting['end'] + timezone_offset

    trip_meetings.sort(key=lambda x: x['start'])

    for slot in free_slots:
        formatted = False
        for format in format_slots:
            try:
                slot_start = datetime.strptime(slot['start'], format)
                slot_start = slot_start.replace(tzinfo=timezone.utc)
                slot_end = datetime.strptime(slot['end'],  format)
                slot_end = slot_end.replace(tzinfo=timezone.utc)
                timezone_offset = timedelta(seconds=time_zones[0]['rawOffset'] + time_zones[0]['dstOffset'])
                new_timezone = timezone(timedelta(hours = ((timezone_offset.seconds/3600) - 24)))
                slot_start = slot_start + timezone_offset
                slot_start = slot_start.replace(tzinfo=new_timezone)
                slot_end = slot_end + timezone_offset
                slot_end = slot_end.replace(tzinfo=new_timezone)

                current_end = slot_start + activity_duration
                while current_end <= slot_end:
                    current_start = current_end - activity_duration
                    broken_up_free_slots.append(
                        {"start": current_start, "end": current_end})
                    current_end = current_end + activity_duration
                formatted = True
                break
            except Exception as e:
                print(e)

        if not formatted:
            raise ValueError('No valid date format found')

    if len(trip_meetings) == 0:
        # Since there are no trip meetings, there can only be 1 similarity table and 1 nearby places array
        if len(nearby_places) != 1 or len(similarity_tables) != 1:
            raise ValueError(
                "nearby_places or similarity_table incorrect length")

        for slot in broken_up_free_slots:
            slot['place_similarity'] = similarity_tables[0]
            slot['places_dict'] = nearby_places[0]
    else:
        trip_meetings.sort(key=lambda x: x['start'])

        for i in range(len(similarity_tables)):
            trip_meetings[i]['nearby_place_similarities'] = similarity_tables[i]

        for slot in broken_up_free_slots:
            index = find_relavent_meeting(trip_meetings, slot['end'])
            relevant_meeting = trip_meetings[index]
            slot['place_similarity'] = relevant_meeting['nearby_place_similarities']
            slot['places_dict'] = nearby_places[index]

    nearby_places_picked = set()
    breakfast_time_range = {"start": time(8, 0, 0), "end": time(10, 0, 0)}
    lunch_time_range = {"start":   time(12, 0, 0), "end": time(14, 0, 0)}
    dinner_time_range = {"start": time(18, 0, 0), "end": time(20, 0, 0)}

    #start the day index to the first day of the trip for the restaurant
    dayIndex = 0

    #schedule places in free time slots
    for i in range(len(broken_up_free_slots)):
        slot = broken_up_free_slots[i]
        slot_start = slot['start']
        slot_end = slot['end']
        similarity_table: pd.DataFrame = slot['place_similarity']
        places_dict = slot['places_dict']

        breakfast_places = nearbyRestaurants[str(dayIndex)]["breakfast"]
        lunch_places = nearbyRestaurants[str(dayIndex)]["lunch"]
        dinner_places = nearbyRestaurants[str(dayIndex)]["dinner"]
        other_places = []

        for place in places_dict:
            sim = similarity_table.loc[place['id'], 'similarity']
            obj = {"info": place, "similarity": sim}
            if 'breakfast_restaurant' not in place['types'] and 'coffee_shop' not in place['types'] and 'cafe' not in place['types'] and 'brunch_restaurant' not in place['types'] and 'restaurant' not in place['types']:
                other_places.append(obj)

        breakfast_places = sorted(
            breakfast_places, key=lambda x: x['similarity'])
        lunch_places = sorted(
            lunch_places, key=lambda x: x['similarity'])
        dinner_places = sorted(
            dinner_places, key=lambda x: x['similarity'])
        other_places = sorted(
            other_places, key=lambda x: x['similarity'])


        highestPlace = None
        if len(breakfast_places) > 0 and breakfast_time_range['start'] <= slot_start.time() and slot_end.time() <= breakfast_time_range['end']:
            slot['place_similarity'] = addHighestRestaurant(
                breakfast_places, nearby_places_picked, slot_start, slot_end)
        elif len(lunch_places) > 0 and lunch_time_range['start'] <= slot_start.time() and slot_end.time() <= lunch_time_range['end']:
            slot['place_similarity'] = addHighestRestaurant(
                lunch_places, nearby_places_picked, slot_start, slot_end)
        elif len(dinner_places) > 0 and dinner_time_range['start'] <= slot_start.time() and slot_end.time() <= dinner_time_range['end']:
            slot['place_similarity'] = addHighestRestaurant(
                dinner_places, nearby_places_picked, slot_start, slot_end)
        else:
            slot['place_similarity'] = addHighestPlace(
                other_places, nearby_places_picked, slot_start, slot_end)
        del slot['places_dict']

        #change index to the next day if the next free time slot is on the next day of trip
        if i < len(broken_up_free_slots)-1 and broken_up_free_slots[i]['end'].weekday() != broken_up_free_slots[i+1]['start'].weekday():
            print("Day index changed")
            print("Day end free time slot:", broken_up_free_slots[i]['end'].weekday())
            print("Day start next free time slot:", broken_up_free_slots[i+1]['start'].weekday())
            dayIndex += 1
    
    filtered_data = [entry for entry in broken_up_free_slots if entry['place_similarity'] is not None]

    #raise NotImplemented('WIP')
    return filtered_data


def create_interests_df(interests):
    data = []
    place_types_copy = copy.deepcopy(place_types)
    for type in interests:
        # Should always be true
        if type in place_types_copy:
            place_types_copy[type] = random.uniform(0.75, 1)
    data.append(place_types_copy)
    interests_df = pd.DataFrame(data)
    return interests_df


def create_type_vector(item_types, all_types):
    """Create a binary vector for the item types based on all_types."""
    return [1 if typ in item_types else 0 for typ in all_types]

def calculate_cosine_similarity(vector1, vector2):
    """Calculate cosine similarity between two vectors."""
    v1, v2 = np.array(vector1).reshape(1, -1), np.array(vector2).reshape(1, -1)
    return cosine_similarity(v1, v2)[0][0]

def calculate_similarity_score(current_item, past_items, all_types):
    """
    Calculate the maximum cosine similarity score between the current item and past items based on their types.

    Parameters:
    - current_item: dict with 'types' key representing categories of the current item.
    - past_items: list of dicts, each with a 'types' key representing categories of past items.
    - all_types: list or set of all predefined unique types for vectorization.

    Returns:
    - max_similarity: The highest cosine similarity score between the current item and any of the past items.
    """
    
    # Create binary vectors for the current and past items types
    current_vector = np.array(create_type_vector(current_item['types'], all_types)).reshape(1, -1)
    
    # Initialize max similarity
    max_similarity = 0
    
    # Iterate through past items to calculate similarities
    for past_item in past_items:
        past_types = past_item['place_similarity']['types']
        past_vector = np.array(create_type_vector(past_types, all_types)).reshape(1, -1)
        similarity = cosine_similarity(current_vector, past_vector)[0][0]
        max_similarity = max(max_similarity, similarity)
    
    return max_similarity


def parse_time(time_str):
    """Parse a time string into hour and minute."""
    hour, minute = map(int, time_str.split(':'))
    return hour, minute

def day_range_to_numbers(day_range):
    """Converts day ranges into a list of day numbers (0=Sunday, 6=Saturday)."""
    day_map = {'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0}
    if '-' in day_range:
        start_day, end_day = day_range.split('-')
        start_num, end_num = day_map[start_day.strip()], day_map[end_day.strip()]
        return list(range(start_num, end_num + 1)) if start_num <= end_num else list(range(start_num, 7)) + list(range(0, end_num + 1))
    else:
        return [day_map[day_range.strip()]]

def convert_opening_hours(opening_hours_list):
    all_days = set(range(7))  # Representing days as 0-6 for Sun-Sat
    results = []
    open_days = set()

    for hours_list in opening_hours_list:
        for hours in hours_list:
            # Splitting the days part and the hours part
            days_part, hours_part = hours.split(': ', 1)
            time_ranges = [time_range.strip() for time_range in hours_part.split(',')]

            # Parse the days, which might be ranges or individual days
            if ',' in days_part:
                days = [day.strip() for day in days_part.split(',')]
            else:
                days = [days_part]

            for day in days:
                day_nums = day_range_to_numbers(day)
                open_days.update(day_nums)
                for day_num in day_nums:
                    for time_range in time_ranges:
                        start_time_str, end_time_str = time_range.split(' - ')
                        start_hour, start_minute = parse_time(start_time_str)
                        end_hour, end_minute = parse_time(end_time_str)

                        # Adjusting for the case when the end time is 24:00, which is equivalent to 00:00 of the next day
                        if end_hour == 24:
                            end_hour = 0
                            end_minute = 0
                            day_num = (day_num + 1) % 7

                        results.append({
                            "open": {"day": day_num, "hour": start_hour, "minute": start_minute},
                            "close": {"day": day_num, "hour": end_hour, "minute": end_minute},
                        })

    # Determine closed days
    closed_days = all_days - open_days
    for closed_day in closed_days:
        results.append({
            "open": {"day": closed_day, "hour": 0, "minute": 0},
            "close": {"day": closed_day, "hour": 0, "minute": 0},
        })

    # Sort results by day and opening time for consistency
    results.sort(key=lambda x: (x['open']['day'], x['open']['hour'], x['open']['minute']))

    return results

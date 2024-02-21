from ast import Raise
import copy
from datetime import date, datetime, timedelta, time
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import random
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

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


def addHighestPlace(places, nearby_places_picked):
    for place in places:
        best_place_id = place['info']['id']
        if best_place_id not in nearby_places_picked:
            nearby_places_picked.add(best_place_id)
            return {'place_id': best_place_id, 'place_name': place['info']['displayName']['text'], 'address': place['info']['formattedAddress'], 'score': place['similarity']}


def create_scheduled_activities(similarity_tables, nearby_places, free_slots, trip_meetings):
    format_trips = '%Y-%m-%dT%H:%M:%S%z'
    format_slots = '%Y-%m-%dT%H:%M:%S.%f%z'
    activity_duration = timedelta(hours=1.5)
    broken_up_free_slots = []

    for meeting in trip_meetings:
        meeting['start'] = datetime.strptime(meeting['start'], format_trips)
        meeting['end'] = datetime.strptime(meeting['end'], format_trips)

    trip_meetings.sort(key=lambda x: x['start'])

    for i in range(len(similarity_tables)):
        trip_meetings[i]['nearby_place_similarities'] = similarity_tables[i]

    for slot in free_slots:
        start = datetime.strptime(slot['start'], format_slots)
        end = datetime.strptime(slot['end'],  format_slots)
        current_end = start + activity_duration
        while current_end <= end:
            current_start = current_end - activity_duration
            broken_up_free_slots.append(
                {"start": current_start, "end": current_end})
            current_end = current_end + activity_duration

    for slot in broken_up_free_slots:
        index = find_relavent_meeting(trip_meetings, slot['end'])
        relevant_meeting = trip_meetings[index]
        slot['place_similarity'] = relevant_meeting['nearby_place_similarities']
        slot['places_dict'] = nearby_places[index]

    nearby_places_picked = set()
    breakfast_time_range = {"start": time(8, 0, 0), "end": time(10, 0, 0)}
    lunch_time_range = {"start":   time(12, 0, 0), "end": time(14, 0, 0)}
    dinner_time_range = {"start": time(18, 0, 0), "end": time(20, 0, 0)}

    for i in range(len(broken_up_free_slots)):
        slot = broken_up_free_slots[i]
        slot_start = slot['start']
        slot_end = slot['end']
        similarity_table: pd.DataFrame = slot['place_similarity']
        places_dict = slot['places_dict']

        breakfast_places = []
        restaurant_places = []
        other_places = []

        for place in places_dict:
            sim = similarity_table.loc[place['id'], 'similarity']
            obj = {"info": place, "similarity": sim}
            if 'breakfast_restaurant' in place['types'] or 'coffee_shop' in place['types'] or 'cafe' in place['types'] or 'brunch_restaurant' in place['types']:
                breakfast_places.append(obj)
            elif 'restaurant' in place['types']:
                restaurant_places.append(obj)
            else:
                other_places.append(obj)

        breakfast_places = sorted(
            breakfast_places, key=lambda x: x['similarity'], reverse=True)
        restaurant_places = sorted(
            restaurant_places, key=lambda x: x['similarity'], reverse=True)
        other_places = sorted(
            other_places, key=lambda x: x['similarity'], reverse=True)

        if len(breakfast_places) > 0 and breakfast_time_range['start'] <= slot_start.time() and slot_end.time() <= breakfast_time_range['end']:
            slot['place_similarity'] = addHighestPlace(
                breakfast_places, nearby_places_picked)
        elif len(restaurant_places) > 0 and ((lunch_time_range['start'] <= slot_start.time() and slot_end.time() <= lunch_time_range['end']) or (dinner_time_range['start'] <= slot_start.time() and slot_end.time() <= dinner_time_range['end'])):
            slot['place_similarity'] = addHighestPlace(
                restaurant_places, nearby_places_picked)
        else:
            slot['place_similarity'] = addHighestPlace(
                other_places, nearby_places_picked)
        del slot['places_dict']

    # raise NotImplemented('WIP')
    return broken_up_free_slots


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
        past_vector = np.array(create_type_vector(past_item['types'], all_types)).reshape(1, -1)
        similarity = cosine_similarity(current_vector, past_vector)[0][0]
        max_similarity = max(max_similarity, similarity)
    
    return max_similarity


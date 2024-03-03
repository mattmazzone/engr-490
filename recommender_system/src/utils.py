from ast import Raise
import copy
from datetime import date, datetime, timedelta, time, timezone
from weakref import ref
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import random

# https://developers.google.com/maps/documentation/places/web-service/place-types
#FOR duration: integer represents hour
#FOR maxAmountPerDay, integer represents number of times to go per day
#FOR MorningOrAftertoonOrEvening
#Morning only: 1 (8am-12pm)
#Afternoon only: 2 (12pm-6pm)
#Evening only: 3 (6pm-11pm)
#Morning or afternoon: 4
#Morning or Evening: 5
#Afternoon or Evening: 6
#All three/any: 0
place_types = {
    "cultural_center" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "chinese_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "japanese_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "indonesian_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "korean_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "ramen_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "sushi_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "vietnamese_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "thai_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "lebanese_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "middle_eastern_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "turkish_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "american_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "barbecue_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "hamburger_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "pizza_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "cafe" : {"duration": 0.5,"maxAmountPerDay": 3,"MorningOrAftertoonOrEvening": 4},
    "bakery" : {"duration": 0.25,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1},
    "sandwich_shop" : {"duration": 0.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1},
    "breakfast_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1},
    "brunch_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1},
    "italian_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "mediterranean_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "greek_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "vegan_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "vegetarian_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "brazilian_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "mexican_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "amusement_park" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "aquarium" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "bowling_alley" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "casino" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "movie_theater" : {"duration": 2.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "national_park" : {"duration": 3,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "hiking_area" : {"duration": 3,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "night_club" : {"duration": 3,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 3},
    "tourist_attraction" : {"duration": 2,"maxAmountPerDay": 10,"MorningOrAftertoonOrEvening": 0},
    "zoo" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "historical_landmark" : {"duration": 1,"maxAmountPerDay": 5,"MorningOrAftertoonOrEvening": 4},
    "spa" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "church" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "hindu_temple" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "mosque" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "synagogue" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "book_store" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "clothing_store" : {"duration": 0.5,"maxAmountPerDay": 10,"MorningOrAftertoonOrEvening": 0},
    "gift_shop" : {"duration": 0.5,"maxAmountPerDay": 2,"MorningOrAftertoonOrEvening": 0},
    "jewelry_store" : {"duration": 0.5,"maxAmountPerDay": 2,"MorningOrAftertoonOrEvening": 0},
    "liquor_store" : {"duration": 0.25,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "shopping_mall" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "golf_course" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "gym" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "playground" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "ski_resort" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "sports_club" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "swimming_pool" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
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
    place_types[place]["duration"]
    for place in places:
        best_place_id = place['info']['id']
        amount = place_types[place['types']]["maxAmountPerDay"] 
        if best_place_id not in nearby_places_picked and amount > 0:
            nearby_places_picked.add(best_place_id)
            place_types[place['types']]["maxAmountPerDay"]-1
            return {'place_id': best_place_id, 'place_name': place['info']['displayName']['text'], 'address': place['info']['formattedAddress'], 'score': place['similarity']}


def create_scheduled_activities(similarity_tables, nearby_places, free_slots, trip_meetings, time_zones):
    format_trips = '%Y-%m-%dT%H:%M:%S%z'
    format_slots = '%Y-%m-%dT%H:%M:%S.%f%z'
    activity_duration = timedelta(hours=1.5)
    broken_up_free_slots = []

    for index,meeting in enumerate(trip_meetings):
        meeting['start'] = datetime.strptime(meeting['start'], format_trips)
        meeting['end'] = datetime.strptime(meeting['end'], format_trips)
        timezone_offset = timedelta(seconds=time_zones[index]['rawOffset'] + time_zones[index]['dstOffset'])
        meeting['start'] = meeting['start'] + timezone_offset
        meeting['end'] = meeting['end'] + timezone_offset

    trip_meetings.sort(key=lambda x: x['start'])

    for i in range(len(similarity_tables)):
        trip_meetings[i]['nearby_place_similarities'] = similarity_tables[i]

    for slot in free_slots:
        slot_start = datetime.strptime(slot['start'], format_slots)
        slot_start = slot_start.replace(tzinfo=timezone.utc)
        slot_end = datetime.strptime(slot['end'],  format_slots)
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

import copy
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np

place_types = {
    # https://developers.google.com/maps/documentation/places/web-service/supported_types#table1
    "accounting": 0,
    "airport": 0,
    "amusement_park": 0,
    "aquarium": 0,
    "art_gallery": 0,
    "atm": 0,
    "bakery": 0,
    "bank": 0,
    "bar": 0,
    "beauty_salon": 0,
    "bicycle_store": 0,
    "book_store": 0,
    "bowling_alley": 0,
    "bus_station": 0,
    "cafe": 0,
    "campground": 0,
    "car_dealer": 0,
    "car_rental": 0,
    "car_repair": 0,
    "car_wash": 0,
    "casino": 0,
    "cemetery": 0,
    "church": 0,
    "city_hall": 0,
    "clothing_store": 0,
    "convenience_store": 0,
    "courthouse": 0,
    "dentist": 0,
    "department_store": 0,
    "doctor": 0,
    "drugstore": 0,
    "electrician": 0,
    "electronics_store": 0,
    "embassy": 0,
    "fire_station": 0,
    "florist": 0,
    "funeral_home": 0,
    "furniture_store": 0,
    "gas_station": 0,
    "gym": 0,
    "hair_care": 0,
    "hardware_store": 0,
    "hindu_temple": 0,
    "home_goods_store": 0,
    "hospital": 0,
    "insurance_agency": 0,
    "jewelry_store": 0,
    "laundry": 0,
    "lawyer": 0,
    "library": 0,
    "light_rail_station": 0,
    "liquor_store": 0,
    "local_government_office": 0,
    "locksmith": 0,
    "lodging": 0,
    "meal_delivery": 0,
    "meal_takeaway": 0,
    "mosque": 0,
    "movie_rental": 0,
    "movie_theater": 0,
    "moving_company": 0,
    "museum": 0,
    "night_club": 0,
    "painter": 0,
    "park": 0,
    "parking": 0,
    "pet_store": 0,
    "pharmacy": 0,
    "physiotherapist": 0,
    "plumber": 0,
    "police": 0,
    "post_office": 0,
    "primary_school": 0,
    "real_estate_agency": 0,
    "restaurant": 0,
    "roofing_contractor": 0,
    "rv_park": 0,
    "school": 0,
    "secondary_school": 0,
    "shoe_store": 0,
    "shopping_mall": 0,
    "spa": 0,
    "stadium": 0,
    "storage": 0,
    "store": 0,
    "subway_station": 0,
    "supermarket": 0,
    "synagogue": 0,
    "taxi_stand": 0,
    "tourist_attraction": 0,
    "train_station": 0,
    "transit_station": 0,
    "travel_agency": 0,
    "university": 0,
    "veterinary_care": 0,
    "zoo": 0,

    # https://developers.google.com/maps/documentation/places/web-service/supported_types#table2
    "administrative_area_level_1": 0,
    "administrative_area_level_2": 0,
    "administrative_area_level_3": 0,
    "administrative_area_level_4": 0,
    "administrative_area_level_5": 0,
    "administrative_area_level_6": 0,
    "administrative_area_level_7": 0,
    "archipelago": 0,
    "colloquial_area": 0,
    "continent": 0,
    "country": 0,
    "establishment": 0,
    "finance": 0,
    "floor": 0,
    "food": 0,
    "general_contractor": 0,
    "geocode": 0,
    "health": 0,
    "intersection": 0,
    "landmark": 0,
    "locality": 0,
    "natural_feature": 0,
    "neighborhood": 0,
    "place_of_worship": 0,
    "plus_code": 0,
    "point_of_interest": 0,
    "political": 0,
    "post_box": 0,
    "postal_code": 0,
    "postal_code_prefix": 0,
    "postal_code_suffix": 0,
    "postal_town": 0,
    "premise": 0,
    "room": 0,
    "route": 0,
    "street_address": 0,
    "street_number": 0,
    "sublocality": 0,
    "sublocality_level_1": 0,
    "sublocality_level_2": 0,
    "sublocality_level_3": 0,
    "sublocality_level_4": 0,
    "sublocality_level_5": 0,
    "subpremise": 0,
    "town_square": 0,
}

def create_places_df(nearby_places) -> pd.DataFrame:
    data = []
    row_indices = []
    print(f'nearby_places \n {nearby_places}')
    for place in nearby_places['places']:
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

def create_historical_user_df(recent_trips) -> pd.DataFrame:
    pass


def normalize(row: pd.Series) -> pd.Series:
    # don't factor the name of the place into normalization
    if "user_name" in row:
        selected = row.drop(["user_name"])
    # elif "place_name" in row:
    #     selected = row.drop(["place_name"])
    else:
        selected = row.drop(["place_name"])

    # compute the length of the vector using L2 normalization
    norm = np.linalg.norm(selected)
    if norm != 0:
        selected_normalized = selected / norm
        row.update(selected_normalized)
        return row
    return row
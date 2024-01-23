import os
import requests
from dotenv import load_dotenv
import json
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
load_dotenv()

def performSimilarity():
    pastTrips_dict = getPastTripCategories('Here_pastTrips.json')
    nearbyRestaurants_dict = getRestaurants(45.501690, -73.567253)

    # Flatten the lists of ids to be suitable for vectorization
    pastTrips_ids = [' '.join(ids) for ids in pastTrips_dict.values()]
    nearbyRestaurants_ids = [' '.join(ids) for ids in nearbyRestaurants_dict.values()]

    # Vectorize
    vectorizer = CountVectorizer()
    all_vectors = vectorizer.fit_transform(pastTrips_ids + nearbyRestaurants_ids)

    # Split back into pastTrips and nearbyRestaurants vectors
    pastTrips_vectors = all_vectors[:len(pastTrips_ids)]
    nearbyRestaurants_vectors = all_vectors[len(pastTrips_ids):]

    # Calculate cosine similarity
    similarity_matrix = cosine_similarity(pastTrips_vectors, nearbyRestaurants_vectors)

    # Create a mapping of past trip IDs to their similarity scores
    similarity_scores = {}
    for i, trip_id in enumerate(pastTrips_dict.keys()):
        scores = similarity_matrix[i, :]
        similarity_scores[trip_id] = dict(zip(nearbyRestaurants_dict.keys(), scores))

    return similarity_scores


def getRestaurants(latitude, longitude):


    # Define the API endpoint
    url = "https://discover.search.hereapi.com/v1/discover"

    # Define the parameters for the GET request
    params = {
        "at": f"{latitude},{longitude}",
        "q": 'restaurant',  # Use the joined categories string
        "limit": 10,
        "apiKey": os.getenv('HERE_API_KEY')
    }

    # Make the GET request
    response = requests.get(url, params=params)
    restaurants_dict = {}

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()

        # Loop through each item in the response
        for item in data.get("items", []):
            # Extract placeId
            place_id = item.get("id", None)
            if place_id:
                # Extract categories.ids and foodTypes.ids and combine them
                combined_ids = [category["id"] for category in item.get("categories", [])]
                combined_ids.extend([foodType["id"] for foodType in item.get("foodTypes", [])])
                # Add to the dictionary
                restaurants_dict[place_id] = combined_ids

        return restaurants_dict
    else:
        # Print an error message
        print(f"Error: {response.status_code}")
        return None

 
def lookupPlaceById(place_id):
    """
    Retrieves detailed information about a place using its unique identifier (ID).

    Parameters:
    - place_id (str): The unique identifier of the place.
    - api_key (str): Your HERE API key.

    Returns:
    - The JSON response containing place details.
    - OR an error message in case of a failure.
    """

    # Define the URL for the lookupbyid endpoint
    url = f"https://lookup.search.hereapi.com/v1/lookup?id={place_id}&apiKey={os.getenv('HERE_API_KEY')}"

    # Make the GET request
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        # Print an error message
        print(f"Error: {response.status_code}")
        return None

def getPastTripCategories(jsonFile):
    with open(jsonFile, 'r') as file:
        data = json.load(file)

    # Initialize a dictionary to hold the combined data
    Trip_data = {}

    for trip in data["PastTrips"]:
        # Use lookupPlaceById to get details
        trip_info = lookupPlaceById(trip["id"])

        # Check if the request was successful
        if 'title' in trip_info:
            # Extract foodTypes.id and categories.id and combine them
            combined_ids = [ft['id'] for ft in trip_info.get('foodTypes', [])]
            combined_ids.extend([cat['id'] for cat in trip_info.get('categories', [])])

            # Save the extracted information using placeId as key
            Trip_data[trip["id"]] = combined_ids
        else:
            print(f"Failed to retrieve information for place ID {trip['id']}")

    return Trip_data

sim = performSimilarity()
print(sim)
# Example usage
#print(getRestaurants(45.501690, -73.567253))
#print(lookupPlaceById("here:pds:place:124f25dv-8088f3b8fa254722bb293a233de1a289"))

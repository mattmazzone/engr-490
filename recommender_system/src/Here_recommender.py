import os
import requests
from dotenv import load_dotenv
import json
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
load_dotenv()

def performSimilarity(pasTripList, x_coord, y_coord):
    pastTrips_dict = getPastTripCategories(pasTripList)
    nearbyRestaurants_dict = getRestaurants(x_coord, y_coord)

    # Flatten the lists of ids to be suitable for vectorization
    pastTrips_ids = [' '.join(ids) for ids in pastTrips_dict.values()]
    nearbyRestaurants_ids = [' '.join(rest["ids"]) for rest in nearbyRestaurants_dict.values()]

    # Vectorize
    vectorizer = CountVectorizer()
    all_vectors = vectorizer.fit_transform(pastTrips_ids + nearbyRestaurants_ids)

    # Aggregate pastTrips vectors into a single vector by averaging
    pastTrips_vectors = all_vectors[:len(pastTrips_ids)]
    aggregated_pastTrips_vector = np.mean(pastTrips_vectors, axis=0)
    aggregated_pastTrips_array = np.asarray(aggregated_pastTrips_vector).reshape(1, -1)

    # Get nearbyRestaurants vectors
    nearbyRestaurants_vectors = all_vectors[len(pastTrips_ids):]

    # Calculate cosine similarity
    similarity_scores = cosine_similarity(aggregated_pastTrips_array, nearbyRestaurants_vectors).flatten()
    # Construct the final dictionary with additional details
    final_dict = {}
    for rest_id, rest_details in nearbyRestaurants_dict.items():
        similarity_score = similarity_scores[list(nearbyRestaurants_dict.keys()).index(rest_id)]
        final_dict[rest_id] = {
            "name": rest_details["name"],
            "location": rest_details["location"],
            "openingHours": rest_details["openingHours"],
            "similarityScore": similarity_score
        }

    return final_dict


def getRestaurants(latitude, longitude):


    # Define the API endpoint
    url = "https://discover.search.hereapi.com/v1/discover"

    # Define the parameters for the GET request
    params = {
        "at": f"{latitude},{longitude}",
        "q": 'restaurant',  # Use the joined categories string
        "limit": 1,
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
            place_name = item.get("title", "Unknown Place")
            location = item.get("address", {}).get("label", "Unknown Location")
            opening_hours = item.get("openingHours", [{"text": ["No information"]}])[0].get("text", ["No information"])

            if place_id:
                # Extract categories.ids and foodTypes.ids and combine them
                combined_ids = [category["id"] for category in item.get("categories", [])]
                combined_ids.extend([foodType["id"] for foodType in item.get("foodTypes", [])])
            # Add additional details to the dictionary
            restaurants_dict[place_id] = {
                "name": place_name, 
                "location": location, 
                "openingHours": opening_hours, 
                "ids": combined_ids
            }

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

def getPastTripCategories(pasTripList):

    # Initialize a dictionary to hold the combined data
    Trip_data = {}

    for trip in pasTripList:
        # Use lookupPlaceById to get details
        trip_info = lookupPlaceById(trip)

        # Check if the request was successful
        if 'title' in trip_info:
            # Extract foodTypes.id and categories.id and combine them
            combined_ids = [ft['id'] for ft in trip_info.get('foodTypes', [])]
            combined_ids.extend([cat['id'] for cat in trip_info.get('categories', [])])

            # Save the extracted information using placeId as key
            Trip_data[trip] = combined_ids
        else:
            print(f"Failed to retrieve information for place ID {trip}")

    return Trip_data

# Example usage
pasTripList = ['here:pds:place:124f25db-c9594d79654345e09194e54176d6ceb5', 'here:pds:place:124f25dv-6d8984ea7176486e9d3bf23caccc5b05', 'here:pds:place:124f25dv-e92178fec30846aca60dca4b6e7cf54a']
sim = performSimilarity(pasTripList, 45.5019, -73.5674)
print(sim)



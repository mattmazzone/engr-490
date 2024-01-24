from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
import os
import json
from recommender_system.src.utils import create_df, create_rating_df

script_path= os.path.dirname(__file__) + "/"

npf = open(script_path + 'nearbyPlaces.json')
nearby_places = json.load(npf)

rpf = open(script_path + 'recentPlace.json')
recent_places = json.load(rpf)

nearby_places_df = create_df(nearby_places)
recent_places_df = create_df(recent_places)

recent_place_ratings_df = create_rating_df(recent_places)
print(nearby_places_df)
print(recent_places_df)

print(recent_place_ratings_df)


npf.close()
rpf.close()




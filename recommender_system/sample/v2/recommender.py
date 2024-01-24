from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
import os
import json
import platform
from utils import create_df, create_rating_df

# Step 1 - Get nearby places
script_path= os.path.dirname(__file__)

npf = open(os.path.join(script_path, 'nearbyPlaces.json'))
nearby_places = json.load(npf)

rpf = open(os.path.join(script_path, 'recentPlaces.json'))
recent_places = json.load(rpf)

# Step 2 - Turn them into dfs not including user rating

nearby_places_df = create_df(nearby_places)
recent_places_df = create_df(recent_places)

# Step 3 - Create user rating df for the recent places

recent_place_ratings_df = create_rating_df(recent_places)


npf.close()
rpf.close()




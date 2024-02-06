from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import os
import json
from utils import create_df, create_rating_df, multiplyRating

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

# Step 4 - drop useless index column (calcultion purposes)
recent_places_df_copy = recent_places_df.reset_index(drop=True)
nearby_places_df_copy = nearby_places_df.reset_index(drop=True)

# Step 5 - compute cosine similarity and convert back to df
similarity_df = cosine_similarity(recent_places_df_copy, nearby_places_df_copy)
similarity_df = pd.DataFrame(similarity_df)

# Step 6 - rename columns and row indecies
recent_place_ids = recent_places_df.index
similarity_df = similarity_df.set_index(recent_place_ids)
cols = {}
for i in range(len(nearby_places_df.index)):
    cols[i] = nearby_places_df.index[i]
similarity_df = similarity_df.rename(cols, axis=1)

print(similarity_df)

# Step 7 - Weight all similarities by the normalized user rating (rating/5) of the recent place
recent_place_ratings = recent_place_ratings_df.to_dict()
weighted_similarity_df = similarity_df.apply(multiplyRating, axis=1, args=(recent_place_ratings,))

print(weighted_similarity_df)

npf.close()
rpf.close()




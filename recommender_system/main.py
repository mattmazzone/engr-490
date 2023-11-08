from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np

# Assumptions
# 1. User is willing to travel the distance (will deal with later)
# 2. User is willing to spend money (will deal with later)
# 3. Reviews don't matter (will deal with later)

# User-to-item recommender engine

# Get place vectors
# Assume these are places that are near the user
places_df = pd.read_csv("places_dataset_sample.csv")


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


# Normalize place vectors
places_normalized_df = places_df.apply(normalize, axis=1)


# Get user vectors
# fetched from our database
historical_user_df = pd.read_csv("historical_user_dataset_sample.csv")


user1_df = historical_user_df[historical_user_df["user_name"] == "user 1"]
user1_places_df = pd.merge(user1_df, places_df, on="place_name")

# Remove the place_name column since its useless now
user1_summed = user1_places_df.drop(["place_name"], axis=1).groupby("user_name").sum().reset_index()
# Normalize user vector
user1_sum_normalized = user1_summed.apply(normalize, axis=1)

# Drop useless columns for calculations
user1_sum_normalized_copy = user1_sum_normalized.drop(["user_name"], axis=1)
places_normalized_df_copy = places_normalized_df.drop(["place_name"], axis=1)

# Compute similarity matrix for each place
user1_places_similarity_df = cosine_similarity(user1_sum_normalized_copy, places_normalized_df_copy)
user1_places_similarity_df = pd.DataFrame(user1_places_similarity_df).transpose()
user1_places_similarity_df.rename({0: 'similarity'}, axis=1, inplace=True)

# join similarity matrix with places
user1_places_similarity_df = pd.concat([places_normalized_df, user1_places_similarity_df], axis=1)
sortedPlaces = user1_places_similarity_df.sort_values(by="similarity", ascending=False).reset_index()

displayed_columns = ["place_name", "similarity"]
print(sortedPlaces[displayed_columns])

# TODO: Sort and filter recommendations even further based on, reviews, distance, 
# money spent or activity type
# ...

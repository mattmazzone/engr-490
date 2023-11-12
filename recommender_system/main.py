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

user_places_df = pd.merge(historical_user_df, places_df, on="place_name")

# Remove the place_name column since its useless now
users_summed = user_places_df.drop(["place_name"], axis=1).groupby("user_name").sum().reset_index()
# Normalize user vector
users_sum_normalized = users_summed.apply(normalize, axis=1)
print(users_summed)
print()
# Drop useless columns for calculations
users_sum_normalized_copy = users_sum_normalized.drop(["user_name"], axis=1)
places_normalized_df_copy = places_normalized_df.drop(["place_name"], axis=1)

# Compute similarity matrix for each place
users_places_similarity_df = cosine_similarity(users_sum_normalized_copy, places_normalized_df_copy)
users_places_similarity_df = pd.DataFrame(users_places_similarity_df).transpose()

num_users = len(users_places_similarity_df.columns)

# join similarity matrix with places
users_places_similarity_df = pd.concat([places_normalized_df, users_places_similarity_df], axis=1)
for i in range(0, num_users):
    sortedPlaces = users_places_similarity_df.sort_values(by=[i], ascending=False).reset_index()
    sortedPlaces.rename({i : f'Similarity user {i + 1}'}, axis=1, inplace=True)
    print(sortedPlaces[["place_name", f'Similarity user {i + 1}']])
    print()

# TODO: Sort and filter recommendations even further based on, reviews, distance, 
# money spent or activity type
# ...

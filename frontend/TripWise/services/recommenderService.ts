import { Platform } from "react-native";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { RecommendActivitiesResponse } from "../types/recommenderTypes";

// Base API URL
let BASE_API_URL: string;
if (Platform.OS === "android") {
  BASE_API_URL = "http://10.0.2.2:3000/api/recommend-activities";
} else {
  BASE_API_URL = "http://localhost:3000/api/recommend-activities";
}

export const recommendActivities = async (
  maxResultCount: number = 20,
  numRecentTrips: number = 10,
  latitude: number = 37.7749,
  longitude: number = -122.4194,
  radius: number = 1500
): Promise<RecommendActivitiesResponse | null> => {
  try {
    if (FIREBASE_AUTH.currentUser) {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const payload = {
        maxResultCount,
        numRecentTrips,
        latitude,
        longitude,
        radius,
      };
      const response = await fetch(
        `${BASE_API_URL}/${FIREBASE_AUTH.currentUser.uid}`,
        {
          headers: {
            Authorization: idToken,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to retrieve recommended activities.");
      }
      const activities: RecommendActivitiesResponse = await response.json();
      return activities;
    }
    return null;
  } catch (error) {
    console.error("Error to update user notifications:", error);

    throw error;
  }
};

// Import necessary dependencies, Firebase config, etc.
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { UserProfile } from "../types/userTypes";

import { Meeting } from "../types/tripTypes"

// Base API URL
const BASE_API_URL = "http://localhost:3000/api";

// Function to fetch user profile
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  try {
    if (FIREBASE_AUTH.currentUser) {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:3000/api/profile/${FIREBASE_AUTH.currentUser.uid}`,
        {
          headers: {
            Authorization: idToken,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user profile.");
      }
      const data: UserProfile = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile from backend:", error);
    throw error;
  }
};

export const updateUserInterests = async (
  interests: string[]
): Promise<void> => {
  try {
    if (FIREBASE_AUTH.currentUser) {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      console.log("idToken", idToken);
      const response = await fetch(
        `http://localhost:3000/api/interests/${FIREBASE_AUTH.currentUser.uid}`,
        {
          headers: {
            Authorization: idToken,
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify({ interests }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update user interests.");
      }
    }
  } catch (error) {
    console.error("Error updating user interests:", error);
    throw error;
  }
};

export const updateTripMeetings = async (
  tripId: string,
  meetings: Meeting[],
  ): Promise<void> => {
    try {
      if (FIREBASE_AUTH.currentUser) { //may have to change to update meetings for specific trip and not just user
        const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
        const response = await fetch(
          `http://localhost:3000/api/interests/${FIREBASE_AUTH.currentUser.uid}`,
          {
            headers: {
              Authorization: idToken,
              "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ meetings }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update trip meetings.");
        }
      }
    } catch (error) {
      console.error("Error updating trip meetings:", error);
    }
  };
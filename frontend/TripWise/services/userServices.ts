// Import necessary dependencies, Firebase config, etc.
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { UserProfile } from "../types/userTypes";

import { Meeting } from "../types/tripTypes";

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

interface FreeSlot {
  start: string;
  end: string;
}
interface TripData {
  tripStart: string;
  tripEnd: string;
  tripMeetings: Meeting[];
  freeSlots: FreeSlot[];
}
interface TripDataResponse {
  trip: TripData;
  freeSlots: FreeSlot[];
}

export const createTrip = async (
  tripStart: Date | undefined,
  tripEnd: Date | undefined,
  tripMeetings: Meeting[] | undefined
): Promise<TripDataResponse | undefined> => {
  if (!FIREBASE_AUTH.currentUser) {
    console.error("No current user found");
    return undefined; // Explicitly returning undefined
  }
  try {
    const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
    const response = await fetch(
      `http://localhost:3000/api/create_trip/${FIREBASE_AUTH.currentUser.uid}`,
      {
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ tripStart, tripEnd, tripMeetings }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create trip.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating trip:", error);
    return undefined; // Handling the error case by returning undefined
  }
};

export const fetchCurrentTrip = async (): Promise<any> => {
  try {
    if (FIREBASE_AUTH.currentUser) {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:3000/api/current_trip/${FIREBASE_AUTH.currentUser.uid}`,
        {
          headers: {
            Authorization: idToken,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch current trip.");
      }
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Error fetching current trip:", error);
  }
};

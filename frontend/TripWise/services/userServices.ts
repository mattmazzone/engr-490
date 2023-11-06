// Import necessary dependencies, Firebase config, etc.
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { UserProfile } from "../types/userTypes";

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
  uid: string,
  interests: string[]
): Promise<void> => {
  // Implement the function to update the user's interests in the database.
};

import { useState, useEffect } from "react";
import * as UserService from "../services/userServices";
import { UserProfile } from "../types/userTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../FirebaseConfig";

interface UserProfileHook {
  refreshData: boolean;
}

export const useUserProfile = ({ refreshData }: UserProfileHook) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const fetchProfileFromDB = async () => {
    try {
      const profile = await UserService.fetchUserProfile();
      setUserProfile(profile);
      await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const fetchProfileFromStorage = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem("userProfile");
      if (storedProfile !== null) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // No profile found in storage, fetch from DB
        console.log("No profile found in storage, fetching from DB");
        await fetchProfileFromDB();
      }
    } catch (error) {
      console.error("Error fetching user profile from storage:", error);
      await fetchProfileFromDB(); // Fallback to fetching from DB in case of error
    } finally {
      setIsFetchingProfile(false);
    }
  };

  useEffect(() => {
    if (FIREBASE_AUTH.currentUser) {
      if (refreshData) {
        fetchProfileFromDB();
      } else {
        fetchProfileFromStorage();
      }
    } else {
      console.log("No user logged in, clearing profile");
      setUserProfile(null);
      setIsFetchingProfile(false);
    }
  }, [refreshData, FIREBASE_AUTH.currentUser]);

  return { userProfile, isFetchingProfile };
};

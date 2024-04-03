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
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
      if (user) {
        if (refreshData) {
          fetchProfileFromDB();
        } else {
          fetchProfileFromStorage();
        }
      } else {
        setUserProfile(null);
        setIsFetchingProfile(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [refreshData]);

  return { userProfile, isFetchingProfile };
};

import { useState, useEffect } from "react";
import * as UserService from "../services/userServices";
import { UserProfile } from "../types/userTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserProfileHook {
  refreshData: boolean;
}

export const useUserProfile = ({ refreshData }: UserProfileHook) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchProfileFromDB = async () => {
      try {
        const profile = await UserService.fetchUserProfile();
        setUserProfile(profile);
        await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsFetching(false);
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
        setIsFetching(false);
      }
    };

    if (refreshData) {
      fetchProfileFromDB();
    } else {
      fetchProfileFromStorage();
    }
  }, [refreshData]);

  return { userProfile, isFetching };
};

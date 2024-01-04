// useUserProfile.js
import { useState, useEffect } from "react";
import * as UserService from "../services/userServices";
import { UserProfile } from "../types/userTypes";

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await UserService.fetchUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  return { userProfile, isFetching };
};

import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";
import { UserProfile } from "../../types/userTypes";
import * as UserService from "../../services/userServices";
import { TripType } from "../../types/tripTypes";
import { useFocusEffect } from "@react-navigation/native";
import PastTrips from "../../components/HomeScreen/PastTrips";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

// Check for an ongoing Trip

const Home = ({ navigation }: RouterProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [currentTrip, setCurrentTrip] = useState<TripType>();
  const [pastTrips, setPastTrips] = useState<TripType[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true); // To track the fetching state

  // useFocusEffect is used to run code when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const initializeHomePage = async () => {
        try {
          const userProfile = await UserService.fetchUserProfile();
          const currentTrip = await UserService.fetchCurrentTrip();
          const pastTrips = await UserService.fetchPastTrips();

          if (!userProfile) {
            throw new Error("User profile not found");
          }
          setUserProfile(userProfile);

          if (currentTrip?.hasActiveTrip === false) {
            setCurrentTrip(undefined);
          } else {
            setCurrentTrip(currentTrip);
          }

          if (!pastTrips) {
            throw new Error("Past trips not found");
          }
          setPastTrips(pastTrips);
          
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setIsFetching(false);
        }
      };

      initializeHomePage();
    }, []) // Dependencies for the useCallback hook, if any
  );

  if (isFetching) {
    return (
      <BackgroundGradient>
        <Text>Loading...</Text>
      </BackgroundGradient>
    );
  }

  if (currentTrip) {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>
            Welcome back, {userProfile?.firstName}! You have an ongoing trip!
            {/* to {currentTrip?.destination} with{" "} */}
            {/* {trip?.travelers.length} other travelers */}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Trip")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>View Trip Details</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>
          Welcome back, {userProfile?.firstName}!
        </Text>
        <Text style={styles.subTitle}>
          Click below to start planning a trip.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Trip")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Start a Trip</Text>
        </TouchableOpacity>

        <PastTrips pastTrips={pastTrips} />
      </SafeAreaView>
    </BackgroundGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    marginHorizontal: 40,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#00FF55",
    padding: 10,
    width: "50%",
    borderRadius: 3,
    marginBottom: 40,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  loadingText: {
    color: "white",
    textAlign: "center",
  },
});

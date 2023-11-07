import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text, View, Button, StyleSheet, TouchableOpacity } from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import BackgroundGradient from "../../components/BackgroundGradient";
import { UserProfile } from "../../types/userTypes";
import * as UserService from "../../services/userServices";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

// Check for an ongoing Trip

const Home = ({ navigation }: RouterProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true); // To track the fetching state
  const [trip, setTrip] = useState<any>(null);

  useEffect(() => {
    const initializeUserProfile = async () => {
      try {
        const profile = await UserService.fetchUserProfile();
        setUserProfile(profile);
        // If the user has an ongoing trip, set the trip to the user's ongoing trip else set it to null
        setTrip(profile?.ongoingTrip !== "" ? profile?.ongoingTrip : null);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    initializeUserProfile();
  }, []);

  if (isFetching) {
    return (
      <BackgroundGradient>
        <Text>Loading...</Text>
      </BackgroundGradient>
    );
  }

  if (trip) {
    return (
      <BackgroundGradient>
        <View>
          <Text>
            You have an ongoing trip to {trip?.destination} with{" "}
            {trip?.travelers.length} other travelers
          </Text>
          <Button
            title="View Trip"
            onPress={() => navigation.navigate("TripDetails")}
          />
        </View>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <Text style={styles.title}>No Ongoing Trips!</Text>
        <Text style={styles.subTitle}>
          Click below to start planning a trip.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("StartTrip")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Start a Trip</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Review your past Trips</Text>
        <View>{/* Map past trips to TSX here */}</View>
      </View>
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
    backgroundColor: "#6200ee",
    padding: 10,
    width: "50%",
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },

  loadingText: {
    color: "white",
    textAlign: "center",
  },
});

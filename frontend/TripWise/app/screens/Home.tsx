import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";
import { UserProfile } from "../../types/userTypes";
import * as UserService from "../../services/userServices";
import { TripType } from "../../types/tripTypes";
import { useFocusEffect } from "@react-navigation/native";
import PastTrips from "../../components/HomeScreen/PastTrips";
import { useUserProfile } from "../../hooks/useUserProfile";
import { use } from "chai";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

// Check for an ongoing Trip

const Home = ({ navigation }: RouterProps) => {
  const { userProfile } = useUserProfile({ refreshData: false });
  const [currentTrip, setCurrentTrip] = useState<TripType | null>(null);
  const [pastTrips, setPastTrips] = useState<TripType[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const loadTripData = async () => {
    try {
      const currentTrip = await UserService.fetchCurrentTrip();
      const pastTrips = await UserService.fetchPastTrips();

      setCurrentTrip(currentTrip?.hasActiveTrip ? currentTrip : null);
      setPastTrips(pastTrips || []);
    } catch (error) {
      console.error("Error fetching trip data:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // useFocusEffect is used to run code when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadTripData();
    }, [])
  );

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>
          Welcome back, {userProfile?.firstName}!
          {currentTrip && " You have an ongoing trip!"}
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(currentTrip ? "TripDetails" : "CreateTrip")
          }
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {currentTrip ? "View Trip Details" : "Start a Trip"}
          </Text>
        </TouchableOpacity>

        {!currentTrip && (
          <PastTrips isFetching={isFetching} pastTrips={pastTrips} />
        )}
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
  scrollView: {
    width: "100%",
    marginBottom: 110, //padding so meetings stop at nav bar
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
    backgroundColor: "rgba(0, 255, 85, 0.6)",
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

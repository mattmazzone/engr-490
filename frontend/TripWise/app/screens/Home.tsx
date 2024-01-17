import { NavigationProp } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Button,
  FlatList,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";

import * as UserService from "../../services/userServices";
import { TripType } from "../../types/tripTypes";
import { useFocusEffect } from "@react-navigation/native";
import PastTrips from "../../components/HomeScreen/PastTrips";
import { useUserProfile } from "../../hooks/useUserProfile";
import { recommendActivities } from "../../services/recommenderService";
import { SimilarityTableResponse } from "../../types/recommenderTypes";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Home = ({ navigation }: RouterProps) => {
  const { userProfile, isFetchingProfile } = useUserProfile({
    refreshData: true,
  });

  const [currentTrip, setCurrentTrip] = useState<TripType | null>(null);
  const [pastTrips, setPastTrips] = useState<TripType[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [activities, setRecommenedActivities] =
    useState<SimilarityTableResponse | null>(null);

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

  if (isFetchingProfile) {
    return (
      <BackgroundGradient>
        <View style={styles.container}>
          <Text style={styles.title}>Loading...</Text>
        </View>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <Text style={styles.title}>
          Welcome back, {userProfile?.firstName}!
          {currentTrip && " You have an ongoing trip!"}
        </Text>
        <TouchableOpacity
          onPress={async () => {
            const activitiesV = await recommendActivities();
            setRecommenedActivities(activitiesV);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}> Recommend activities</Text>
        </TouchableOpacity>
        {activities && (
          <FlatList
            data={Object.entries(activities.data.Similarity).map(([k, v]) => ({
              id: k,
              score: v,
            }))}
            renderItem={({ item }) => (
              <Text>{`Similarity score for ${item.id}: ${
                item.score * 100.0
              }`}</Text>
            )}
            keyExtractor={(item) => item.id}
          ></FlatList>
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate("Trip")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {currentTrip ? "View Trip Details" : "Start a Trip"}
          </Text>
        </TouchableOpacity>
        {!currentTrip && (
          <PastTrips isFetching={isFetching} pastTrips={pastTrips} />
        )}
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
});

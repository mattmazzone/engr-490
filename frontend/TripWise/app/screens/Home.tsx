import { NavigationProp } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";

import * as UserService from "../../services/userServices";
import { TripType } from "../../types/tripTypes";
import { useFocusEffect } from "@react-navigation/native";
import PastTrips from "../../components/HomeScreen/PastTrips";
import { useUserProfile } from "../../hooks/useUserProfile";
import { recommendActivities } from "../../services/recommenderService";
import { RecommendActivitiesResponse } from "../../types/recommenderTypes";

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
  const [recommendedActivities, setRecommenedActivities] =
    useState<RecommendActivitiesResponse | null>(null);
  const [isFetchingActivities, setIsFetchingActivities] =
    useState<boolean>(false);

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
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Trip")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {currentTrip ? "View Trip Details" : "Start a Trip"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              setIsFetchingActivities(true);
              const _activities = await recommendActivities();
              setRecommenedActivities(_activities);
              setIsFetchingActivities(false);
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}> Recommend activities</Text>
          </TouchableOpacity>
        </View>
        {isFetchingActivities && <Text>Loading activities...</Text>}
        {recommendedActivities && (
          <FlatList
            data={recommendedActivities.activities}
            renderItem={({ item }) => (
              <Text>{`${item.displayName.text}: ${(
                item.similarity * 100.0
              ).toPrecision(4)}%`}</Text>
            )}
            keyExtractor={(item) => item.id}
          ></FlatList>
        )}
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
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    columnGap: 20,

    width: "100%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2a5",
    padding: 5,
    width: "30%",
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 12,
  },
});

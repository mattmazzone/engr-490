import { NavigationProp } from "@react-navigation/native";
import React, { useState, useContext } from "react";
import { Text, View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import Background from "../../components/Background";
import ThemeContext from "../../context/ThemeContext";
import * as UserService from "../../services/userServices";
import { TripType } from "../../types/tripTypes";
import { useFocusEffect } from "@react-navigation/native";
import PastTrips from "../../components/HomeScreen/PastTrips";
import { useUserProfile } from "../../hooks/useUserProfile";
import TripWiseLogoHomePage from "../../components/SVGLogos/TripWiseLogoHomePage";
import { BottomTabParamList } from "../../types/navigationTypes";

interface RouterProps {
  navigation: NavigationProp<BottomTabParamList, "Home">;
}

const Home = ({ navigation }: RouterProps) => {
  const { theme } = useContext(ThemeContext);
  const { userProfile, isFetchingProfile } = useUserProfile({
    refreshData: true,
  });

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

  if (isFetchingProfile) {
    return (
      <Background>
          <ActivityIndicator style={styles.spinner} size="large" color="rgba(34, 170, 85, 1)" />
      </Background>
    );
  }

  return (
    <Background>
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            { backgroundColor: theme === "Dark" ? "black" : "white" },
          ]}
        >
          <View style={styles.logoContainer}>
            <TripWiseLogoHomePage />
          </View>
          <Text
            style={[
              styles.title,
              { color: theme === "Dark" ? "white" : "black" },
            ]}
          >
            Welcome back, {userProfile?.firstName}!
            {currentTrip && " You have an ongoing trip!"}
          </Text>
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => navigation.navigate("Trip")}
              style={styles.button}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme === "Dark" ? "white" : "black" },
                ]}
              >
                {currentTrip ? "View Trip Details" : "Plan a Trip"}
              </Text>
            </Pressable>
          </View>
        </View>

        {!currentTrip && (
          <PastTrips isFetching={isFetching} pastTrips={pastTrips} />
        )}
      </View>
    </Background>
  );
};

export default Home;

const styles = StyleSheet.create({
  spinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  logoContainer: {
    alignItems: "center",
  },
  container: {
    flex: 1,
    alignItems: "flex-start",
    marginHorizontal: 40,
    marginTop: 20,
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
    columnGap: 15,
    width: "100%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "rgba(34, 170, 85, 1)",
    padding: 10,
    borderRadius: 25,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 12,
  },
});

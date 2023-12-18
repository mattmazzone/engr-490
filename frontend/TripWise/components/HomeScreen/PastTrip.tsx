import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TripType } from "../../types/tripTypes";
import * as UserService from "../../services/userServices";

const PastTrip = ({ pastTrip }: any) => {
  const [pastTripData, setPastTripData] = useState<TripType | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    const fetchPastTripData = async () => {
      try {
        const fetchedData = await UserService.fetchPastTripData(pastTrip);
        console.log("fetchedData", fetchedData);
        if (fetchedData) {
          setPastTripData(fetchedData);
        } else {
          throw new Error("Past trip not found");
        }
      } catch (error) {
        console.error("Error fetching past trip data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchPastTripData();
  }, []);

  if (isFetching || !pastTripData) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  const formattedStartDate = new Date(pastTripData.tripStart).toLocaleString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {formattedStartDate}
      </Text>
    </View>
  );
};

export default PastTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    marginVertical: 10,
    width: "100%",
  },
  text: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
});

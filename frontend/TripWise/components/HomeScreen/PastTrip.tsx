import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { TripType } from "../../types/tripTypes";
import * as UserService from "../../services/userServices";
import { hours } from "react-native-big-calendar";

const PastTrip = ({ pastTrip }: any) => {
  const [pastTripData, setPastTripData] = useState<TripType | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    const fetchPastTripData = async () => {
      try {
        const fetchedData = await UserService.fetchPastTripData(pastTrip);
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

  const sneakPeek = pastTripData.tripMeetings.slice(0, 2);
  console.log("sneakPeek", sneakPeek);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{formattedStartDate}</Text>
      </View>
      <View>
        {sneakPeek.map((meeting: any, index: any) => (
          <>
            <Text key={index} style={styles.text}>
              {new Date(meeting.start).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
              {" - "}
              {meeting.title}
            </Text>
            <View style={styles.verticalBar}>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>View Details</Text>
              </Pressable>
            </View>
          </>
        ))}
      </View>
    </View>
  );
};

export default PastTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    marginVertical: 10,
    width: "100%",
    paddingBottom: 20,
    paddingTop: 10,
  },
  titleContainer: {
    alignSelf: "stretch",
    marginLeft: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "left",
  },
  text: {
    fontSize: 16,
    color: "white",
  },
  button: {
    backgroundColor: "rgba(0, 255, 85, 0.6)",
    padding: 10,
    width: "75%",
    borderRadius: 3,
    marginBottom: 5,
  },
  verticalBar: {
    marginLeft: 30,
    paddingVertical: 10,
    borderLeftWidth: 2,
    borderLeftColor: "white",
    width: "100%",
    alignItems: "center",
    borderStyle: "dotted",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

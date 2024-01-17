import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Button,
  Modal,
  Animated,
} from "react-native";
import { TripType } from "../../types/tripTypes";
import * as UserService from "../../services/userServices";
import PastTripSkeleton from "./PastTripSkeleton";

const PastTrip = ({ pastTrip }: any) => {
  const [pastTripData, setPastTripData] = useState<TripType | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [tripDetailsModalVisible, setTripDetailsModalVisible] =
    useState<boolean>(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity is 0

  useEffect(() => {
    const fetchPastTripData = async () => {
      try {
        const fetchedData = await UserService.fetchPastTripData(pastTrip);
        setTimeout(() => {
          if (fetchedData) {
            setPastTripData(fetchedData);
            fadeIn(); // Start fade-in animation after setting data
          } else {
            throw new Error("Past trip not found");
          }
        }, 3000); // Ensure skeleton is visible for 3 seconds
      } catch (error) {
        console.error("Error fetching past trip data:", error);
      } finally {
        setTimeout(() => setIsFetching(false), 3000); // Delay hiding skeleton
      }
    };
    fetchPastTripData();
  }, [pastTrip]);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };
  useEffect(() => {
    if (!isFetching) {
      fadeIn();
    }
  }, [isFetching]);

  if (isFetching || !pastTripData) {
    return <PastTripSkeleton />;
  }

  const formattedStartDate = new Date(pastTripData.tripStart).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const formattedEndDate = new Date(pastTripData.tripEnd).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <Animated.View style={{ ...styles.container, opacity: fadeAnim }}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          {formattedStartDate} - {formattedEndDate}
        </Text>
      </View>
      <Pressable
        style={styles.button}
        onPress={() => setTripDetailsModalVisible(true)}
      >
        <Text style={styles.buttonText}>View Details</Text>
      </Pressable>
      <Modal
        animationType="slide"
        transparent={false}
        visible={tripDetailsModalVisible}
        onRequestClose={() => {
          setTripDetailsModalVisible(!tripDetailsModalVisible);
        }}
      >
        <View>
          <View>
            <Text>This is my modal</Text>
            <Pressable onPress={() => setTripDetailsModalVisible(false)}>
              <Text>close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default PastTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    marginBottom: 20,
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
    borderRadius: 3,
    marginBottom: 5,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

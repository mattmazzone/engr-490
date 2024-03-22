import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
} from "react-native";
import { TripType } from "../../types/tripTypes";
import * as UserService from "../../services/userServices";
import PastTripSkeleton from "./PastTripSkeleton";
import { Image } from "expo-image";
import ThemeContext from "../../context/ThemeContext";
import { ref, getDownloadURL } from "firebase/storage";
import { FIREBASE_STORAGE } from "../../FirebaseConfig";

const PastTrip = ({ pastTrip }: any) => {
  const [tripImageUrl, setTripImageUrl] = useState<string>("");
  const { theme } = useContext(ThemeContext);
  const [pastTripData, setPastTripData] = useState<TripType | null>(null);
  const [tripDetailsModalVisible, setTripDetailsModalVisible] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity is 0
  const [imageNotFound, setImageNotFound] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchPastTripData = async () => {
      try {
        const fetchedData = await UserService.fetchPastTripData(pastTrip);
        console.log("fetchedData", fetchedData);
        console.log("pastTrip", pastTrip);
        const imageUrl = await getDownloadURL(
          ref(FIREBASE_STORAGE, `trip-pictures/${pastTrip}`)
        );
        console.log("imageUrl", imageUrl);
        setTripImageUrl(imageUrl);
        if (!imageUrl) {
          setImageNotFound(true);
        }
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
        setImageNotFound(true);
      } finally {
        setTimeout(() => setIsLoading(false), 3000); // Delay hiding skeleton
      }
    };
    fetchPastTripData();
  }, [pastTrip]);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };
  useEffect(() => {
    if (!isLoading) {
      fadeIn();
    }
  }, [isLoading]);

  if (isLoading || !pastTripData) {
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
    <Pressable
      style={{ width: "100%" }}
      onPress={() => setTripDetailsModalVisible(true)}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            backgroundColor: theme === "Dark" ? "#505050" : "#E8E8E8",
          },
        ]}
      >
        <View
          style={[
            styles.titleContainer,
            { backgroundColor: theme === "Dark" ? "#505050" : "#E8E8E8" },
          ]}
        >
          <Image
            source={{ uri: tripImageUrl }}
            style={{
              height: 100,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
          />
          {/* <Text
            style={[
              styles.city,
              { color: theme === "Dark" ? "white" : "black" },
            ]}
          >
            {faker.location.city()}
          </Text> */}
          <Text
            style={[
              styles.city,
              { color: theme === "Dark" ? "white" : "black" },
            ]}
          >
            {formattedStartDate} - {formattedEndDate}
          </Text>
        </View>

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
    </Pressable>
  );
};

export default PastTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    borderRadius: 5,
    paddingBottom: 20,
  },
  titleContainer: {
    alignSelf: "stretch",
  },
  city: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 10,
    marginLeft: 10,
  },
  date: {
    fontSize: 12,
    textAlign: "left",
    marginLeft: 10,
  },

  text: {
    fontSize: 16,
  },
});

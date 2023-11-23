import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DateRange } from "../../types/tripTypes";

interface ImportEventsFromProviderProps {
  dateRange: DateRange;
  onButtonClick: (importEvents: boolean) => void;
}

// Get user provider from firebase
const getUserProvider = () => {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  if (user) {
    const isGoogleUser = user.providerData.some(
      (provider) => provider.providerId === "google.com"
    );
    const isEmailUser = user.providerData.some(
      (provider) => provider.providerId === "password"
    );
    const isAppleUser = user.providerData.some(
      (provider) => provider.providerId === "apple.com"
    );

    if (isGoogleUser) {
      return "Google";
    } else if (isAppleUser) {
      return "Apple";
    } else if (isEmailUser) {
      return null;
    }
  }
};

const getCalendarEvents = async (provider: string, dateRange: DateRange) => {
  console.log(provider);
  if (provider === "Google") {
    const startDate = dateRange.startDate?.toISOString(); // for example, today
    const endDate = dateRange.endDate?.toISOString(); // set this to your desired end date

    // Get access token from storage (web) or async storage (mobile)
    let accessToken = "";
    if (Platform.OS === "web") {
      // use session storage
      accessToken = sessionStorage.getItem("googleAccessToken") || "";
    } else {
      // use async storage for mobile
      accessToken = (await AsyncStorage.getItem("googleAccessToken")) || "";
    }

    console.log(accessToken);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate}&timeMax=${endDate}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
  } else if (provider === "Apple") {
    // Apple Calendar API
  }
};

const promptUserToUseProvider = (
  dateRange: DateRange,
  onButtonClick: (importEvents: boolean) => void
) => {
  const provider = getUserProvider();

  return (
    provider && (
      <View style={styles.container}>
        <Text style={styles.subTitle}>
          Import your meetings from {provider} calendar?
        </Text>
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.buttonYes}
            onPress={() => {
              getCalendarEvents(provider, dateRange);
              onButtonClick(true);
            }}
          >
            <Text style={styles.buttonText}>Yes</Text>
          </Pressable>
          <Pressable
            style={styles.buttonNo}
            onPress={() => onButtonClick(false)}
          >
            <Text style={styles.buttonText}>No</Text>
          </Pressable>
        </View>
      </View>
    )
  );
};

const ImportEventsFromProvider = ({
  dateRange,
  onButtonClick,
}: ImportEventsFromProviderProps) => {
  return <View>{promptUserToUseProvider(dateRange, onButtonClick)}</View>;
};

export default ImportEventsFromProvider;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    borderRadius: 5,
  },
  subTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  buttonYes: {
    backgroundColor: "#00FF55",
    padding: 10,
    width: 100,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonNo: {
    backgroundColor: "grey",
    padding: 10,
    width: 100,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { getUserProvider } from "../../services/userServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DateRange, Meeting } from "../../types/tripTypes";

interface ImportEventsFromProviderProps {
  dateRange: DateRange;
  onButtonClick: (importEvents: boolean) => void;
  onCalendarEvents: (calendarEvents: Meeting[]) => void;
}

const getCalendarEvents = async (
  provider: string,
  dateRange: DateRange,
  onCalendarEvents: (calendarEvents: Meeting[]) => void
) => {
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

    console.log("Google Calendar API response:", data);

    // Filter properties to only include what we need (title/summary, start, end, location, googleId)
    const calendarEvents: Meeting[] = data.items.map((item: any) => ({
      title: item.summary,
      start: item.start.dateTime,
      end: item.end.dateTime,
      location: item.location,
      providerId: item.id,
    }));

    onCalendarEvents(calendarEvents);
  } else if (provider === "Apple") {
    // Apple Calendar API
  }
};

const promptUserToUseProvider = (
  dateRange: DateRange,
  onButtonClick: (importEvents: boolean) => void,
  onCalendarEvents: (calendarEvents: Meeting[]) => void
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
              getCalendarEvents(provider, dateRange, onCalendarEvents);
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
  onCalendarEvents,
}: ImportEventsFromProviderProps) => {
  return (
    <View>
      {promptUserToUseProvider(dateRange, onButtonClick, onCalendarEvents)}
    </View>
  );
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
    backgroundColor: "rgba(0, 255, 85, 0.6)",
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

import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import BackgroundGradient from "../BackgroundGradient";
import { Calendar } from "react-native-big-calendar";
import { TripType } from "../../types/tripTypes";

interface CurrentTripProps {
  currentTrip: TripType;
}

const calendartheme = {
  palette: {
    primary: {
      main: "#6185d0",
      contrastText: "#000",
    },
    gray: {
      "100": "#333",
      "200": "transparent",
      "300": "#888",
      "500": "#000",
      "800": "#ccc",
    },
  },
};

const CurrentTrip = ({ currentTrip }: CurrentTripProps) => {
  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.currentTripContainer}>
        <View style={styles.calendarContainer}>
          {currentTrip.tripStart && currentTrip.tripEnd && (
            <Calendar
              events={currentTrip.tripMeetings.map((meeting) => ({
                title: meeting.title,
                start: new Date(meeting.start),
                end: new Date(meeting.end),
                id: meeting.id,
                location: meeting.location,
              }))}
              date={new Date(currentTrip.tripStart)}
              height={600}
              mode="3days"
              theme={calendartheme}
            />
          )}
        </View>
      </SafeAreaView>
    </BackgroundGradient>
  );
};

export default CurrentTrip;

const styles = StyleSheet.create({
  currentTripContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginHorizontal: 10,
    paddingBottom: 110, //padding so meetings stop at nav bar
    marginTop: 40,
  },
  calendarContainer: {
    flex: 1,
    width: "100%",
  },
});

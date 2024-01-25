import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import Background from "../Background";
import { Calendar } from "react-native-big-calendar";
import { TripType } from "../../types/tripTypes";
import CustomCalendarEvent from "./CustomCalendarEvent";

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
  const calendarEvents = [
    ...currentTrip.tripMeetings.map((meeting) => ({
      title: meeting.title,
      start: new Date(meeting.start),
      end: new Date(meeting.end),
      id: meeting.id,
      location: meeting.location,
      color: "#6185d0", // Color for meetings
    })),
    ...currentTrip.freeSlots.map((slot) => ({
      title: "Free Time",
      start: new Date(slot.start),
      end: new Date(slot.end),
      color: "#76b852", // A distinct color for free slots
    })),
  ];

  return (
    <Background>
      <SafeAreaView style={styles.currentTripContainer}>
          <View style={styles.calendarContainer}>
            {currentTrip.tripStart && currentTrip.tripEnd && (
              <Calendar
                events={calendarEvents}
                date={new Date(currentTrip.tripStart)}
                height={600}
                mode="3days"
                theme={calendartheme}
                eventCellStyle={(event) => {
                  return {
                    backgroundColor: event.color,
                  };
                }}
                renderEvent={(event, touchableOpacityProps) => (
                  <CustomCalendarEvent {...event} touchableOpacityProps = {touchableOpacityProps} />
                )}
              />
            )}
          </View>
      </SafeAreaView>
    </Background>
  );
};

export default CurrentTrip;

const styles = StyleSheet.create({
  currentTripContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginHorizontal: 10,
    marginTop: 40,
  },
  calendarContainer: {
    flex: 1,
    width: "100%",
    paddingBottom: 70, //padding so meetings stop at nav bar
  },
});

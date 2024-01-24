import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Meeting } from "../../types/tripTypes";
import {
  CalendarTouchableOpacityProps,
  ICalendarEventBase,
} from "react-native-big-calendar";

const CustomCalendarEvent = ({
  title,
  start,
  end,
  location,
  touchableOpacityProps,
}: Meeting & { touchableOpacityProps: CalendarTouchableOpacityProps }) => {
  const formatTime = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  return (
    <TouchableOpacity
      {...touchableOpacityProps}
      style={[styles.eventContainer, touchableOpacityProps.style]}
    >
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventTime}>{`${formatTime(start)} - ${formatTime(end)}`}</Text>
      <Text style={styles.eventLocation}>{location}</Text>
    </TouchableOpacity>
  );
};

export default CustomCalendarEvent;

const styles = StyleSheet.create({
  eventContainer: {
    padding: 10,
    margin: 5,
    backgroundColor: "#6185d0",
    borderRadius: 5,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 0,
  },
  eventTime: {
    fontSize: 10,
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 10,
  },
});

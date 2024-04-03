import React from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { Meeting } from "../../types/tripTypes";
import { CalendarTouchableOpacityProps } from "react-native-big-calendar";

interface CustomCalendarEventProps extends Meeting {
  touchableOpacityProps: CalendarTouchableOpacityProps;
  onPress: () => void;
}

const CustomCalendarEvent = ({
  title,
  start,
  end,
  location,
  touchableOpacityProps,
  onPress,
}: CustomCalendarEventProps) => {
  const formatTime = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  return (
    <Pressable
      {...touchableOpacityProps}
      onPress={onPress}
      style={[styles.eventContainer, touchableOpacityProps.style]}
    >
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventTime}>{`${formatTime(start)} - ${formatTime(end)}`}</Text>
      <Text style={styles.eventLocation}>{location}</Text>
    </Pressable>
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
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 12,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Meeting } from "../../types/tripTypes"; // Assuming the types are exported from this file

interface MeetingListItemProps {
  meeting: Meeting;
  onDeleteMeeting: (id: number) => void;
}

const MeetingListItem = ({
  meeting,
  onDeleteMeeting,
}: MeetingListItemProps) => {
  // Define options to exclude seconds from the time
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const startDate = meeting.start instanceof Date ? meeting.start : new Date(meeting.start);
  const endDate = meeting.end instanceof Date ? meeting.end : new Date(meeting.end);

  return (
    <View style={styles.meetingItem}>
      <View style={styles.titleAndLocation}>
        <Text style={styles.meetingTitle}>{meeting.title}</Text>
      </View>
      <View style={styles.titleAndLocation}>
        <Text style={styles.meetingLocation}>{meeting.location}</Text>
      </View>
      <View style={styles.meetingDetails}>
        <Text>{startDate.toDateString()}</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {startDate.toLocaleTimeString(undefined, timeOptions)}
          </Text>
          <Text style={styles.timeText}>
            {endDate.toLocaleTimeString(undefined, timeOptions)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (meeting.id !== undefined) {
              onDeleteMeeting(meeting.id);
            } else {
              console.error('Cannot delete meeting without an ID');
            }
          }}
          style={styles.deleteMeetingBtn}
        >
          <Text style={styles.deleteMeetingBtnTxt}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MeetingListItem;

const styles = StyleSheet.create({
  meetingItem: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  titleAndLocation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meetingTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  meetingLocation: {
    // Add styles for location text if needed
  },
  meetingDetails: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
  timeContainer: {
    // If you want the times to align with the title and location, adjust this
  },
  timeText: {
    // Styles for time text
  },
  deleteMeetingBtn: {
    backgroundColor: "red",
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    position: "absolute", // Position it absolutely to place it on the right
    right: 10, // Adjust the right position as needed
    top: 10, // Adjust the top position to align with the title
  },
  deleteMeetingBtnTxt: {
    color: "white",
    fontWeight: "bold",
  },
});

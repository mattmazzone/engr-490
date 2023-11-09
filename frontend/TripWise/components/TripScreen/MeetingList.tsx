import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DateRange, Meeting, Time } from "../../types/tripTypes";
import MeetingListItem from "./MeetingListItem";

interface MeetingListItemProps {
  meetings: Meeting[];
  onDeleteMeeting: (id: number) => void;
}

const MeetingList = ({ meetings, onDeleteMeeting }: MeetingListItemProps) => {
  return (
    <View style={styles.meetingListContainer}>
      <Text style={styles.subTitle}>Your Meetings</Text>
      {meetings.length === 0 && (
        <Text style={styles.smallerSubTitle}>No meetings added yet!</Text>
      )}
      {meetings.map((meeting) => (
        <MeetingListItem meeting={meeting} onDeleteMeeting={onDeleteMeeting} />
      ))}
    </View>
  );
};

export default MeetingList;

const styles = StyleSheet.create({
  meetingListContainer: {
    width: "100%",
    borderColor: "#ccc", // Subtle border
    borderWidth: 2,
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
  },
  subTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },
  smallerSubTitle: {
    fontSize: 14,
    color: "white",
    marginBottom: 10,
  },
});

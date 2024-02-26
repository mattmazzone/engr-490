import React, {useContext} from "react";
import { View, Text, StyleSheet } from "react-native";
import { Meeting } from "../../types/tripTypes";
import MeetingListItem from "./MeetingListItem";
import ThemeContext from "../../context/ThemeContext";

interface MeetingListItemProps {
  meetings: Meeting[];
  onDeleteMeeting: (id: number) => void;
}

const MeetingList = ({ meetings, onDeleteMeeting }: MeetingListItemProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <View style={styles.meetingListContainer}>
      <Text style={[styles.subTitle, { color: theme === "Dark" ? "white" : "black" }]}>Your Meetings</Text>
      {meetings.length === 0 && (
        <Text style={[styles.smallerSubTitle, { color: theme === "Dark" ? "white" : "black" }]}>No meetings added yet!</Text>
      )}
      {meetings.map((meeting) => (
        <MeetingListItem
          key={meeting.id}
          meeting={meeting}
          onDeleteMeeting={onDeleteMeeting}
        />
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

import React, { useState, useContext} from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { TimePickerModal } from "react-native-paper-dates";
import MeetingDateSelector from "./MeetingDateSelector";
import { DateRange, Meeting, Time } from "../../types/tripTypes";
import AddressAutocomplete from "./AddressAutocomplete";
import ThemeContext from "../../context/ThemeContext";
import Toast from 'react-native-toast-message';

interface MeetingCreatorProps {
  rangeDate: DateRange;
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
}

// Helper function to check if two time ranges overlap
const doTimesOverlap = (start1: Date, end1: Date, start2: Date, end2: Date) => {
  return start1 < end2 && start2 < end1;
};

const MeetingCreator = ({
  meetings,
  rangeDate,
  setMeetings,
}: MeetingCreatorProps) => {
  // Time
  const [openTimeStart, setOpenTimeStart] = React.useState(false);
  const [openTimeEnd, setOpenTimeEnd] = React.useState(false);
  const {theme} = useContext(ThemeContext);
  const [resetAddressInput, setResetAddressInput] = React.useState(false);

  const [startTime, setStartTime] = React.useState<Time>({
    hours: 0,
    minutes: 0,
  });
  const [endTime, setEndTime] = React.useState<Time>({
    hours: 0,
    minutes: 0,
  });

  const onDismissTimeStart = React.useCallback(() => {
    setOpenTimeStart(false);
  }, [setOpenTimeStart]);
  const onDismissTimeEnd = React.useCallback(() => {
    setOpenTimeEnd(false);
  }, [setOpenTimeEnd]);

  const onConfirmTimeStart = React.useCallback(
    ({ hours, minutes }: Time) => {
      setOpenTimeStart(false);
      setStartTime({ hours, minutes });
    },
    [setOpenTimeStart]
  );
  const onConfirmTimeEnd = React.useCallback(
    ({ hours, minutes }: Time) => {
      setOpenTimeEnd(false);
      setEndTime({ hours, minutes });
    },
    [setOpenTimeEnd]
  );

  // Meeting
  const [meetingTitle, setMeetingTitle] = React.useState<string>("");
  const [meetingLocation, setMeetingLocation] = React.useState<string>("");
  const [selectedMeetingDate, setSelectedMeetingDate] = React.useState<
    Date | undefined
  >(undefined);

  const getSelectedMeetingDate = (selectedMeetingDate: Date) => {
    setSelectedMeetingDate(selectedMeetingDate);
  };

  const checkForMeetingConflict = (
    newMeetingStart: Date,
    newMeetingEnd: Date
  ) => {
    for (const meeting of meetings) {
      // First, check if the meetings are on the same day
      if (newMeetingStart.toDateString() === meeting.start.toDateString()) {
        // Then check if the time ranges overlap
        if (
          doTimesOverlap(
            newMeetingStart,
            newMeetingEnd,
            meeting.start,
            meeting.end
          )
        ) {
          return true; // There is a conflict
        }
      }
    }
    return false; // There is no conflict
  };

  const addMeeting = () => {
    const meetingLocationMissing = !meetingLocation || meetingLocation.trim() === '';
    const meetingTimeMissing = startTime.hours === 0 && startTime.minutes === 0 || endTime.hours === 0 && endTime.minutes === 0;
    if (meetingLocationMissing) {
      Toast.show({
        type: 'error',
        text2: 'Please enter a location for the meeting.',
      });
      return;
    }
    if (meetingTimeMissing) {
      Toast.show({
        type: 'error',
        text2: 'Please enter a start and end time for the meeting.',
      });
      return;
    }
    if (!selectedMeetingDate) {
      Toast.show({
        type: 'error',
        text2: 'Please select a date for the meeting.'
      });
      return;
    }
    const startDateTime = new Date(selectedMeetingDate);
    startDateTime.setHours(startTime.hours, startTime.minutes);
    const endDateTime = new Date(selectedMeetingDate);
    endDateTime.setHours(endTime.hours, endTime.minutes);
    if (endDateTime <= startDateTime) {
      Toast.show({
        type: 'error',
        text2: 'The end time must be after the start time.',
      });
      return;
    }
    if (selectedMeetingDate) {
      const newMeeting: Meeting = {
        title: meetingTitle,
        start: new Date(
          selectedMeetingDate.setHours(startTime.hours, startTime.minutes)
        ),
        end: new Date(
          selectedMeetingDate.setHours(endTime.hours, endTime.minutes)
        ),
        id:
          meetings.length > 0
            ? Math.max(...meetings.map((meeting) => meeting.id)) + 1
            : 0,

        location: meetingLocation,
      };

      // Check if there is a meeting conflict
      if (checkForMeetingConflict(newMeeting.start, newMeeting.end)) {
        Toast.show({
          type: 'error',
          text2: 'There is a meeting conflict!'
        });
        return;
      }

      setMeetings((currentMeetings) => [...currentMeetings, newMeeting]);
      // clear meeting fields
      setResetAddressInput(true);
      setMeetingTitle("");
      setMeetingLocation("");
      setStartTime({ hours: 0, minutes: 0 });
      setEndTime({ hours: 0, minutes: 0 });
    } else {
      alert("Please select a date for the meeting!");
    }
  };

  return (
    <View style={styles.meetingContainer}>
      <Text style={[styles.subTitle, {color: theme === "Dark" ? "#fff" : "#000",}]}>Add your meetings here</Text>
      <TimePickerModal
        visible={openTimeStart}
        onDismiss={onDismissTimeStart}
        onConfirm={onConfirmTimeStart}
        defaultInputType="keyboard"
        hours={12}
        minutes={0}
      />
      <TimePickerModal
        visible={openTimeEnd}
        onDismiss={onDismissTimeEnd}
        onConfirm={onConfirmTimeEnd}
        defaultInputType="keyboard"
        hours={12}
        minutes={0}
      />
      <TextInput
        placeholder="Enter meeting title"
        style={styles.meetingTitleInput}
        onChangeText={(text) => setMeetingTitle(text)}
        value={meetingTitle}
      />

      <AddressAutocomplete
        onAddressSelect={(item: any) => {
          //Can do item.place_id to get the google place_id 
          setMeetingLocation(item.description);
          }}
          resetInput={resetAddressInput}
          onResetInput={() => setResetAddressInput(false)}
        
      />
      <View style={styles.timeContainer}>
        <Pressable
          onPress={() => setOpenTimeStart(true)}
          style={styles.pickRangeBtn}
        >
          {startTime.hours && startTime.minutes != undefined ? (
            <Text style={styles.pickRangeBtnTxt}>
              {startTime.hours}:{String(startTime.minutes).padStart(2, "0")}
            </Text>
          ) : (
            <Text style={styles.pickRangeBtnTxt}>Start time</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => setOpenTimeEnd(true)}
          style={styles.pickRangeBtn}
        >
          {endTime.hours && endTime.minutes != null ? (
            <Text style={styles.pickRangeBtnTxt}>
              {endTime.hours}:{String(endTime.minutes).padStart(2, "0")}
            </Text>
          ) : (
            <Text style={styles.pickRangeBtnTxt}>End time</Text>
          )}
        </Pressable>
      </View>

      <MeetingDateSelector
        rangeDate={rangeDate}
        onData={getSelectedMeetingDate}
      />

      <Pressable
        onPress={() => addMeeting()}
        style={styles.addMeetingBtn}
      >
        <Text style={styles.addMeetingBtnTxt}>Add Meeting</Text>
        <Toast />
      </Pressable>
    </View>
  );
};

export default MeetingCreator;

const styles = StyleSheet.create({
  meetingContainer: {
    width: "100%",
    borderColor: "#ccc", // Subtle border
    borderWidth: 2,
    borderRadius: 5,
    padding: 10,
  },
  subTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  meetingTitleInput: {
    marginBottom: 10,
    height: 35, // Adjusted height
    borderRadius: 6, // Rounded corners
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "#ccc", // Subtle border
    borderWidth: 1,
  },
  timeContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  addMeetingBtn: {
    backgroundColor: "rgba(34, 170, 85, 1)",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  addMeetingBtnTxt: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  pickRangeBtn: {
    backgroundColor: "rgba(34, 170, 85, 1)",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  pickRangeBtnTxt: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

import { NavigationProp } from "@react-navigation/native";
import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import BackgroundGradient from "../../components/BackgroundGradient";
import { DatePickerModal } from "react-native-paper-dates";
import { TimePickerModal } from "react-native-paper-dates";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}
interface DateRange {
  startDate: Date | undefined;
  endDate: Date | undefined;
}
interface Time {
  hours: number;
  minutes: number;
}

// Trip planner
// Step 1 - Get days in trip (Input start and end date)
// Step 2 - For each day prompt user to enter times and location of their meetings
// TODO: get meetings from a calendar API (Google Calendar, Apple Calendar, Outlook Calendar)
// Step 3 - Calculate the free time between meetings
// Step 4 - Get confirmation from user that they want to use those time slots
// Step 5 - Algorithm to find places to go during free time

const Trip = ({ navigation }: RouterProps) => {
  // Control Date
  const [rangeDate, setRangeDate] = React.useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });
  const [openDate, setOpenDate] = React.useState(false);
  const onDismissDate = React.useCallback(() => {
    setOpenDate(false);
  }, [setOpenDate]);

  const onConfirmDate = React.useCallback(
    ({ startDate, endDate }: DateRange) => {
      setOpenDate(false);
      setRangeDate({ startDate, endDate });
    },
    [setOpenDate, setRangeDate]
  );

  // Control Time
  const [openTimeStart, setOpenTimeStart] = React.useState(false);
  const [openTimeEnd, setOpenTimeEnd] = React.useState(false);
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

  // Meeting Control
  const [meetingTitle, setMeetingTitle] = React.useState<string>("");
  const [meetingLocation, setMeetingLocation] = React.useState<string>("");

  const addMeeting = () => {
    console.log("Meeting Title: ", meetingTitle);
    console.log("Meeting Location: ", meetingLocation);
    console.log("Start Time: ", startTime);
    console.log("End Time: ", endTime);

    // clear meeting fields
    setMeetingTitle("");
    setMeetingLocation("");
    setStartTime({ hours: 0, minutes: 0 });
    setEndTime({ hours: 0, minutes: 0 });
  };

  const validRange = {
    startDate: new Date(Date.now()),
    endDate: undefined,
    disabledDates: undefined,
  };

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <Text style={styles.title}>Trip Planner</Text>
        <Text style={styles.subTitle}>
          Select the start and end date of your business trip.
        </Text>
        <View style={styles.dateContainer}>
          <TouchableOpacity
            onPress={() => setOpenDate(true)}
            style={styles.pickRangeBtn}
          >
            {rangeDate.startDate && rangeDate.endDate ? (
              <Text style={styles.pickRangeBtnTxt}>Edit Dates</Text>
            ) : (
              <Text style={styles.pickRangeBtnTxt}>Select Dates</Text>
            )}
          </TouchableOpacity>
          {rangeDate.startDate && rangeDate.endDate ? (
            <View>
              <Text style={styles.dateRangeText}>
                {rangeDate.startDate.toDateString()}
              </Text>
              <Text style={styles.dateRangeText}>
                {rangeDate.endDate.toDateString()}
              </Text>
            </View>
          ) : null}
        </View>

        <DatePickerModal
          locale="en"
          mode="range"
          validRange={validRange}
          startDate={rangeDate.startDate}
          endDate={rangeDate.endDate}
          visible={openDate}
          onDismiss={onDismissDate}
          onConfirm={onConfirmDate}
        />

        <View style={styles.meetingContainer}>
          <Text style={styles.subTitle}>Add your meetings here</Text>
          <TimePickerModal
            visible={openTimeStart}
            onDismiss={onDismissTimeStart}
            onConfirm={onConfirmTimeStart}
            defaultInputType="keyboard"
            hours={12}
            minutes={14}
          />
          <TimePickerModal
            visible={openTimeEnd}
            onDismiss={onDismissTimeEnd}
            onConfirm={onConfirmTimeEnd}
            defaultInputType="keyboard"
            hours={12}
            minutes={14}
          />
          <TextInput
            placeholder="Enter meeting title"
            style={styles.meetingTitleInput}
            onChangeText={(text) => setMeetingTitle(text)}
            value={meetingTitle}
          />

          <TextInput
            placeholder="Enter meeting location"
            style={styles.meetingTitleInput}
            onChangeText={(text) => setMeetingLocation(text)}
            value={meetingLocation}
          />
          <View style={styles.timeContainer}>
            <TouchableOpacity
              onPress={() => setOpenTimeStart(true)}
              style={styles.pickRangeBtn}
            >
              {startTime.hours && startTime.minutes ? (
                <Text style={styles.pickRangeBtnTxt}>
                  {startTime.hours}:{startTime.minutes}
                </Text>
              ) : (
                <Text style={styles.pickRangeBtnTxt}>Start time</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setOpenTimeEnd(true)}
              style={styles.pickRangeBtn}
            >
              {endTime.hours && endTime.minutes ? (
                <Text style={styles.pickRangeBtnTxt}>
                  {endTime.hours}:{endTime.minutes}
                </Text>
              ) : (
                <Text style={styles.pickRangeBtnTxt}>End time</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={addMeeting} style={styles.addMeetingBtn}>
            <Text style={styles.addMeetingBtnTxt}>Add Meeting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundGradient>
  );
};

export default Trip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    marginHorizontal: 40,
    marginTop: 40,
  },
  dateContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  pickRangeBtn: {
    backgroundColor: "#00FF55",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  addMeetingBtn: {
    backgroundColor: "#00FF55",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  pickRangeBtnTxt: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  addMeetingBtnTxt: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  dateRangeText: {
    color: "white",
    fontSize: 16,
  },
  meetingTitleInput: {
    marginBottom: 10,
    height: 25, // Adjusted height
    borderRadius: 6, // Rounded corners
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "#ccc", // Subtle border
    borderWidth: 1,
  },
  meetingContainer: {
    width: "100%",
    borderColor: "#ccc", // Subtle border
    borderWidth: 2,
    borderRadius: 5,
    padding: 10,
  },

  timeContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
});

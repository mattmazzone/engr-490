import { NavigationProp } from "@react-navigation/native";
import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";
import { DatePickerModal } from "react-native-paper-dates";
import { TimePickerModal } from "react-native-paper-dates";
import { Picker } from "@react-native-picker/picker";
import { DateRange, Meeting, Time } from "../../types/tripTypes";
import MeetingList from "../../components/TripScreen/MeetingList";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

// Trip planner
// Step 1 - Get days in trip (Input start and end date)
// Step 2 - For each day prompt user to enter times and location of their meetings
// TODO: get meetings from a calendar API (Google Calendar, Apple Calendar, Outlook Calendar)
// Step 3 - Calculate the free time between meetings
// Step 4 - Get confirmation from user that they want to use those time slots
// Step 5 - Algorithm to find places to go during free time

// Helper function to check if two time ranges overlap
const doTimesOverlap = (start1: Date, end1: Date, start2: Date, end2: Date) => {
  return start1 < end2 && start2 < end1;
};

const Trip = ({ navigation }: RouterProps) => {
  // Control Date
  const [rangeDate, setRangeDate] = React.useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });
  const [dates, setDates] = React.useState<Date[]>([]);
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

  const arrayOfDates = () => {
    if (rangeDate.startDate && rangeDate.endDate) {
      let currentDate = new Date(rangeDate.startDate.getTime()); // Clone the date to avoid mutating the original state
      let newDates = [];
      while (currentDate <= rangeDate.endDate) {
        newDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setDates(newDates);

      // Automatically set the meetingDate to the first date in the array
      if (newDates.length > 0) {
        setMeetingDate(newDates[0]);
      }
    }
  };

  React.useEffect(() => {
    arrayOfDates();

    if (dates.length > 0) {
      setMeetingDate(dates[0]);
    }
  }, [rangeDate, dates.length]);

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
  const [meetingDate, setMeetingDate] = React.useState<Date | undefined>(
    undefined
  );
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const deleteMeeting = (id: string) => {
    setMeetings((prevMeetings) =>
      prevMeetings.filter((meeting) => meeting.id !== id)
    );
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
    if (meetingDate) {
      const newMeeting: Meeting = {
        title: meetingTitle,
        start: new Date(
          meetingDate.setHours(startTime.hours, startTime.minutes)
        ),
        end: new Date(meetingDate.setHours(endTime.hours, endTime.minutes)),
        id:
          meetings.length > 0
            ? Math.max(...meetings.map((meeting) => meeting.id)) + 1
            : 0,

        location: meetingLocation,
      };

      setMeetings((currentMeetings) => [...currentMeetings, newMeeting]);
      // clear meeting fields
      setMeetingTitle("");
      setMeetingLocation("");
      setStartTime({ hours: 0, minutes: 0 });
      setEndTime({ hours: 0, minutes: 0 });
    }
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
          {dates.length > 0 && (
            <>
              <Text style={styles.subTitle}>
                Select the date for this meeting
              </Text>
              <Picker
                selectedValue={meetingDate?.toDateString()}
                style={styles.meetingDropdown}
                onValueChange={(itemValue, itemIndex) => {
                  setMeetingDate(
                    dates.find((date) => date.toDateString() === itemValue)
                  );
                }}
              >
                {dates.map((date, index) => (
                  <Picker.Item
                    key={index}
                    label={date.toDateString()}
                    value={date.toDateString()}
                  />
                ))}
              </Picker>
            </>
          )}

          <TouchableOpacity
            onPress={() => addMeeting()}
            style={styles.addMeetingBtn}
          >
            <Text style={styles.addMeetingBtnTxt}>Add Meeting</Text>
          </TouchableOpacity>
        </View>
        <MeetingList meetings={meetings} onDeleteMeeting={deleteMeeting} />
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
  meetingDropdown: {
    width: "100%",
    height: 25,
    marginBottom: 10,
    borderRadius: 6, // Rounded corners
  },
});

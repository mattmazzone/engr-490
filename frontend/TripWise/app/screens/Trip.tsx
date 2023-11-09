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
  dateRangeText: {
    color: "white",
    fontSize: 16,
  },
  pickRangeBtn: {
    backgroundColor: "#00FF55",
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

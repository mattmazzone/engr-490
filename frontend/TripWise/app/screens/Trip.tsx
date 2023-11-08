import { NavigationProp } from "@react-navigation/native";
import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import BackgroundGradient from "../../components/BackgroundGradient";
import { DatePickerModal } from "react-native-paper-dates";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}
interface DateRange {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

// Trip planner
// Step 1 - Get days in trip (Input start and end date)
// Step 2 - For each day prompt user to enter times and location of their meetings
// TODO: get meetings from a calendar API (Google Calendar, Apple Calendar, Outlook Calendar)
// Step 3 - Calculate the free time between meetings
// Step 4 - Get confirmation from user that they want to use those time slots
// Step 5 - Algorithm to find places to go during free time

const Trip = ({ navigation }: RouterProps) => {
  const [range, setRange] = React.useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });
  const [open, setOpen] = React.useState(false);

  const onDismiss = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = React.useCallback(
    ({ startDate, endDate }: DateRange) => {
      setOpen(false);
      setRange({ startDate, endDate });
    },
    [setOpen, setRange]
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
            onPress={() => setOpen(true)}
            style={styles.pickRangeBtn}
          >
            {range.startDate && range.endDate ? (
              <Text style={styles.pickRangeBtnTxt}>Edit Dates</Text>
            ) : (
              <Text style={styles.pickRangeBtnTxt}>Select Dates</Text>
            )}
          </TouchableOpacity>
          {range.startDate && range.endDate ? (
            <View>
              <Text style={styles.dateRangeText}>
                {range.startDate.toDateString()}
              </Text>
              <Text style={styles.dateRangeText}>
                {range.endDate.toDateString()}
              </Text>
            </View>
          ) : null}
        </View>

        <DatePickerModal
          locale="en"
          mode="range"
          validRange={validRange}
          startDate={range.startDate}
          endDate={range.endDate}
          visible={open}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
        />
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
    marginBottom: 40,
  },
  pickRangeBtnTxt: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  dateRangeText: {
    color: "white",
    fontSize: 16,
  },
});

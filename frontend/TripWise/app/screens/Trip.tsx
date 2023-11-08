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
      <View>
        <TouchableOpacity onPress={() => setOpen(true)}>
          <Text>Pick range</Text>
        </TouchableOpacity>
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
    alignItems: "center",
  },
});

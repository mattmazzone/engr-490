import React, { useState, useEffect, useContext } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import {
  DatePickerModal,
  registerTranslation,
  en,
} from "react-native-paper-dates";
import { DateRange, Meeting, Time } from "../../types/tripTypes";
import ThemeContext from "../../context/ThemeContext";

registerTranslation("en", en);

interface DateRangePickerProps {
  onData: (dateRange: DateRange) => void;
}

const DateRangePicker = ({ onData }: DateRangePickerProps) => {
  const [rangeDate, setRangeDate] = React.useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const {theme} = useContext(ThemeContext);

  useEffect(() => {
    if (rangeDate.startDate && rangeDate.endDate) {
      onData(rangeDate);
    }
  }, [rangeDate]);

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
    <>
      <Text style={[styles.subTitle, {color: theme === "Dark" ? "#fff" : "#000",}]}>
        Start by selecting the dates of your trip
      </Text>
      <View style={styles.dateContainer}>
        <Pressable
          onPress={() => setOpenDate(true)}
          style={styles.pickRangeBtn}
        >
          {rangeDate.startDate && rangeDate.endDate ? (
            <Text style={styles.pickRangeBtnTxt}>Edit Dates</Text>
          ) : (
            <Text style={styles.pickRangeBtnTxt}>Select Dates</Text>
          )}
        </Pressable>
        {rangeDate.startDate && rangeDate.endDate ? (
          <View>
            <Text style={[styles.dateRangeText, {color: theme === "Dark" ? "#fff" : "#000",}]}>
              {rangeDate.startDate.toDateString()}
            </Text>
            <Text style={[styles.dateRangeText, {color: theme === "Dark" ? "#fff" : "#000",}]}>
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
    </>
  );
};

export default DateRangePicker;

const styles = StyleSheet.create({
  subTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  dateContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dateRangeText: {
    color: "white",
    fontSize: 16,
  },
  pickRangeBtn: {
    backgroundColor: "#2a5",
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

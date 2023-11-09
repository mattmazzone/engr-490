import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { DatePickerModal } from "react-native-paper-dates";
import { DateRange, Meeting, Time } from "../../types/tripTypes";

interface DateRangePickerProps {
  onData: (dateRange: DateRange) => void;
}

const DateRangePicker = ({ onData }: DateRangePickerProps) => {
  const [rangeDate, setRangeDate] = React.useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

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

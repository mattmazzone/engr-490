import React, { useState, useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DateRange, Meeting, Time } from "../../types/tripTypes";

interface MeetingDateSelectorProps {
  rangeDate: DateRange;
  onData: (meetingDate: Date) => void;
}

const MeetingDateSelector = ({
  rangeDate,
  onData,
}: MeetingDateSelectorProps) => {
  const [meetingDate, setMeetingDate] = React.useState<Date | undefined>(
    undefined
  );
  const [dates, setDates] = React.useState<Date[]>([]);

  useEffect(() => {
    if (meetingDate) {
      onData(meetingDate);
    }
  }, [meetingDate]);

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

  return (
    <>
      <Text style={styles.subTitle}>Select the date for this meeting</Text>
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
  );
};

export default MeetingDateSelector;

const styles = StyleSheet.create({
  meetingDropdown: {
    width: "100%",
    height: 25,
    marginBottom: 10,
    borderRadius: 6, // Rounded corners
  },
  subTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
});

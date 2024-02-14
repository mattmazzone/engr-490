import React, { useState, useEffect, useContext } from "react";
import { Text, StyleSheet } from "react-native";
import ModalSelector from "react-native-modal-selector";
import { DateRange } from "../../types/tripTypes";
import ThemeContext from "../../context/ThemeContext";

interface MeetingDateSelectorProps {
  rangeDate: DateRange;
  onData: (meetingDate: Date) => void;
}

const MeetingDateSelector = ({
  rangeDate,
  onData,
}: MeetingDateSelectorProps) => {
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(undefined);
  const [dateOptions, setDateOptions] = useState<
    { key: number; label: string }[]
  >([]);
  const {theme} = useContext(ThemeContext);

  useEffect(() => {
    if (meetingDate) {
      onData(meetingDate);
    }
  }, [meetingDate]);

  useEffect(() => {
    if (rangeDate.startDate && rangeDate.endDate) {
      let currentDate = new Date(rangeDate.startDate.getTime());
      let newDateOptions = [];
      let index = 0;
      while (currentDate <= rangeDate.endDate) {
        newDateOptions.push({
          key: index++,
          label: currentDate.toDateString(),
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setDateOptions(newDateOptions);
      if (newDateOptions.length > 0) {
        setMeetingDate(new Date(newDateOptions[0].label));
      }
    }
  }, [rangeDate]);

  return (
    <>
      <Text style={[styles.subTitle, {color: theme === "Dark" ? "#fff" : "#000"}]}>Select the date for this meeting</Text>
      <ModalSelector
        data={dateOptions}
        initValue="Select a date"
        onChange={(option) => {
          setMeetingDate(new Date(option.label));
        }}
        style={styles.meetingDropdown}
        initValueTextStyle={styles.initValueTextStyle}
        selectTextStyle={styles.selectTextStyle}
      />
    </>
  );
};

export default MeetingDateSelector;

const styles = StyleSheet.create({
  meetingDropdown: {
    width: "100%",
    marginBottom: 10,
    backgroundColor: "grey"
  },
  initValueTextStyle: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
  selectTextStyle: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },

  subTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
});

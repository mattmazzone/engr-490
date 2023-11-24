import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Calendar } from "react-native-big-calendar";

const CalendarConfirmModal = ({ closeModal, createTripHandler, rangeDate, calendarEvents }: any) => {
  return (
    <SafeAreaView style={styles.modalContent}>
      <View style={styles.calendarContainer}>
        {rangeDate.startDate && rangeDate.endDate && (
          <Calendar
            events={calendarEvents}
            date={new Date(rangeDate.startDate)}
            height={600}
          />
        )}
      </View>
      <View style={styles.buttonCalendarContainter}>
        <TouchableOpacity
          onPress={() => closeModal()}
          style={[styles.button, { marginRight: 10 }]}
        >
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={createTripHandler}
          style={[styles.button, { marginLeft: 10 }]}
        >
          <Text style={styles.buttonText}>Confirm Trip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
export default CalendarConfirmModal;

const styles = StyleSheet.create({
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: "blue",
    marginTop: 20,
    marginBottom: 10,
  },
  buttonCalendarContainter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calendarContainer: {
    flex: 1,
    width: "100%",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
});

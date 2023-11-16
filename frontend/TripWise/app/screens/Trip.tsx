import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView,
  Modal,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";
import DateRangePicker from "../../components/TripScreen/DateRangePicker";

import { DateRange, Meeting, Time } from "../../types/tripTypes";
import MeetingCreator from "../../components/TripScreen/MeetingCreator";
import MeetingList from "../../components/TripScreen/MeetingList";

import { createTrip } from "../../services/userServices";

import { Calendar } from 'react-native-big-calendar';

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
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const deleteMeeting = (id: number) => {
    setMeetings((prevMeetings) =>
      prevMeetings.filter((meeting) => meeting.id !== id)
    );
  };

  const [confirmTripModalVisible, setConfirmTripModalVisible] = useState(false);

  const getDateRange = (dateRange: DateRange) => {
    setRangeDate(dateRange);
  };

  const createTripHandler = () => {
    // Error checking
    if (!rangeDate.startDate || !rangeDate.endDate) {
      alert("Please select a date range");
      return;
    }

    setConfirmTripModalVisible(true);

    //createTrip(rangeDate.startDate, rangeDate.endDate, meetings); //TODO: uncomment and add somewhere else, only for testing now
  };

  const calendarEvents = meetings.map((meeting) => ({
    title: meeting.title,
    start: meeting.start,
    end: meeting.end,
    id: meeting.id,
    location: meeting.location,
  }));


  //Confirm trip Modal
  const calendarConfirm = ({ closeModal, navigation }: any) => {
    return (
      <SafeAreaView style={styles.modalContent}>
        <View style={styles.calendarContainer}>
          <Calendar events={calendarEvents} height={600} />
        </View>
          <Text>Calendar Confirm Modal</Text>
          <TouchableOpacity onPress={() => closeModal()} style={styles.button}>
            <Text style={styles.buttonText}>Close Modal</Text>
          </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Trip Planner</Text>
          
          <DateRangePicker onData={getDateRange} />
          {rangeDate.startDate && rangeDate.endDate ? (
            <>
              <MeetingCreator
                meetings={meetings}
                rangeDate={rangeDate}
                setMeetings={setMeetings}
                //have to save meeting here
              />
              <MeetingList
                meetings={meetings}
                onDeleteMeeting={deleteMeeting}
              />
            </>
          ) : (
            <></>
          )}
          <Modal
            animationType="slide"
            transparent={false}
            visible={confirmTripModalVisible}
            onRequestClose={() => {
              setConfirmTripModalVisible(!confirmTripModalVisible);
            }}
          >
            {calendarConfirm({
              closeModal: () => setConfirmTripModalVisible(false),
              navigation: navigation // Assuming you have the navigation prop available
          })}
          
        </Modal>

          <TouchableOpacity
            onPressIn={() => {
              //add modal
              createTripHandler(); //maybe delete and add to modal
            }}
            onPress={createTripHandler}
            style={styles.button}
            disabled={!rangeDate.startDate || !rangeDate.endDate}
          >
            <Text style={styles.buttonText}>Create Trip</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
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

  scrollView: {
    width: "100%",
    paddingBottom: 110, //padding so meetings stop at nav bar
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
  button: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: "blue",
    marginTop: 20,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1, // This will ensure the content uses the full available space
    justifyContent: 'center', // Centers content vertically in the container
    alignItems: 'center', // Centers content horizontally in the container
    marginTop: 22, // You can adjust this value as needed
  },
  calendarContainer: {
    flex: 1, // This will allow the calendar to expand
    width: '100%', // Make sure the calendar takes the full width
    // You might not need marginTop here, or adjust as needed for your layout
  },
});

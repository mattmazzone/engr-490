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

import { DateRange, Meeting, TripType } from "../../types/tripTypes";
import MeetingCreator from "../../components/TripScreen/MeetingCreator";
import MeetingList from "../../components/TripScreen/MeetingList";

import { createTrip, fetchCurrentTrip } from "../../services/userServices";

import { Calendar } from "react-native-big-calendar";

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
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [currentTrip, setCurrentTrip] = useState(null) as any;

  useEffect(() => {
    const initializeCurrentTrip = async () => {
      try {
        const currentTrip = await fetchCurrentTrip();
        setCurrentTrip(currentTrip);
        console.log("currentTrip", currentTrip);
        console.log("currentTrip.tripMeetings", currentTrip.trip.tripMeetings);
        setMeetings(currentTrip.trip.tripMeetings);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    initializeCurrentTrip();
  }, []);

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

    createTrip(rangeDate.startDate, rangeDate.endDate, meetings);

    setShowCalendarView(true);
  };

  const calendarEvents = meetings.map((meeting) => ({
    title: meeting.title,
    start: new Date(meeting.start),
    end: new Date(meeting.end),
    id: meeting.id,
    location: meeting.location,
  }));

  //Confirm trip Modal
  const calendarConfirm = ({ closeModal, createTripHandler }: any) => {
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

  if (isFetching) {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Trip Planner</Text>
          <Text style={styles.subTitle}>Loading...</Text>
        </SafeAreaView>
      </BackgroundGradient>
    );
  }

  if (currentTrip) {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          <View style={styles.calendarContainer}>
            <Calendar
              events={calendarEvents}
              date={new Date(currentTrip.trip.tripStart)}
              height={600}
              mode="day"
            />
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    );
  }

  if (showCalendarView) {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          <View style={styles.calendarContainer}>
            {rangeDate.startDate && rangeDate.endDate && (
              <Calendar
                events={calendarEvents}
                date={new Date(rangeDate.startDate)}
                height={600}
                mode="day"
              />
            )}
          </View>
        </SafeAreaView>
      </BackgroundGradient>
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
              <TouchableOpacity
                onPressIn={() => {
                  setConfirmTripModalVisible(true);
                }}
                style={styles.button}
                disabled={!rangeDate.startDate || !rangeDate.endDate}
              >
                <Text style={styles.buttonText}>Create Trip</Text>
              </TouchableOpacity>
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
              createTripHandler: createTripHandler,
            })}
          </Modal>
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
    marginBottom: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  calendarContainer: {
    flex: 1,
    width: "100%",
  },
  buttonCalendarContainter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

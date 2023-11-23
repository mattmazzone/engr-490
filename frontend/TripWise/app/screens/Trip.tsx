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
import ImportEventsFromProvider from "../../components/TripScreen/ImportEventsFromProvider";

import { createTrip, fetchCurrentTrip } from "../../services/userServices";

import { Calendar } from "react-native-big-calendar";
import CalendarConfirmModal from "../../components/TripScreen/CalendarConfimModal";

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
  const [importEventsVisible, setImportEventsVisible] = useState(true);

  const [confirmTripModalVisible, setConfirmTripModalVisible] = useState(false);

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [currentTrip, setCurrentTrip] = useState<TripType | null>(null);

  useEffect(() => {
    const initializeCurrentTrip = async () => {
      try {
        const response = await fetchCurrentTrip();

        if (response.hasActiveTrip === false) {
          setCurrentTrip(null);
        } else {
          setCurrentTrip(response.trip);
        }
      } catch (error) {
        console.error("Error fetching current trip:", error);
      } finally {
        setIsFetching(false);
      }
    };

    initializeCurrentTrip();
  }, []);

  const getDateRange = (dateRange: DateRange) => {
    setRangeDate(dateRange);
  };

  const createTripHandler = async () => {
    // Error checking
    if (!rangeDate.startDate || !rangeDate.endDate) {
      alert("Please select a date range");
      return;
    }

    setConfirmTripModalVisible(true);

    // API call to create trip
    const createTripResponse = await createTrip(
      rangeDate.startDate,
      rangeDate.endDate,
      meetings
    );

    // if (createTripResponse) {
    //   const {trip, freeTimeSlots} = createTripResponse;
    // }

    // // Set state to created trip
    // setCurrentTrip(trip);
  };

  const calendarEvents = meetings.map((meeting) => ({
    title: meeting.title,
    start: new Date(meeting.start),
    end: new Date(meeting.end),
    id: meeting.id,
    location: meeting.location,
  }));

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

  const calendartheme = {
    palette: {
      primary: {
        main: "#6185d0",
        contrastText: "#000",
      },
      gray: {
        "100": "#333",
        "200": "transparent",
        "300": "#888",
        "500": "#000",
        "800": "#ccc",
      },
    },
  };

  if (currentTrip) {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.currentTripContainer}>
          <View style={styles.calendarContainer}>
            {currentTrip.tripStart && currentTrip.tripEnd && (
              <Calendar
                events={currentTrip.tripMeetings.map((meeting) => ({
                  title: meeting.title,
                  start: new Date(meeting.start),
                  end: new Date(meeting.end),
                  id: meeting.id,
                  location: meeting.location,
                }))}
                date={new Date(currentTrip.tripStart)}
                height={600}
                mode="3days"
                theme={calendartheme}
              />
            )}
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    );
  }

  const handleImportEventsFromProviderClick = (importEvents: boolean) => {
    if (importEvents) {
      // TODO: navigate to calendar
    } else {
      // close modal
      setImportEventsVisible(false);
    }
  };

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Trip Planner</Text>

          <DateRangePicker onData={getDateRange} />

          {rangeDate.startDate && rangeDate.endDate && importEventsVisible ? (
            <ImportEventsFromProvider
              dateRange={rangeDate}
              onButtonClick={handleImportEventsFromProviderClick}
            />
          ) : (
            <></>
          )}

          {rangeDate.startDate && rangeDate.endDate && !importEventsVisible ? (
            <>
              <MeetingCreator
                meetings={meetings}
                rangeDate={rangeDate}
                setMeetings={setMeetings}
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
            {CalendarConfirmModal({
              closeModal: () => setConfirmTripModalVisible(false),
              createTripHandler: createTripHandler,
              rangeDate: rangeDate,
              calendarEvents: calendarEvents,
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
    textAlign: "left",
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
  calendarContainer: {
    flex: 1,
    width: "100%",
  },

  currentTripContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginHorizontal: 10,
    paddingBottom: 110, //padding so meetings stop at nav bar
    marginTop: 40,
  },
});

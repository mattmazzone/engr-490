import { NavigationProp } from "@react-navigation/native";
import React, { useState, useContext, useEffect } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  View,
  Platform,
  PermissionsAndroid, Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Background from "../../components/Background";
import DateRangePicker from "../../components/TripScreen/DateRangePicker";
import { DateRange, Meeting, TripType } from "../../types/tripTypes";
import MeetingCreator from "../../components/TripScreen/MeetingCreator";
import MeetingList from "../../components/TripScreen/MeetingList";
import ImportEventsFromProvider from "../../components/TripScreen/ImportEventsFromProvider";
import {
  createTrip,
  fetchCurrentTrip,
  getUserProvider,
} from "../../services/userServices";
import CalendarConfirmModal from "../../components/TripScreen/CalendarConfimModal";
import CurrentTrip from "../../components/TripScreen/CurrentTrip";
import ThemeContext from "../../context/ThemeContext";
import { BottomTabParamList } from "../../types/navigationTypes";
import LocationPopup from "../../components/TripScreen/LocationPopup";
import useLocationService from "../../services/useLocationService";



interface RouterProps {
  navigation: NavigationProp<BottomTabParamList, "Trip">;
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
  const [tripLocation, setTripLocation] = React.useState<String | undefined>(undefined);
  const deleteMeeting = (id: number) => {
    setMeetings((prevMeetings) =>
      prevMeetings.filter((meeting) => meeting.id !== id)
    );
  };
  const [importEventsVisible, setImportEventsVisible] = useState(false);
  const [confirmTripModalVisible, setConfirmTripModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [currentTrip, setCurrentTrip] = useState<TripType | null>(null);
  const { theme } = useContext(ThemeContext);
  const [currentLocation, locationError] = useLocationService();


  // useFocusEffect is used to run code when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const initializeTripPage = async () => {
        try {
          const trip = await fetchCurrentTrip();
          const provider = getUserProvider();

          if (trip.hasActiveTrip === false) {
            setCurrentTrip(null);
          } else {
            setCurrentTrip(trip);
          }

          if (provider !== null) {
            setImportEventsVisible(true);
          }
        } catch (error) {
          console.error("Error fetching current trip:", error);
        } finally {
          setIsFetching(false);
        }
      };

      initializeTripPage();
    }, []) // Dependencies for the useCallback hook, if any
  );

  useEffect(() => {
    if (locationError) {
      // Show an alert or modal if there is a location error
      Alert.alert(
        "Location Required",
        "Please accept location permissions to continue. Location is required to create a trip.",
        [
          { text: "OK" }
        ],
        { cancelable: false }
      );
    }
  }, [locationError]);

  const getDateRange = (dateRange: DateRange) => {
    setRangeDate(dateRange);
  };

  const createTripHandler = async () => {
    // Error checking
    if (!rangeDate.startDate || !rangeDate.endDate) {
      alert("Please select a date range");
      return;
    }
    console.log(meetings);
    if (!meetings || meetings.length === 0 || meetings.every(meeting => meeting.location === "" || !meeting.location)) {
      setPopupVisible(true);

      return;
    }

    await continueCreateTrip();
  };

  const continueCreateTrip = async (): Promise<void> => {
    if (locationError) {
      // Optionally handle the case where there's an error again, or simply return to prevent proceeding
      console.log("Location error prevents continuing.");
      return;
    }


    setConfirmTripModalVisible(true);

    // API call to create trip
    const createTripResponse = await createTrip(
      rangeDate.startDate,
      rangeDate.endDate,
      meetings,
      tripLocation,
      currentLocation,
    );

    if (createTripResponse) {
      const trip = createTripResponse.trip;
      setCurrentTrip(trip);
    }
  };

  const calendarEvents = meetings.map((meeting) => ({
    title: meeting.title,
    start: new Date(meeting.start),
    end: new Date(meeting.end),
    id: meeting.id,
    location: meeting.location,
  }));

  const handleImportEventsFromProviderClick = (importEvents: boolean) => {
    if (importEvents) {
      // TODO: navigate to calendar
    } else {
      // close modal
      setImportEventsVisible(false);
    }
  };

  //Popup for location input
  const [popupVisible, setPopupVisible] = useState(false);
  const [locationModalClosed, setLocationModalClosed] = useState(false);

  const handleSaveLocation = (location: string) => {
    setTripLocation(location);
    console.log('Location saved:', location);
  };

  useEffect(() => {
    if (locationModalClosed) {
      continueCreateTrip();
    }
  }, [locationModalClosed]);


  if (isFetching) {
    return (
      <Background>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Trip Planner</Text>
          <Text style={styles.subTitle}>Loading...</Text>
        </SafeAreaView>
      </Background>
    );
  }

  if (currentTrip) {
    return <CurrentTrip currentTrip={currentTrip} />;
  }

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text
            style={[
              styles.title,
              { color: theme === "Dark" ? "#fff" : "#000" },
            ]}
          >
            Trip Planner
          </Text>

          <DateRangePicker onData={getDateRange} />


          {rangeDate.startDate && rangeDate.endDate && importEventsVisible ? (
            <ImportEventsFromProvider
              dateRange={rangeDate}
              onButtonClick={handleImportEventsFromProviderClick}
              onCalendarEvents={(calendarEvents: Meeting[]) => {
                setMeetings(calendarEvents);
                setConfirmTripModalVisible(true);
              }}
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
              <View style={styles.buttonContainer}>
                <Pressable
                  onPressIn={() => {
                    setConfirmTripModalVisible(true);
                  }}
                  style={styles.button}
                  disabled={!rangeDate.startDate || !rangeDate.endDate}
                >
                  <Text style={styles.buttonText}>Create Trip</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <></>
          )}
          {popupVisible && (
            <View style={styles.overlay}>
              <LocationPopup
                visible={popupVisible}
                onClose={() => setPopupVisible(false)}
                onSave={handleSaveLocation}
                onModalClose={() => setLocationModalClosed(true)}
              />
            </View>)}
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
    </Background>
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
    textAlign: "left",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    padding: 15,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 15,
    width: "100%",
  },
  button: {
    backgroundColor: "rgba(34, 170, 85, 1)",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    width: 200,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure this is higher than other content but consider your entire app's layout
  }

});

import React, {useState} from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import Background from "../Background";
import { Calendar } from "react-native-big-calendar";
import { TripType } from "../../types/tripTypes";
import CustomCalendarEvent from "./CustomCalendarEvent";
import ThemeContext from "../../context/ThemeContext";
import { useContext } from "react";
import { Meeting } from "../../types/tripTypes";
import CalendarEventModal from "./CalendarEventModal";

interface CurrentTripProps {
  currentTrip: TripType;
}



const CurrentTrip = ({ currentTrip }: CurrentTripProps) => {
  const {theme} = useContext(ThemeContext);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Meeting | null>(null);

  const handleEventPress = (event: Meeting) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };  

  const calendartheme = {
    palette: {
      primary: {
        main: "rgba(34, 170, 85, 1)",
        contrastText: "#000",
      },
      gray: {
        "100": "#333",
        "200": "transparent",
        "300": "#888",
        "500": theme === "Dark" ? "#fff" : "#000",
        "800": "#ccc",
      },
    },
  };
  const calendarEvents = [
    ...currentTrip.tripMeetings.map((meeting) => ({
      title: meeting.title,
      start: new Date(meeting.start),
      end: new Date(meeting.end),
      id: meeting.id,
      location: meeting.location,
      color: "#6185d0", // Color for meetings
    })),
    ...currentTrip.scheduledActivities.map((slot) => ({
      title: slot.place_similarity.place_name,
      start: new Date(slot.start),
      end: new Date(slot.end),
      location: slot.place_similarity.address,
      color: "#d3d3d3", // A distinct color for free slots
    })),
  ];

  return (
    <Background>
      <SafeAreaView style={styles.currentTripContainer}>
          <View style={styles.calendarContainer}>
            {currentTrip.tripStart && currentTrip.tripEnd && (
              <Calendar
                events={calendarEvents}
                date={new Date(currentTrip.tripStart)}
                height={600}
                mode="3days"
                theme={calendartheme}
                eventCellStyle={(event) => {
                  return {
                    backgroundColor: event.color,
                  };
                }}
                onPressEvent={(event) => {
                  handleEventPress(event);
                }}
                renderEvent={(event, touchableOpacityProps) => (
                  <CustomCalendarEvent
                  {...event}
                  touchableOpacityProps = {touchableOpacityProps}
                  onPress={() => {
                    handleEventPress(event);
                  }}
                  />
                )}
              />
            )}
          </View>
            <CalendarEventModal
              event={selectedEvent}
              isVisible={isModalVisible}
              onClose={() => setModalVisible(false)}
            />
      </SafeAreaView>
    </Background>
  );
};

export default CurrentTrip;

const styles = StyleSheet.create({
  currentTripContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginHorizontal: 10,
    marginTop: 40,
  },
  calendarContainer: {
    flex: 1,
    width: "100%",
    paddingBottom: 70, //padding so meetings stop at nav bar
  },
});

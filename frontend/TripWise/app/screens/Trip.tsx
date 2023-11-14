import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";
import DateRangePicker from "../../components/TripScreen/DateRangePicker";

import { DateRange, Meeting, Time } from "../../types/tripTypes";
import MeetingCreator from "../../components/TripScreen/MeetingCreator";
import MeetingList from "../../components/TripScreen/MeetingList";

import { updateTripMeetings } from "../../services/userServices";

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

  const getDateRange = (dateRange: DateRange) => {
    setRangeDate(dateRange);
  };

  const saveMeetings = async () => {
    try {
      const tripId = "current_id" //need to change for specific trip id!
      await updateTripMeetings(tripId, meetings);
      alert("Meetings updated successfully!");
    } catch (error) {
      alert("Failed to update meetings.");
    }
  };
/*
  const [isFetching, setIsFetching] = useState<boolean>(true); // To track the fetching state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const profile = await UserService.fetchUserProfile();
        setUserProfile(profile);
        setMeetings(profile?.currentMeetings || []);
      }
      catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsFetching(false);
      }
    }
  }
  )

  const handleMeetings = (meeting: Meeting) => {
    setMeetings((prevSelected) =>
      prevSelected.includes(meeting)
        ? prevSelected.filter((i) => i !== meeting)
        : [...prevSelected, meeting]
    );
  };
*/
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
              <MeetingList meetings={meetings} onDeleteMeeting={deleteMeeting} />
            </>
          ) : (
            <></>
          )}
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
    width: '100%',
    paddingBottom: 110 //padding so meetings stop at nav bar
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
});

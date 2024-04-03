import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { TripType } from "../../types/tripTypes";
import ThemeContext from "../../context/ThemeContext";

interface PastTripDetailsModalProps {
  tripData: TripType | null;
  isVisible: boolean;
  onClose: () => void;
}

const PastTripDetailsModal: React.FC<PastTripDetailsModalProps> = ({
  tripData,
  isVisible,
  onClose,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { theme } = useContext(ThemeContext);

  // Effect to scroll to the top whenever the modal becomes visible
  useEffect(() => {
    if (isVisible && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }
  }, [isVisible]);

  if (!tripData) return null;

  // Formatting trip start and end dates
  const formattedStartDate = new Date(tripData.tripStart).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const formattedEndDate = new Date(tripData.tripEnd).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <ScrollView
        contentContainerStyle={styles.modalContent}
        ref={scrollViewRef}
      >
        <Text
          style={[
            styles.modalHeading,
            { color: theme === "Dark" ? "#fff" : "#000" },
          ]}
        >
          Trip Details
        </Text>
        <Text
          style={[
            styles.modalText,
            { color: theme === "Dark" ? "#fff" : "#000" },
          ]}
        >
          Duration: {formattedStartDate} to {formattedEndDate}
        </Text>

        {/* Meetings */}
        <Text
          style={[
            styles.modalSectionTitle,
            { color: theme === "Dark" ? "#fff" : "#000" },
          ]}
        >
          Meetings:
        </Text>
        {tripData.tripMeetings.map((meeting, index) => (
          <View key={index} style={styles.modalItem}>
            <Text
              style={[
                styles.modalItemTitle,
                { color: theme === "Dark" ? "#fff" : "#000" },
              ]}
            >
              {meeting.title}
            </Text>
            <Text
              style={[
                styles.modalText,
                { color: theme === "Dark" ? "#fff" : "#000" },
              ]}
            >
              Date & Time: {new Date(meeting.start).toLocaleString()}
            </Text>
            <Text
              style={[
                styles.modalText,
                { color: theme === "Dark" ? "#fff" : "#000" },
              ]}
            >
              Location: {meeting.location}
            </Text>
          </View>
        ))}

        {/* Scheduled Activities */}
        <Text
          style={[
            styles.modalSectionTitle,
            { color: theme === "Dark" ? "#fff" : "#000" },
          ]}
        >
          Scheduled Activities:
        </Text>
        {tripData.scheduledActivities.map((activity, index) => (
          <View key={index} style={styles.modalItem}>
            <Text
              style={[
                styles.modalItemTitle,
                { color: theme === "Dark" ? "#fff" : "#000" },
              ]}
            >
              {activity.place_similarity.place_name}
            </Text>
            <Text
              style={[
                styles.modalText,
                { color: theme === "Dark" ? "#fff" : "#000" },
              ]}
            >
              Date & Time: {new Date(activity.start).toLocaleString()}
            </Text>
            <Text
              style={[
                styles.modalText,
                { color: theme === "Dark" ? "#fff" : "#000" },
              ]}
            >
              Address: {activity.place_similarity.address}
            </Text>
          </View>
        ))}

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
};

export default PastTripDetailsModal;

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
  },
  modalHeading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  modalItem: {
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#505050", // Adjust the color based on your theme or preference
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#505050",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";
import { UserProfile } from "../../types/userTypes";
import * as UserService from "../../services/userServices";

const interestsArray = [
  "Restaurants",
  "Arts",
  "Bars",
  "Sports",
  "Politics",
  "History",
  "Social Media",
  "Real Estate",
  "Dating",
  "Religion",
  "Sightseeing",
  "Cars",
  "Coffee",
  "Nature",
];

const SelectInterests = () => {
  // A state to keep track of selected interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true); // To track the fetching state

  useEffect(() => {
    const initializeUserProfile = async () => {
      try {
        const profile = await UserService.fetchUserProfile();
        setUserProfile(profile);
        // If the user has interests, set the selected interests to the user's interests
        setSelectedInterests(profile?.interests || []);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    initializeUserProfile();
  }, []);

  // Function to handle interest selection
  const handleSelectInterest = (interest: string) => {
    setSelectedInterests((prevSelected) =>
      prevSelected.includes(interest)
        ? prevSelected.filter((i) => i !== interest)
        : [...prevSelected, interest]
    );
  };

  // Function to handle updating interests
  const handleUpdateInterests = async () => {
    if (userProfile && userProfile.uid) {
      try {
        await UserService.updateUserInterests(selectedInterests);
        // If success the button should be disabled
        const updatedProfile = await UserService.fetchUserProfile();

        if (!updatedProfile) {
          // Handle the error, perhaps by showing an error message
          return;
        }

        if (arraysEqual(updatedProfile.interests, selectedInterests)) {
          // The interests have been successfully updated.
          // Update local state or context with the new profile data
          setUserProfile(updatedProfile);
          // Optionally, show a success message to the user
        } else {
          // The fetched interests don't match the expected values.
          // Handle the mismatch, possibly by showing an error message
        }
      } catch (error) {
        console.error("Error updating interests:", error);
        // Handle error, perhaps show an error message
      }
    }
  };

  // Function to compare arrays regardless of order
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((value, index) => value === sortedB[index]);
  };

  // Check if the selected interests are different from the user profile's interests
  const hasChangedInterests = () => {
    // If userProfile.interests doesn't exist or if arrays are not equal, return true
    return (
      !userProfile?.interests ||
      !arraysEqual(selectedInterests, userProfile.interests)
    );
  };

  // Render each interest as a button
  const renderInterestButtons = () => {
    return interestsArray.map((interest) => (
      <TouchableOpacity
        key={interest}
        style={[
          styles.interestButton,
          selectedInterests.includes(interest)
            ? styles.selectedInterestButton
            : {},
        ]}
        onPress={() => handleSelectInterest(interest)}
        activeOpacity={0.7}
      >
        <Text style={styles.interestButtonText}>{interest}</Text>
      </TouchableOpacity>
    ));
  };

  // TODO: REPLACE WITH COOL SPINNER
  if (isFetching) {
    return (
      <BackgroundGradient>
        <Text>Loading...</Text>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container}>
        <Text
          style={styles.welcomeText}
        >{`Welcome ${userProfile?.firstName}!`}</Text>
        <Text style={styles.instructionsText}>
          Please select the interests that best describe you.
        </Text>
        <View style={styles.interestsWrapper}>{renderInterestButtons()}</View>

        {/* Update Interests Button */}
        <TouchableOpacity
          onPress={handleUpdateInterests}
          disabled={selectedInterests.length < 4 || !hasChangedInterests()}
          style={[
            styles.button,
            selectedInterests.length < 4 || !hasChangedInterests()
              ? styles.buttonDisabled
              : {},
          ]}
        >
          <Text style={styles.buttonText}>Update Interests</Text>
        </TouchableOpacity>
      </ScrollView>
    </BackgroundGradient>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
  },
  interestsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  interestButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 20,
    margin: 5,
  },
  selectedInterestButton: {
    backgroundColor: "green",
  },
  interestButtonText: {
    color: "#fff",
    textAlign: "center",
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
  buttonDisabled: {
    backgroundColor: "#aaa", // or any other color that indicates the button is disabled
  },
});

export default SelectInterests;

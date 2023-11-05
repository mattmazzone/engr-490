import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";

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

  // Function to handle interest selection
  const handleSelectInterest = (interest: string) => {
    setSelectedInterests((prevSelected) => {
      if (prevSelected.includes(interest)) {
        // Deselect it
        return prevSelected.filter((i) => i !== interest);
      } else {
        // Select it
        return [...prevSelected, interest];
      }
    });
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

  return (
    <BackgroundGradient>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>Welcome Matteo!</Text>
      <Text style={styles.instructionsText}>
        Please select the interests that best describe you.
      </Text>
      <View style={styles.interestsWrapper}>{renderInterestButtons()}</View>
    </ScrollView>
    </BackgroundGradient>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#000", // Assuming a dark theme
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
    borderWidth: 1,
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
});

export default SelectInterests;

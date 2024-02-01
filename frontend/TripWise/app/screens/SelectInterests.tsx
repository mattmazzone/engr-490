import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import Background from "../../components/Background";
import { UserProfile } from "../../types/userTypes";
import * as UserService from "../../services/userServices";
import { arraysEqual } from "../../util/arraysEqual";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ThemeContext from "../../context/ThemeContext";
import { NavigationProp } from "@react-navigation/native";

interface Item {
  id: string;
  titles: string[];
}

interface Category {
  name: string;
  items: Item[];
}

// Define the categories array based on the new structure
const categories: Category[] = [
  {
    name: "Culture 🎨",
    items: [{ id: "Culture 🎨", titles: ["culture"] }],
  },
  {
    name: "Food & Drink 🍔",
    items: [
      {
        id: "Asian Cuisine 🥢",
        titles: [
          "chinese_restaurant",
          "japanese_restaurant",
          "indonesian_restaurant",
          "korean_restaurant",
          "ramen_restaurant",
          "sushi_restaurant",
          "vietnamese_restaurant",
          "thai_restaurant",
        ],
      },
      {
        id: "Middle Eastern Cuisine 🧆",
        titles: [
          "lebanese_restaurant",
          "middle_eastern_restaurant",
          "turkish_restaurant",
        ],
      },
      {
        id: "American Cuisine 🍟",
        titles: [
          "american_restaurant",
          "barbecue_restaurant",
          "hamburger_restaurant",
          "pizza_restaurant",
        ],
      },
      { id: "Cafe ☕", titles: ["cafe", "bakery", "sandwich_restaurant"] },
      {
        id: "Breakfast 🍳",
        titles: ["breakfast_restaurant", "brunch_restaurant"],
      },
      {
        id: "Italian Cuisine 🍝",
        titles: ["italian_restaurant", "pizza_restaurant"],
      },
      {
        id: "Mediterranean Cuisine 🍱",
        titles: ["mediterranean_restaurant", "greek_restaurant"],
      },
      { id: "Vegan 🌱", titles: ["vegan_restaurant", "vegetarian_restaurant"] },
      {
        id: "South American Cuisine 🥘",
        titles: ["brazilian_restaurant", "mexican_restaurant"],
      },
    ],
  },
  {
    name: "Entertainemnt & Recreation 🎉",
    items: [
      { id: "Amusement Park 🎢", titles: ["amusement_park"] },
      { id: "Aquarium 🐟", titles: ["aquarium"] },
      { id: "Bowling 🎳", titles: ["bowling_alley"] },
      { id: "Casino 🎰", titles: ["casino"] },
      { id: "Movies 🎬", titles: ["movie_theatre"] },
      { id: "Outdoors 🌳", titles: ["national_park", "hiking_area"] },
      { id: "Night Club 🕺", titles: ["night_club"] },
      { id: "Tourist Attraction 🗺️", titles: ["tourist_attraction"] },
      { id: "Zoo 🦁", titles: ["zoo"] },
      { id: "History 📜", titles: ["historical_landmark"] },
    ],
  },
  {
    name: "Health & Wellness 💆",
    items: [{ id: "Spa 💅", titles: ["spa"] }],
  },
  {
    name: "Places of Worship 🛐",
    items: [
      { id: "Church ⛪", titles: ["chruch"] },
      { id: "Temple 🕍", titles: ["hindu_temple"] },
      { id: "Mosque 🕌", titles: ["mosque"] },
      { id: "Synagogue 🕍", titles: ["synagogue"] },
    ],
  },
  {
    name: "Shopping 🛍️",
    items: [
      { id: "Book Store 📚", titles: ["book_store"] },
      { id: "Clothing Store 👗", titles: ["clothing_store"] },
      { id: "Gift Shop 🎁", titles: ["gift_shop"] },
      { id: "Jewellery Store 💍", titles: ["jewellery_store"] },
      { id: "Liquor Store 🍷", titles: ["liquor_store"] },
      { id: "Shopping Mall 🏬", titles: ["shopping_mall"] },
    ],
  },
  {
    name: "Sports ⚽",
    items: [
      { id: "Golf ⛳", titles: ["golf_course"] },
      { id: "Gym 💪", titles: ["gym"] },
      { id: "Playground 🤸", titles: ["playground"] },
      { id: "Ski 🎿", titles: ["ski"] },
      { id: "Sports Club 🏟️", titles: ["sports_club"] },
      { id: "Swimming Pool 🏊", titles: ["swimming_pool"] },
    ],
  },
];
interface RouterProps {
  route: any;
  navigation: NavigationProp<any, any>;
}
const SelectInterests = ({ route, navigation }: RouterProps) => {
  const { theme } = useContext(ThemeContext);
  const { setUserInterests } = route.params || {};
  // A state to keep track of selected interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true); // To track the fetching state

  // Fetch user profile and initialize component state on mount
  useEffect(() => {
    const initializeUserProfile = async () => {
      try {
        const profile = await UserService.fetchUserProfile();
        setUserProfile(profile);
        // If the user has interests, set the selected interests to the user's interests
        const storedInterests = await AsyncStorage.getItem("selectedInterests");
        setSelectedInterests(
          storedInterests
            ? JSON.parse(storedInterests)
            : profile?.interests || []
        );
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    initializeUserProfile();
  }, []);

  const handleSelectInterest = (categoryId: string, subcategoryId: string) => {
    setSelectedInterests((prevSelected) => {
      const isSelected = prevSelected.includes(subcategoryId);
      return isSelected
        ? prevSelected.filter((item) => item !== subcategoryId)
        : [...prevSelected, subcategoryId];
    });
  };

  // Function to handle updating interests
  const handleUpdateInterests = async () => {
    if (userProfile && userProfile.uid) {
      try {
        // Create an array of interest titles
        const selectedInterestTitles = selectedInterests
          .map((interestId) => {
            const foundInterest = categories
              .flatMap((category) => category.items)
              .find((categoryItem) => categoryItem.id === interestId);
            return foundInterest ? foundInterest.titles : [];
          })
          .flat();

        // Update user interests using the array of interest titles
        await UserService.updateUserInterests(selectedInterestTitles);

        // Store selected interests in AsyncStorage
        await AsyncStorage.setItem(
          "selectedInterests",
          JSON.stringify(selectedInterests)
        );

        // Fetch the updated profile to ensure the data was updated successfully
        const updatedProfile = await UserService.fetchUserProfile();

        if (!updatedProfile) {
          // Handle the error, perhaps by showing an error message
          return;
        }

        // Check if the fetched interests match the expected values.
        if (arraysEqual(updatedProfile.interests, selectedInterestTitles)) {
          // The interests have been successfully updated.
          // Update local state or context with the new profile data
          setUserProfile(updatedProfile);
          // Optionally, show a success message to the user
          if (setUserInterests) {
            setUserInterests(true);
          } else {
            // If setUserInterests is not provided, navigate to the home screen
            navigation.navigate("Home");
          }
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

  // Check if the selected interests are different from the user profile's interests
  function hasChangedInterests() {
    // If userProfile.interests doesn't exist or if arrays are not equal, return true
    return (
      !userProfile?.interests ||
      !arraysEqual(selectedInterests, userProfile.interests)
    );
  }
  // Function to render interest buttons based on the lookup table

  const renderInterestButtons = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <View key={category.name} style={styles.categoryContainer}>
            <Text
              style={[
                styles.categoryTitle,
                { color: theme === "Dark" ? "white" : "black" },
              ]}
            >
              {category.name}
            </Text>
            <View style={styles.interestsRow}>
              {category.items.map((subcategory) => (
                <Pressable
                  key={subcategory.id}
                  style={[
                    styles.interestButton,
                    selectedInterests.includes(subcategory.id)
                      ? {
                          ...styles.selectedInterestButton,
                          backgroundColor: "#2a5",
                        }
                      : {},
                  ]}
                  onPress={() =>
                    handleSelectInterest(category.name, subcategory.id)
                  }
                >
                  <Text
                    style={[
                      styles.interestButtonText,
                      { color: theme === "Dark" ? "white" : "black" },
                    ]}
                  >
                    {subcategory.id}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };
  // TODO: REPLACE WITH COOL SPINNER
  if (isFetching) {
    return (
      <Background>
        <Text>Loading...</Text>
      </Background>
    );
  }
  const buttonText =
    userProfile?.interests.length === 0
      ? "Thanks for sharing your interests"
      : "Update Interests";
  // Render the main component structure with user information and interest buttons
  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        <Text
          style={[
            styles.welcomeText,
            { color: theme === "Dark" ? "white" : "black" },
          ]}
        >{`Welcome ${userProfile?.firstName}!`}</Text>
        <Text
          style={[
            styles.instructionsText,
            { color: theme === "Dark" ? "white" : "black" },
          ]}
        >
          Please select the interests that best describe you.
        </Text>
        <View style={styles.interestsWrapper}>{renderInterestButtons()}</View>
        {/* Update Interests Button */}
        <Pressable
          onPress={handleUpdateInterests}
          disabled={selectedInterests.length < 4 || !hasChangedInterests()}
          style={[
            styles.button,
            selectedInterests.length < 4 || !hasChangedInterests()
              ? styles.buttonDisabled
              : {},
          ]}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Pressable>
      </ScrollView>
    </Background>
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
    textAlign: "center",
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 16,
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
    backgroundColor: "white",
    borderRadius: 20,
    margin: 5,
  },
  selectedInterestButton: {
    backgroundColor: "#2a5",
  },
  interestButtonText: {
    textAlign: "center",
  },
  button: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#2a5",
    marginTop: 20,
  },
  buttonText: {
    textAlign: "center",
    color: "#green",
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#aaa", // or any other color that indicates the button is disabled
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default SelectInterests;

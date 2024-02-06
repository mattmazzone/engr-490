import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import Background from "../../components/Background";
import { UserProfile } from "../../types/userTypes";
import * as UserService from "../../services/userServices";
import { arraysEqual } from "../../util/arraysEqual";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ThemeContext from "../../context/ThemeContext";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import CategoryView from "../../components/SelectInterestScreen/CategoryView";
import {
  MainStackParamList,
  RootStackParamList,
} from "../../types/navigationTypes";

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
  navigation:
    | NavigationProp<MainStackParamList, "SelectInterests">
    | NavigationProp<RootStackParamList, "SelectInterests">;
  route:
    | RouteProp<MainStackParamList, "SelectInterests">
    | RouteProp<RootStackParamList, "SelectInterests">;
}
const SelectInterests = ({ navigation, route }: RouterProps) => {
  const { theme } = useContext(ThemeContext);
  const { setUserInterests } = route.params || {};
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  // Fetch user profile and initialize component state on mount
  useEffect(() => {
    const fetchAndSetUserProfile = async () => {
      try {
        const profile = await UserService.fetchUserProfile();
        setUserProfile(profile);
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

    fetchAndSetUserProfile();
  }, []);

  const handleSelectInterest = useCallback((subcategoryId: string) => {
    setSelectedInterests((prev) => {
      const isSelected = prev.includes(subcategoryId);
      return isSelected
        ? prev.filter((item) => item !== subcategoryId)
        : [...prev, subcategoryId];
    });
  }, []);

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
        setUserInterests?.(true);

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
            (navigation as NavigationProp<MainStackParamList>).navigate(
              "BottomTabNavigation"
            );
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

  const hasChangedInterests = useCallback(() => {
    return (
      !userProfile?.interests ||
      !arraysEqual(selectedInterests, userProfile.interests)
    );
  }, [userProfile, selectedInterests]);

  // TODO: REPLACE WITH COOL SPINNER
  if (isFetching) {
    return (
      <Background>
        <Text>Loading...</Text>
      </Background>
    );
  }
  const buttonText =
    (userProfile?.interests?.length ?? 0) > 0
      ? "Update Interests"
      : "Thanks for sharing your interests";
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
        <View style={styles.interestsWrapper}>
          {categories.map((category) => (
            <CategoryView
              key={category.name}
              category={category}
              selectedInterests={selectedInterests}
              onSelectInterest={handleSelectInterest}
              theme={theme}
            />
          ))}
        </View>
        {/* Update Interests Button */}
        <Pressable
          onPress={() => handleUpdateInterests()}
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
  button: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#2a5",
    marginTop: 20,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#aaa", // or any other color that indicates the button is disabled
  },
});

export default SelectInterests;

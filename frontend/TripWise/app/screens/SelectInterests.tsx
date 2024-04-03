import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
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

import { useUserProfile } from "../../hooks/useUserProfile";
import Toast from "react-native-toast-message";

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
    items: [{ id: "Culture 🎨", titles: ["cultural_center"] }],
  },
  {
    name: "Food & Drink 🍔",
    items: [
      {
        id: "Mexican Cuisine 🥘",
        titles: [
          "102-000",  //Mexican
          "102-005",  //Mexican-Yucateca
          "102-006",  //Mexican-Oaxaquena
          "102-007",  //Mexican-Veracruzana
          "102-008",  //Mexican-Poblana
          "404-000",  //Argentinean
          "406-000",  //Brazilian
          "406-035",  //Brazilian-Baiana
          "406-038",  //Brazilian-Bakery
          "406-036",  //Brazilian-Capixaba
          "406-037",  //Brazilian-Mineira
          "405-000",  //Chilean
          "403-000",  //Latin American
          "407-000",  //Peruvian
          "400-000",  //South American
          "401-000",  //Surinamese
          "402-000",  //Venezuelan
        ],
      },
      {
        id: "Chinese/Japanese/Korean Cuisine 🥢",
        titles: [
          "200-000",  //Asian
          "201-000",  //Chinese
          "201-009",  //Chinese-Szechuan
          "201-010",  //Chinese-Cantonese
          "201-041",  //Chinese-Shanghai
          "201-042",  //Chinese-Beijing
          "201-043",  //Chinese-Hunan/Hubei
          "201-044",  //Chinese-Jiangsu/Zhejiang
          "201-045",  //Chinese-Shandong
          "201-046",  //Chinese-Northeastern
          "201-047",  //Chinese-Inner Mongolian
          "201-048",  //Chinese-Yunnan/Guizhou
          "201-049",  //Chinese-Taiwanese
          "201-050",  //Chinese-Guangxi
          "201-051",  //Chinese-Jiangxi
          "201-052",  //Chinese-Northwestern
          "201-053",  //Chinese-Porridge
          "201-054",  //Chinese-Islamic
          "201-055",  //Chinese-Hot Pot
          "203-000",  //Japanese
          "203-026",  //Japanese-Sushi
          "204-000",  //Southeast Asian
          "205-000",  //Thai
          "206-000",  //Vietnamese
          "207-000",  //Korean
          "208-000",  //Pakistani
          "209-000",  //Malaysian
          "210-000",  //Bruneian
          "211-000",  //Indonesian
          "212-000",  //Filipino
          "800-085",  //Noodles 
        ],
      },
      {
        id: "Indian Cuisine 🍛",
        titles: [
          "202-000",  //Indian
          "202-011",  //Indian-Tandoori
          "202-012",  //Indian-Punjabi
          "202-013",  //Indian-Rajasthani
          "202-014",  //Indian-Mughlai
          "202-015",  //Indian-Bengali
          "202-016",  //Indian-Goan
          "202-017",  //Indian-Jain
          "202-018",  //Indian-Konkani
          "202-019",  //Indian-Gujarati
          "202-020",  //Indian-Parsi
          "202-021",  //Indian-South Indian
          "202-022",  //Indian-Maharashtrian
          "202-023",  //Indian-North Indian
          "202-024",  //Indian-Malvani
          "202-025",  //Indian-Hyderabadi
        ],
      },
      {
        id: "Middle Eastern Cuisine 🧆",
        titles: [
          "250-000",  //Middle Eastern
          "251-000",  //Azerbaijani
          "252-000",  //Turkish
          "253-000",  //Lebanese
          "254-000",  //Yemeni
          "255-000",  //Burmese
          "256-000",  //Cambodian
          "257-000",  //Singaporean
          "258-000",  //Sri Lankan
          "259-000",  //Tibetan
        ],
      },
      {
        id: "American Cuisine 🍟",
        titles: [
          "101-000",  //American
          "101-001",  //American-Californian
          "101-002",  //American-Southwestern
          "101-003",  //American-Barbecue/Southern
          "101-004",  //American-Creole
          "101-039",  //American-Native American
          "101-040",  //American-Soul Food
          "101-070",  //American-Cajun
          "103-000",  //Canadian
          "150-000",  //Australian
          "151-000",  //Hawaiian/Polynesian
          "152-000",  //Caribbean
          "153-000",  //Cuban
          "800-067",  //Burgers
          "800-056",  //Steak House
          "800-059",  //Hot Dogs
          "800-062",  //Chicken
        ],
      },
      {
        id: "European Cuisine 🥐",
        titles: [
          "300-000",  //European
          "301-000",  //French
          "301-027",  //French-Alsatian
          "301-028",  //French-Auvergnate
          "301-029",  //French-Basque
          "301-030",  //French-Corse
          "301-031",  //French-Lyonnaise
          "301-032",  //French-Provencale
          "301-033",  //French-Sud-ouest
          "302-000",  //German
          "303-000",  //Greek"
          "304-000",  //Italian"
          "305-000",  //Irish
          "306-000",  //Austrian
          "307-000",  //Belgian
          "308-000",  //British Isles
          "309-000",  //Dutch
          "310-000",  //Swiss
          "313-000",  //Portuguese
        ],
      },
      {
        id: "Eastern European Cuisine 🍲",
        titles: [
          "373-000", //Baltic
          "374-000", //Belorusian
          "375-000", //Ukrainian
          "376-000", //Polish
          "377-000", //Russian
          "378-000", //Bohemian
          "379-000", //Balkan
          "380-000", //Caucasian
          "381-000", //Romanian
          "382-000", //Armenian
          "370-000", //East European
          "371-000", //Hungarian

        ]
      },
      {
        id: "Scandinavian Cuisine 🍲",
        titles: [
          "350-000",  //Scandinavian
          "351-000",  //Finnish
          "352-000",  //Swedish
          "353-000",  //Norwegian
          "354-000",  //Danish
          "309-000",  //Dutch
          "310-000",  //Swiss
        ]
      },
      {
        id: "African Cuisine 🍲",
        titles: [
          "500-000", //African
          "501-000", //Moroccan
          "502-000", //Egyptian
          "503-000", //Ethiopian
          "504-000", //Seychellois
          "505-000", //South African
          "506-000", //North African
        ]
      },
      {
        id: "Cafe ☕", titles: [
          "800-060",  //Sandwhich
          "800-061",  //Breakfast
          "800-072",  //Brunch
          "800-073",  //Bistro
          "800-080",  //Soup
          "100-1100-0000", //Coffee-Tea
          "100-1100-0010", //Coffee Shop
          "100-1100-0331", //Tea House

        ]
      },
      {
        id: "Breakfast 🍳",
        titles: [
          "800-061",  //Breakfast
          "800-072",  //Brunch
          "800-068",  //Creperie
        ],
      },
      {
        id: "Italian Cuisine 🍝",
        titles: [
          "304-000", //Italian
          "800-057", //Pizza
          "315-000", //Sicilian
        ],
      },
      {
        id: "Mediterranean Cuisine 🍱",
        titles: [
          "372-000", // Mediterranean
          "303-000", // Greek
          "311-000", "311-034", // Spanish, including Tapas
          "800-075", //Seafood
        ],
      },
      {
        id: "Vegan 🌱", titles: [
          "800-076", //Vegan
          "800-077", //Vegetarian
          "800-083", //Natural/Healthy
          "800-084", //Organic


        ]
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
      { id: "Movies 🎬", titles: ["movie_theater"] },
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
      { id: "Church ⛪", titles: ["church"] },
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
      { id: "Jewelry Store 💍", titles: ["jewelry_store"] },
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
      { id: "Ski 🎿", titles: ["ski_resort"] },
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
  const { userProfile, isFetchingProfile } = useUserProfile({
    refreshData: true,
  });
  const [isFetching, setIsFetching] = useState<boolean>(true);

  // Fetch user profile and initialize component state on mount
  useEffect(() => {
    const initializeSelectedInterests = async () => {
      const storedInterests = await AsyncStorage.getItem("selectedInterests");
      setSelectedInterests(
        storedInterests
          ? JSON.parse(storedInterests)
          : userProfile?.interests || []
      );
    };
    if (userProfile) {
      initializeSelectedInterests();
    }
  }, [userProfile]);

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

      //navigation.goBack();
      Toast.show({
        type: 'success',
        position: 'bottom', // This positions the Toast at the bottom of the screen
        text2: 'Your trip has been successfully ended.',
        bottomOffset: 50, // Adjust this value to move the Toast up above the button
      });
      
    } catch (error) {
      console.error("Error updating interests:", error);
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
  if (isFetchingProfile) {
    return (
      <Background>
        <ActivityIndicator style={styles.spinner} size="large" color="rgba(34, 170, 85, 1)" />
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
          <Toast />
        </Pressable>
      </ScrollView>
    </Background>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  spinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
    backgroundColor: "rgba(34, 170, 85, 1)",
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
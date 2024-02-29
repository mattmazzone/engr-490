// AddressAutocomplete.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Platform } from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";

let BASE_API_URL: string;
if (Platform.OS === "android") {
  BASE_API_URL = "http://10.0.2.2:3000/api";
} else {
  BASE_API_URL = "http://localhost:3000/api";
}

const AddressAutocomplete = ({ onAddressSelect }: any) => {
  interface SuggestionItem {
    description: string;
    place_id: string;
  }

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isSearching, setIsSearching] = useState(true); // Add a state to track searching

  useEffect(() => {
    // Only fetch suggestions if isSearching is true
    if (!isSearching) return;

    const timerId = setTimeout(() => {
      if (input.length > 2) {
        fetchSuggestions(input);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [input, isSearching]); // Add isSearching as a dependency

  const fetchSuggestions = async (query: string) => {
    try {
      if (FIREBASE_AUTH.currentUser) {
        const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
        const response = await fetch(`${BASE_API_URL}/searchAddress${query}`,
          {
            headers: {
              Authorization: idToken,
            },
          });
        if (!response.ok) {
          throw new Error("Failed to fetch suggestions.");
        }
        const data = await response.json();
        const formattedSuggestions = data.predictions.map((item: any) => ({
          description: item.description,
          place_id: item.place_id,
        }));
        setSuggestions(formattedSuggestions);
      }
      else {
        Alert.alert('Error', 'No user logged in');
        return;
      }
    } catch (error) {
      console.error(error);
      setSuggestions([]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={(text) => {
          setInput(text);
          setIsSearching(true); // Enable searching when user types
        }}
        placeholder="Meeting Location"
        onFocus={() => setIsSearching(true)} // Enable searching when input is focused
      />
      <FlatList style={styles.listContainer}
        data={suggestions}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() => {
              setInput(item.description);
              setSuggestions([]);
              setIsSearching(false); // Disable searching after selection
              if (onAddressSelect) {
                onAddressSelect(item);
              }
            }}
          >
            <Text>{item.description}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,

  },
  input: {
    marginBottom: 10,
    height: 35, // Adjusted height
    borderRadius: 6, // Rounded corners
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "#ccc", // Subtle border
    borderWidth: 1,
  },
  listContainer: {
    backgroundColor: 'white', // Ensure background color for shadow visibility
    borderRadius: 5, // Rounds the corners of each item
    borderColor: '#ddd', // Color of the bottom border line

    // Shadow properties for iOS to create the floating effect
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    // Elevation for Android to create the floating effect
    elevation: 4,
  },
  item: {
    borderColor: '#dcdcdc',
    borderBottomWidth: 1,
    padding: 10,
  }

});

export default AddressAutocomplete;

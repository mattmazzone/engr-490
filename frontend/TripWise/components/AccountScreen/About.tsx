import React from "react";
import {
  Text,
  View,
  Button,
  Modal,
  TextInput,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import * as UserService from "../../services/userServices";

const testGoogleAPI = async () => {
  try {
    if (FIREBASE_AUTH.currentUser) {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();

      const queryParams = {
        includedTypes: JSON.stringify(["restaurant", "cafe"]), // Assuming you want to send an array
        maxResultCount: "10",
        latitude: "37.7749",
        longitude: "-122.4194",
        radius: "1500",
      };

      const url = `http://localhost:3000/api/places/nearby?${new URLSearchParams(
        queryParams
      )}`;

      console.log(idToken);
      const response = await fetch(url, {
        headers: {
          Authorization: idToken,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user profile.");
      }
      const data = await response.json();
      console.log(response);
      console.log(data);
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile from backend:", error);
    throw error;
  }
};

const About = ({ closeModal, navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>About Modal</Text>
      <Pressable onPress={() => testGoogleAPI()} style={styles.button}>
        <Text style={styles.buttonText}>Test Google API</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          navigation.navigate("SelectInterests");
          closeModal();
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Open Select Interest Page</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={UserService.endCurrentTrip}>
        <Text>End Current Trip</Text>
      </Pressable>

      <Pressable onPress={closeModal} style={styles.button}>
        <Text style={styles.buttonText}>Close Modal</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#1E90FF",
    flexDirection: "row",
    width: "55%",
    height: 45,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingLeft: 30,
  },
  buttonText: {
    fontSize: 18,
    marginRight: 30, // add some space between text and logo
  },
});

export default About;

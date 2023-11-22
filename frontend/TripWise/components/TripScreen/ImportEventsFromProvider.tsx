import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Get user provider from firebase
const getUserProvider = () => {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  if (user) {
    const isGoogleUser = user.providerData.some(
      (provider) => provider.providerId === "google.com"
    );
    const isEmailUser = user.providerData.some(
      (provider) => provider.providerId === "password"
    );
    const isAppleUser = user.providerData.some(
      (provider) => provider.providerId === "apple.com"
    );

    if (isGoogleUser) {
      return "Google";
    } else if (isAppleUser) {
      return "Apple";
    } else if (isEmailUser) {
      return null;
    }
  }
};

const promptUserToUseProvider = () => {
  const provider = getUserProvider();

  return (
    provider && (
      <View style={styles.container}>
        <Text style={styles.subTitle}>
          Import your meetings from {provider} calendar?
        </Text>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.buttonYes}>
            <Text style={styles.buttonText}>Yes</Text>
          </Pressable>
          <Pressable style={styles.buttonNo}>
            <Text style={styles.buttonText}>No</Text>
          </Pressable>
        </View>
      </View>
    )
  );
};

const ImportEventsFromProvider = () => {
  return <View>{promptUserToUseProvider()}</View>;
};

export default ImportEventsFromProvider;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    borderRadius: 5,
  },
  subTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  buttonYes: {
    backgroundColor: "#00FF55",
    padding: 10,
    width: 100,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonNo: {
    backgroundColor: "grey",
    padding: 10,
    width: 100,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

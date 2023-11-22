import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

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

const getCalendarEvents = async (provider: string) => {
  console.log(provider);
  if (provider === "Google") {
    const auth = FIREBASE_AUTH;
    const user = auth.currentUser;
    const startDate = new Date(); // for example, today
    const endDate = new Date(); // set this to your desired end date
    const accessToken =
      "ya29.a0AfB_byDb-YwgGolNsNlkvHX1Et4DqDmMFTGrYhZUfZJ_-XuaXDxz-ttoIDMs46R9QhKs_CBb-onj0eQJ7YOxpo48JgNrTyz-itjh-xHMfuS-1Z5h5sUM8a6D-phQmJalunhfFwftEr-bFoHpLg5tbZDZYO0RJ_hjPAaCgYKATYSAQ4SFQHGX2MiTYoNqQjmveqZfeuydZSqug0169";
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2023-11-20T00:00:00Z&timeMax=2023-11-24T00:00:00Z`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
  } else if (provider === "Apple") {
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
          <Pressable
            style={styles.buttonYes}
            onPress={() => getCalendarEvents(provider)}
          >
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

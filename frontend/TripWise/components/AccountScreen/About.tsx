import React, { useEffect, useState, useContext } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions
} from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import * as UserService from "../../services/userServices";
import BackButton from "../BackButton";
import ThemeContext from "../../context/ThemeContext";
import Background from "../Background";

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

      const response = await fetch(url, {
        headers: {
          Authorization: idToken,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user profile.");
      }
      const data = await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile from backend:", error);
    throw error;
  }
};
const useResponsiveScreen = (breakpoint: number) => {
  const [isScreenSmall, setIsScreenSmall] = useState(Dimensions.get('window').width < breakpoint);

  useEffect(() => {
    const updateScreenSize = () => {
      const screenWidth = Dimensions.get('window').width;
      setIsScreenSmall(screenWidth < breakpoint);
    };

    // Add event listener
    const subscription = Dimensions.addEventListener('change', updateScreenSize);

    // Remove event listener on cleanup
    return () => subscription.remove();
  }, [breakpoint]);

  return isScreenSmall;
};

const About = ({ closeModal, navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const isScreenSmall = useResponsiveScreen(768);
  return (
    <Background>
      <SafeAreaView style={styles.container}>
        {isScreenSmall && <BackButton onPress={() => closeModal()} />} 
        <Text style={{ color: theme === "Dark" ? "white" : "black" }}>About Modal</Text>
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
          <Text style={styles.buttonText}>End Current Trip</Text>
        </Pressable>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    backgroundColor: "rgba(34, 170, 85, 1)",
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
    color: "white",
  },
});

export default About;

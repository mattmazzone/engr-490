import React, { useEffect, useState, useContext } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore"; // Import needed Firestore functions
import { updateEmail } from "firebase/auth";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Pressable,
  Modal,
} from "react-native";
import Background from "../Background";
import { useUserProfile } from "../../hooks/useUserProfile";
import * as UserService from "../../services/userServices";
import { NavigationProp } from "@react-navigation/native";
import ThemeContext from "../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fi } from "@faker-js/faker";

const AccountPage = () => {

  const { theme } = useContext(ThemeContext);
  const { userProfile, isFetchingProfile } = useUserProfile({ refreshData: true });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFirstName(`${userProfile.firstName || ''}`);
      setLastName(`${userProfile.lastName || ''}`);
    }
  }, [userProfile]);

  const handleUpdate = async () => {
    const user = FIREBASE_AUTH.currentUser;

    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    // Update Firestore document
    const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
    await updateDoc(userDocRef, { firstName, lastName });


    // Optionally, update local storage
    const updatedProfile = { ...userProfile, firstName, lastName };
    await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));

    Alert.alert('Success', 'Profile updated successfully');
  };



  if (isFetchingProfile) {
    return <Text>Loading...</Text>; // Or any loading indicator
  }

  return (
    <Background>
      <View style={[styles.container, { backgroundColor: theme === 'Dark' ? 'rgba(66, 70, 70, 0.69)' : 'rgba(240, 241, 241, 0.69)' }]}>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
        />
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />

        <Pressable
          onPress={handleUpdate}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 80,
    alignSelf: 'flex-start',
    flex: 1,
    paddingBottom: 70,
    paddingHorizontal: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Background color for the container
    borderRadius: 10, // Rounded corners for the container
    alignItems: 'center',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 20,

    borderRadius: 3,
  },
  input: {
    marginTop: 10,
    marginBottom: 20,
    height: 45, // Adjusted height
    borderRadius: 10, // Rounded corners
    padding: 10,
    backgroundColor: "#f5f7fa",
  },
  inputGroup: {
    maxWidth: 300, // Set a max-width for large screens
    alignSelf: 'center',
    width: '100%',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc", // Placeholder color
  },
  profileName: {
    fontSize: 20,
    marginTop: 10,
    fontWeight: "bold",
  },
  settings: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
  },
  button: {
    backgroundColor: "rgba(34, 170, 85, 1)",
    flexDirection: "row",
    width: "75%",
    height: 45,
    borderRadius: 7,
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    textAlign: 'center',
    marginTop: 10,
    fontSize: 18,
    width: 150,
    height: 50,
  },

  logoutButton: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderRadius: 3,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
export default AccountPage;
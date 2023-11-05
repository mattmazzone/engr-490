import React, { useState } from "react";
import { NavigationProp } from "@react-navigation/native";
import {
  TextInput,
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import LoginScreenButton from "../../components/LoginScreenButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import BackButton from "../../components/BackButton";
import { doc, setDoc } from "firebase/firestore"; // Import doc and setDoc
import { createUserWithEmailAndPassword } from "firebase/auth";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const mobileRenderContent = (children: React.ReactNode) => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          resetScrollToCoords={{ x: 0, y: 0 }}
          scrollEnabled={false}
        >
          {children}
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    );
  } else {
    return <View style={styles.container}>{children}</View>;
  }
};

const SignUp = ({ navigation }: RouterProps) => {
  const auth = FIREBASE_AUTH;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSignUp = async () => {
    try {
      // Sign up the user
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = response.user;

      if (user) {
        // Get a reference to the Firestore document for the new user
        const userDocRef = doc(FIREBASE_DB, "users", user.uid);

        // Set the additional user data
        await setDoc(userDocRef, {
          uid: user.uid,
          firstName: firstName,
          lastName: lastName,
        });
      }
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <>
      {mobileRenderContent(
        <>
          <View>
            <BackButton />
          </View>
          <View style={styles.loginContainer}>
            <TextInput
              placeholder="First Name"
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              placeholder="Last Name"
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="Password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <LoginScreenButton title="Sign Up" onPress={handleSignUp} />
            <LoginScreenButton
              title="Already have an account? Login"
              onPress={() => navigation.navigate("Login")}
            ></LoginScreenButton>
          </View>
        </>
      )}
    </>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#874EBF",
    alignItems: "center",
    justifyContent: "center",
  },
  loginContainer: {
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  input: {
    marginVertical: 10,
    width: Dimensions.get("window").width * 0.8, // 80% of screen width
    height: 45, // Adjusted height
    borderRadius: 10, // Rounded corners
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "#ccc", // Subtle border
    borderWidth: 1,
    shadowColor: "#000", // Optional shadow for a "lifted" effect
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

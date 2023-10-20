import React, { useState } from "react";
import { NavigationProp } from "@react-navigation/native";
import {
  TextInput,
  View,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore"; // Import doc and setDoc
import { createUserWithEmailAndPassword } from "firebase/auth";
interface RouterProps {
  navigation: NavigationProp<any, any>;
}

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
          firstName: firstName,
          lastName: lastName,
        });
      }
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
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
        <Button title="Sign Up" onPress={handleSignUp} />
        <Button
          title="Already have an account? Login"
          onPress={() => navigation.navigate("Login")}
        ></Button>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
});

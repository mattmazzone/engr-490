import React, { useState } from "react";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import {
  TextInput,
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Keyboard,
  Pressable,
} from "react-native";
import LoginScreenButton from "../../components/Login/LoginScreenButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import BackButton from "../../components/BackButton";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Background from "../../components/Background";
import * as UserService from "../../services/userServices";
import { RootStackParamList } from "../../types/navigationTypes";

interface RouterProps {
  navigation: NavigationProp<RootStackParamList, "SignUp">;
  route: RouteProp<RootStackParamList, "SignUp">;
}
const mobileRenderContent = (children: React.ReactNode) => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return (
      <Pressable onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          resetScrollToCoords={{ x: 0, y: 0 }}
          scrollEnabled={false}
        >
          {children}
        </KeyboardAwareScrollView>
      </Pressable>
    );
  } else {
    return <View style={styles.container}>{children}</View>;
  }
};

const SignUp = ({ navigation, route }: RouterProps) => {
  const { onUserCreationComplete }: { onUserCreationComplete: () => void } =
    route.params;
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
        await UserService.createUser(user.uid, firstName, lastName);
        onUserCreationComplete();
      }
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <>
      <Background>
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
      </Background>
    </>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

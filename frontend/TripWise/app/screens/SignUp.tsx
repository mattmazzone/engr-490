import React, { useState } from "react";
import { NavigationProp } from "@react-navigation/native";
import {
  TextInput,
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Keyboard,
  Pressable,
  Text,
} from "react-native";
import LoginScreenButton from "../../components/Login/LoginScreenButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import BackButton from "../../components/BackButton";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Background from "../../components/Background";
import * as UserService from "../../services/userServices";
import TripWiseLogo from "../../components/SVGLogos/TripWiseLogo";

interface RouterProps {
  navigation: NavigationProp<any, any>;
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
        UserService.createUser(user.uid, firstName, lastName);
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
            <View style={styles.backButtonContainer}>
              <BackButton />
            </View>

            <Text style={styles.title}>Sign Up</Text>
            <View style={styles.loginContainer}>
              <View style={styles.logo}>
                <TripWiseLogo />
              </View>
              <TextInput
                placeholder="First Name"
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor={'#c7c7c7'}
              />
              <TextInput
                placeholder="Last Name"
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor={'#c7c7c7'}
              />
              <TextInput
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={'#c7c7c7'}
              />
              <TextInput
                placeholder="Password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={'#c7c7c7'}
              />
              <LoginScreenButton title="Sign Up" onPress={handleSignUp} />
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Pressable onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginButton}>Login</Text>
                </Pressable>
              </Text>
            </View>
          </>
        )}
      </Background>
    </>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  backButtonContainer :{
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loginContainer: {
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    marginTop: 20,
    marginBottom: 100,
  },
  input: {
    marginVertical: 10,
    width: 300,
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
  loginText: {
    fontSize: 16,
    color: 'black',
    marginTop: 15,
  },
  loginButton: {
    fontWeight: 'bold',
    color: 'rgba(34, 170, 85, 1)',
  },
});

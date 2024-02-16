import React from "react";
import {
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Platform,
  Pressable,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import * as UserService from "../../services/userServices";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

// We import the auth state from the firebase config file
const auth = FIREBASE_AUTH;

const handleGoogleSignUp = async (onUserCreationComplete: () => void) => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    // Get the Google Sign-In user information
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Extract the id token from the Google Sign-In response
    const { idToken, accessToken } = await GoogleSignin.getTokens();

    // Create a Firebase credential with the Google ID token
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase with the Google credential
    const firebaseUserCredential = await signInWithCredential(
      auth,
      googleCredential
    );

    // Here, you can access the Firebase user object
    const firebaseUser = firebaseUserCredential.user;

    // Perform any additional user setup or database writes you need here
    // For example, if you're using a user service to create user profiles:
    if (firebaseUser.displayName) {
      await UserService.createUser(
        firebaseUser.uid,
        firebaseUser.displayName.split(" ")[0],
        firebaseUser.displayName.split(" ")[1]
      );
      onUserCreationComplete();
    }

    if (accessToken === undefined) {
      throw new Error("Google Auth Provider Credential Access Token is null");
    }
    // TODO: ENCRYPT TOKEN
    AsyncStorage.setItem("googleAccessToken", accessToken);
  } else {
    console.log("Platform is not ios");
  }
};

interface ProviderDetails {
  title: string;
  logo: ImageSourcePropType;
  onPress: (navigation: NavigationProp<any, any>) => void;
  bgColor: string;
  textColor: string;
  borderColor?: string;
}

interface LoginProviderButtonProps {
  provider: string;
  navigation: NavigationProp<any, any>;
  onUserCreationComplete: () => void;
}

const getProviderMap = (
  onUserCreationComplete: () => void
): Record<string, ProviderDetails> => ({
  email: {
    title: "Continue with Email",
    logo: require("../../assets/logos/email.png"),
    onPress: (navigation) => {
      navigation.navigate("Login");
    },
    bgColor: "#FFFFFF",
    textColor: "#000000",
    borderColor: "#000000",
  },
  google: {
    title: "Continue with Google",
    logo: require("../../assets/logos/google.png"),
    onPress: (navigation) => {
      handleGoogleSignUp(onUserCreationComplete);
    },
    bgColor: "#FFFFFF",
    textColor: "#000000",
    borderColor: "#000000",
  },
  apple: {
    title: "Continue with Apple",
    logo: require("../../assets/logos/apple.png"),
    onPress: () => {
      alert("Apple");
    },
    bgColor: "#FFFFFF",
    textColor: "#000000",
    borderColor: "#000000",
  },
});
const LoginScreenButton = ({
  provider,
  navigation,
  onUserCreationComplete,
}: LoginProviderButtonProps) => {
  const providerMap = getProviderMap(onUserCreationComplete); // Use the function to get the provider map
  const { title, logo, onPress, bgColor, textColor, borderColor } =
    providerMap[provider.toLowerCase()] || providerMap["email"];

  return (
    <Pressable
      onPress={() => onPress(navigation)}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: borderColor ? 1 : 0,
        },
      ]}
    >
      <Image source={logo} style={styles.logo} />
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1E90FF",
    flexDirection: "row",
    height: 45,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingLeft: 30,
    marginVertical: 2,
  },
  buttonText: {
    fontSize: 18,
    marginRight: 30,
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
});

export default LoginScreenButton;

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
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import * as UserService from "../../services/userServices";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// We import the auth state from the firebase config file
const auth = FIREBASE_AUTH;

const handleGoogleSignUp = async (onUserCreationComplete: () => void) => {
  try {
    if (Platform.OS === "web") {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
      const response = await signInWithPopup(auth, provider);

      const user = response.user;

      if (user.displayName) {
        await UserService.createUser(
          user.uid,
          user.displayName.split(" ")[0],
          user.displayName.split(" ")[1]
        );
        onUserCreationComplete();
      }

      const credential = GoogleAuthProvider.credentialFromResult(response);

      if (credential === null) {
        throw new Error("Google Auth Provider Credential is null");
      }
      if (credential.accessToken === undefined) {
        throw new Error("Google Auth Provider Credential Access Token is null");
      }
      // TODO: ENCRYPT TOKEN
      sessionStorage.setItem("googleAccessToken", credential.accessToken);
    } else {
      console.log("Platform is not web");
    }
  } catch (error) {
    console.log(error);
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
      style={[styles.button, { backgroundColor: bgColor, borderColor: borderColor, borderWidth: borderColor ? 1 : 0,}]}
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

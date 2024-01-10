import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Platform,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import * as UserService from "../../services/userServices";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// We import the auth state from the firebase config file
const auth = FIREBASE_AUTH;

// We configure the google sign in for mobile
// GoogleSignin.configure({
//   webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
//   scopes: ["https://www.googleapis.com/auth/calendar"], // We want to get the calendar access token
// });

const handleGoogleSignUp = async () => {
  try {
    if (Platform.OS === "web") {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
      const response = await signInWithPopup(auth, provider);

      const user = response.user;

      if (user.displayName) {
        UserService.createUser(
          user.uid,
          user.displayName.split(" ")[0],
          user.displayName.split(" ")[1]
        );
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
      // Get the Google Sign-In user information
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log("USER_INFO:", userInfo);

      // Extract the id token from the Google Sign-In response
      const { idToken } = await GoogleSignin.getTokens();

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
        UserService.createUser(
          firebaseUser.uid,
          firebaseUser.displayName.split(" ")[0],
          firebaseUser.displayName.split(" ")[1]
        );
      }

      // If you need to store the refresh token or perform other actions, do so here
      // const { idToken, accessToken } = await GoogleSignin.getTokens();
      // const user = userInfo.user;
      // if (user.givenName === null || user.familyName === null) {
      //   throw new Error("User is null");
      // }
      // UserService.createUser(user.id, user.givenName, user.familyName);
      // // TODO: Securely store the token
      // await AsyncStorage.setItem("googleAccessToken", accessToken);
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
}

interface LoginProviderButtonProps {
  provider: string;
  navigation: NavigationProp<any, any>;
}

const providerMap: Record<string, ProviderDetails> = {
  email: {
    title: "Continue with Email",
    logo: require("../../assets/logos/email.png"),
    onPress: (navigation) => {
      navigation.navigate("Login");
    },
    bgColor: "#D9D9D9",
    textColor: "#000000",
  },
  google: {
    title: "Continue with Google",
    logo: require("../../assets/logos/google.png"),
    onPress: () => {
      handleGoogleSignUp();
    },
    bgColor: "#DB4437",
    textColor: "#FFFFFF",
  },
  apple: {
    title: "Continue with Apple",
    logo: require("../../assets/logos/apple.png"),
    onPress: () => {
      alert("Apple");
    },
    bgColor: "#FFFFFF",
    textColor: "#000000",
  },
};

const LoginScreenButton = ({
  provider,
  navigation,
}: LoginProviderButtonProps) => {
  const { title, logo, onPress, bgColor, textColor } =
    providerMap[provider.toLowerCase()] || providerMap["email"];

  return (
    <TouchableOpacity
      onPress={() => onPress(navigation)}
      style={[styles.button, { backgroundColor: bgColor }]}
    >
      <Image source={logo} style={styles.logo} />
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1E90FF",
    flexDirection: "row",
    width: "75%",
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
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
});

export default LoginScreenButton;

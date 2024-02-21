import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Pressable,
  Keyboard,
  Platform,
  Text,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { NavigationProp } from "@react-navigation/native";
import LoginScreenButton from "../../components/Login/LoginScreenButton";
import BackButton from "../../components/BackButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Background from "../../components/Background";
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

const Login = ({ navigation }: RouterProps) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const signIn = async () => {
    setLoading(true);
    setEmailError(null);
    setPasswordError(null);
    
    try {
      const user = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      console.log(user);
      // Assuming user always already has they're interests set

    } catch (error) {
      console.log(error);
      if (error instanceof Error && 'code' in error) {
        switch (error.code) {
          case 'auth/invalid-email':
            setEmailError('The email address is poorly formatted.');
            break;
          case 'auth/wrong-password':
            setPasswordError('The password is invalid.');
            break;
          case 'auth/user-not-found':
            setEmailError('No user found with this email.');
            break;
          default:
            setEmailError('Login failed. Please try again.');
            break;
        }
      } else {
        // Handle any other errors that might occur
        setEmailError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Background>
        {mobileRenderContent(
          <>
            <View style={styles.backButtonContainer}>
              <BackButton onPress={() => navigation.goBack()}/>
            </View>

            <Text style={styles.title}>Login</Text>
            <View style={styles.loginContainer}>
              <View style={styles.logo}>
                <TripWiseLogo />
              </View>
              <View style={styles.loginInputContainer}>
                <View style={styles.inputGroup}>
                <Text style={styles.inputTitles}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  style={styles.input}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  onChangeText={(text) => setEmail(text)}
                  placeholderTextColor={'#c7c7c7'}
                ></TextInput>
                {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputTitles}>
                    Password
                  </Text>
                  <TextInput
                    secureTextEntry={true}
                    value={password}
                    style={styles.input}
                    placeholder="Enter your password"
                    autoCapitalize="none"
                    onChangeText={(text) => setPassword(text)}
                    placeholderTextColor={'#c7c7c7'}
                  ></TextInput>
                  {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                </View>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <>
                  <LoginScreenButton onPress={signIn} title="Login" />
                  <Text style={styles.signupText}>
                    Don’t have an account?{' '}
                    <Pressable onPress={() => navigation.navigate("SignUp")}>
                      <Text style={styles.signupButton}>Sign Up</Text>
                    </Pressable>
                  </Text>
                </>
              )}
            </View>
          </>
        )}
      </Background>
    </>
  );
};

export default Login;

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
    marginVertical: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loginContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    marginBottom: 60,
  },
  loginInputContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  inputGroup : {
    maxWidth: 300, // Set a max-width for large screens
    alignSelf: 'center',
    width: '100%',
  },
  inputTitles : {
    fontSize: 15,
    color: 'black',
    paddingLeft: 5,
  },
  input: {
    marginTop: 10,
    marginBottom: 12,
    width: 300,
    height: 45, // Adjusted height
    borderRadius: 10, // Rounded corners
    padding: 10,
    backgroundColor: "#f5f7fa",
  },
  signupText: {
    fontSize: 16,
    color: 'black',
    marginTop: 15,
  },
  signupButton: {
    fontWeight: 'bold',
    color: 'rgba(34, 170, 85, 1)',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    paddingLeft: 5,
  },
});

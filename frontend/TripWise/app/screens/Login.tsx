import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Pressable,
  Keyboard,
  Dimensions,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { NavigationProp } from "@react-navigation/native";
import LoginScreenButton from "../../components/Login/LoginScreenButton";
import BackButton from "../../components/BackButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Background from "../../components/Background";

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

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
                value={email}
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                onChangeText={(text) => setEmail(text)}
              ></TextInput>
              <TextInput
                secureTextEntry={true}
                value={password}
                style={styles.input}
                placeholder="Password"
                autoCapitalize="none"
                onChangeText={(text) => setPassword(text)}
              ></TextInput>

              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <>
                  <LoginScreenButton onPress={signIn} title="Login" />
                  <LoginScreenButton
                    onPress={() => navigation.navigate("SignUp")}
                    title="Don't have an account? Sign Up"
                  />
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

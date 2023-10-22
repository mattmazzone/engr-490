import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { NavigationProp } from "@react-navigation/native";
import LoginScreenButton from "../../components/LoginScreenButton";
import BackButton from "../../components/BackButton";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Login = ({ navigation }: RouterProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <BackButton />
      </View>

      <KeyboardAvoidingView behavior="padding" style={styles.loginContainer}>
        <TextInput
          value={email}
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          onChange={(text) => setEmail(text.nativeEvent.text)}
        ></TextInput>
        <TextInput
          secureTextEntry={true}
          value={password}
          style={styles.input}
          placeholder="Password"
          autoCapitalize="none"
          onChange={(text) => setPassword(text.nativeEvent.text)}
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
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#874EBF",
    alignItems: "center",
  },

  loginContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: "35%", // Adjust this value to position the content within the bottom third
    width: "100%",
    alignItems: "center",
  },
  input: {
    marginVertical: 4,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
    width: "70%",
  },
});

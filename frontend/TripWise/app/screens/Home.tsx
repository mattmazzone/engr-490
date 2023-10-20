import { NavigationProp } from "@react-navigation/native";
import React from "react";
import { Text, View, Button } from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Home = ({ navigation }: RouterProps) => {
  return (
    <View>
      <Text>Home</Text>
      <Button onPress={() => navigation.navigate("Login")} title="Login" />
      <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
    </View>
  );
};

export default Home;
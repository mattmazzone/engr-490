import { NavigationProp } from "@react-navigation/native";
import React from "react";
import { Text, View, Button } from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import BackgroundGradient from "../../components/BackgroundGradient";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Trip = ({ navigation }: RouterProps) => {
  return (
    <BackgroundGradient>
      <View>
        <Text>Trip</Text>
        <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
      </View>
    </BackgroundGradient>
  );
};

export default Trip;

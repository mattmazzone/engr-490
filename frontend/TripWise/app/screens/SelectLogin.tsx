import React from "react";
import { View, StyleSheet, useColorScheme, Text } from "react-native";
import TripWiseLogo from "../../components/SVGLogos/TripWiseLogo";
import LoginProviderButton from "../../components/SelectLogin/LoginProviderButton";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import Background from "../../components/Background";
import { RootStackParamList } from "../../types/navigationTypes";

interface RouterProps {
  navigation: NavigationProp<RootStackParamList, "SelectLogin">;
  route: RouteProp<RootStackParamList, "SelectLogin">;
}

const SelectLogin = ({ navigation, route }: RouterProps) => {
  const { onUserCreationComplete }: { onUserCreationComplete: () => void } =
    route.params;

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <TripWiseLogo />
          </View>
          <Text style ={styles.title}>
            TripWise
          </Text>
        </View>
        <View style={styles.loginProviders}>
          <LoginProviderButton
            provider={"email"}
            navigation={navigation}
            onUserCreationComplete={onUserCreationComplete}
          />
          <LoginProviderButton
            provider={"google"}
            navigation={navigation}
            onUserCreationComplete={onUserCreationComplete}
          />
          <LoginProviderButton
            provider={"apple"}
            navigation={navigation}
            onUserCreationComplete={onUserCreationComplete}
          />
        </View>
      </View>
    </Background>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  logoContainer: {
    flex: 2,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    marginTop: 60,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginProviders: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 250,
  },
});

export default SelectLogin;

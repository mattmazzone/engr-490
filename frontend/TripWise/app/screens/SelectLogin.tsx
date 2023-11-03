import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import TripWiseLogo from "../../components/SVGLogos/TripWiseLogo";
import LoginProviderButton from "../../components/SelectLogin/LoginProviderButton";
import { NavigationProp } from "@react-navigation/native";
import BackGroundGradient from "../../components/BackGroundGradient";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}


const SelectLogin = ({ navigation }: RouterProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <BackGroundGradient>
    <View style={styles.container}>   
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <TripWiseLogo />
        </View>
      </View>
      <View style={styles.loginProviders}>
        <LoginProviderButton provider={"email"} navigation={navigation} />
        <LoginProviderButton provider={"google"} navigation={navigation} />
        <LoginProviderButton provider={"apple"} navigation={navigation} />
      </View>
    </View>
</BackGroundGradient>
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
    marginTop: "25%", // Adjust this value to position the logo within the top third
  },
  loginProviders: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: "35%", // Adjust this value to position the content within the bottom third
    width: "100%",
    alignItems: "center",
  },
});

export default SelectLogin;

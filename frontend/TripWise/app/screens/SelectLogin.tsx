import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import TripWiseLogo from "../../components/SVGLogos/TripWiseLogo";

const SelectLogin = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <TripWiseLogo />
      </View>
      <Text>SelectLogin</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E90FF",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    position: "absolute",
    top: "8.33%",
    bottom: "8.33%",
  },
});

export default SelectLogin;

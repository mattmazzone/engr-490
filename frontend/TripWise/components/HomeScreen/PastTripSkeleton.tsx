import React from "react";
import { useEffect, useRef, useContext } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import ThemeContext from "../../context/ThemeContext";

const PastTripSkeleton = () => {
  const { theme } = useContext(ThemeContext);
  const animatedValue = useRef(new Animated.Value(1)).current; // Use useRef to persist the value

  useEffect(() => {
    const startPulsing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true, // Set to false if you encounter issues with native driver
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true, // Set to false if you encounter issues with native driver
          }),
        ])
      ).start();
    };

    startPulsing();
  }, [animatedValue]);

  const interpolateColor = animatedValue.interpolate({
    inputRange: [0.7, 1],
    outputRange: [
      theme === "Dark" ? "#707070" : "#E8E8E8",
      theme === "Dark" ? "#505050" : "#ffffff",
    ], // More contrasting colors
  });
  const interpolateOpacity = animatedValue.interpolate({
    inputRange: [0.7, 1],
    outputRange: [0.5, 1], // More noticeable change in opacity
  });

  const animatedStyle = {
    backgroundColor: interpolateColor,
    opacity: interpolateOpacity,
  };
  return (
    <View
      style={[
        styles.skeletonContainer,
        { backgroundColor: theme === "Dark" ? "#505050" : "#E8E8E8" },
      ]}
    >
      <Animated.View style={[styles.skeletonImage, animatedStyle]} />
      <Animated.View style={[styles.skeletonButton, animatedStyle]} />
      <Animated.View style={[styles.skeletonLine, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
    width: "100%",
  },
  skeletonLine: {
    width: "60%",
    height: 20,
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  skeletonButton: {
    width: "30%",
    height: 20,
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  skeletonImage: {
    width: "100%",
    height: 100,
    marginBottom: 10,
  },
});

export default PastTripSkeleton;

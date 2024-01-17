import React from "react";
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const PastTripSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(1)).current; // Use useRef to persist the value

  useEffect(() => {
    const startPulsing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: false, // Set to false if you encounter issues with native driver
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false, // Set to false if you encounter issues with native driver
          }),
        ])
      ).start();
    };

    startPulsing();
  }, [animatedValue]);

  const interpolateColor = animatedValue.interpolate({
    inputRange: [0.7, 1],
    outputRange: ["#cccccc", "#ffffff"], // More contrasting colors
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
    <View style={styles.skeletonContainer}>
      <Animated.View style={[styles.skeletonLine, animatedStyle]} />
      <Animated.View style={[styles.skeletonButton, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    marginBottom: 20,
    width: "100%",
    paddingBottom: 40,
    paddingTop: 10,
  },
  skeletonLine: {
    width: "90%",
    height: 20,
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonButton: {
    width: "50%",
    height: 20,
    borderRadius: 3,
  },
});

export default PastTripSkeleton;

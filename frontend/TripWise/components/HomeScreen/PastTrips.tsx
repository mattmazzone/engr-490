import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import ThemeContext from "../../context/ThemeContext";
import PastTrip from "./PastTrip";

const PastTrips = ({ onScoll, isFetching, pastTrips, scrollY }: any) => {
  const { theme } = useContext(ThemeContext);

  const [translationComplete, setTranslationComplete] = useState(false);
  const headerHeight = 135; // Adjust based on your header's height
  const translationThreshold = 50; // The scroll offset at which translation stops and normal scroll begins

  // Custom onScroll handler
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY >= translationThreshold && !translationComplete) {
          setTranslationComplete(true);
        }
      },
      useNativeDriver: false,
    }
  );

  // Translate ScrollView upwards
  const translate = scrollY.interpolate({
    inputRange: [0, 50, 50 + 1],
    outputRange: [185, 50, 50],
    extrapolate: "clamp",
  });

  const animatedStyle = translationComplete
    ? {}
    : { transform: [{ translateY: translate }] };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        scrollEventThrottle={16} // Adjust as needed for performance
        onScroll={onScoll}
        style={[styles.scrollView, animatedStyle]}
        contentContainerStyle={[animatedStyle]}
      >
        <View style={[styles.content]}>
          {pastTrips.map((trip: any, index: any) => (
            <PastTrip key={index} pastTrip={trip} />
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default PastTrips;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  scrollView: {
    width: "100%",
    marginBottom: 20,
  },
  contentContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  content: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});

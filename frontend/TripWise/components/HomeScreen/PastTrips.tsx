import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";
import PastTrip from "./PastTrip";

const PastTrips = ({ isFetching, pastTrips }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review your past Trips</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {pastTrips.map((trip: any, index: any) => (
            <PastTrip key={index} pastTrip={trip} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default PastTrips;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "flex-start",
  },
  scrollView: {
    width: "100%",
    marginTop: 20,
    marginBottom: 110, // Apply padding here
  },
  content: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});

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

const PastTrips = ({ pastTrips }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Review your past Trips</Text>
      <ScrollView style={styles.scrollView}>
        {pastTrips.map((trip: any) => (
          <PastTrip pastTrip={trip} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PastTrips;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  scrollView: {
    width: "100%",
    paddingBottom: 110, //padding so meetings stop at nav bar
  },
});

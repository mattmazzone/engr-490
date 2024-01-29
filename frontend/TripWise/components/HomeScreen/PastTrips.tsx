import React, { useContext, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ThemeContext from "../../context/ThemeContext";
import PastTrip from "./PastTrip";

const PastTrips = ({ isFetching, pastTrips }: any) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <ScrollView style={[styles.scrollView]}>
        <View style={[styles.content]}>
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

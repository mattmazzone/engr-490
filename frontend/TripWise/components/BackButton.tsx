import React from "react";
import { TouchableOpacity, Text, StyleSheet, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BackButtonIcon from './SVGLogos/BackButtonIcon';

const BackButton = ({onPress}: any) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={[styles.backButtonContainer]} onPress={onPress}>
      <BackButtonIcon focused/>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButtonContainer :{
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 20,
  },
});

export default BackButton;

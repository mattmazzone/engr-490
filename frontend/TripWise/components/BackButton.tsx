import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BackButtonIcon from './SVGLogos/BackButtonIcon';

const BackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <BackButtonIcon focused/>
    </TouchableOpacity>
  );
};

export default BackButton;

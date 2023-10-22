import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface LoginScreenButtonProps {
  onPress: () => void;
  title: string;
}

const LoginScreenButton = ({ onPress, title }: LoginScreenButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1E90FF",
    flexDirection: "row",
    width: "70%",
    height: 45,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    marginRight: 10, // add some space between text and logo
  },
});

export default LoginScreenButton;

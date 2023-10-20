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
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default LoginScreenButton;

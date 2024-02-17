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
    backgroundColor: "rgba(34, 170, 85, 1)",
    flexDirection: "row",
    height: 45,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    marginRight: 20,
    marginLeft: 20
  },
});

export default LoginScreenButton;

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface SignUpScreenButtonProps {
    onPress: () => void;
    title: string;
}

const SignUpScreenButton = ({ onPress, title}: SignUpScreenButtonProps) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
      backgroundColor: "#D9D9D9",
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

export default SignUpScreenButton
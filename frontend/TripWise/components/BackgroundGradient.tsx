import * as React from "react";
import { useContext } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as UserService from "../services/userServices";
import ThemeContext from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ContainerProps = {
  children: React.ReactNode;
};

const BackgroundGradient: React.FC<ContainerProps> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "Dark";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? "#000000" : "#FFFFFF",
        // Paddings to handle safe area
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    color: "black",
  },
});

export default BackgroundGradient;

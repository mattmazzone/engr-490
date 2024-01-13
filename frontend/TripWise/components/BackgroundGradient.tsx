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

  const DarkTheme = ["#082B14", "#2BCD61"];
  const LightTheme = ["#1F9346", "#B4C8B1"];

  return (
    <LinearGradient
      colors={isDarkMode ? DarkTheme : LightTheme}
      style={styles.gradient}
    >
      <View
        style={{
          flex: 1,

          // Paddings to handle safe area
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default BackgroundGradient;

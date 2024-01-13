import * as React from "react";
import { useContext } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as UserService from "../services/userServices";
import ThemeContext from "../context/ThemeContext";

type ContainerProps = {
  children: React.ReactNode;
};

async function fetchUserTheme() {
  const user = await UserService.fetchUserProfile();
  if (!user) return false;
  return user.settings.backgroundTheme;
}

const BackgroundGradient: React.FC<ContainerProps> = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "Dark";

  const DarkTheme = ["#082B14", "#2BCD61"];
  const LightTheme = ["#1F9346", "#B4C8B1"];

  return (
    <LinearGradient
      colors={isDarkMode ? DarkTheme : LightTheme}
      style={styles.gradient}
    >
      {children}
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

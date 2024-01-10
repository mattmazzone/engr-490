import * as React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "react-native/Libraries/NewAppScreen";
import * as UserService from "../services/userServices";

type ContainerProps = {
  children: React.ReactNode;
};

async function fetchUserTheme() {
  const user = await UserService.fetchUserProfile();
  if (!user) return false;
  return user.settings.backgroundTheme;
}

const BackgroundGradient: React.FC<ContainerProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean | null>(null);
  const DarkTheme = ["#082B14", "#2BCD61"];
  const LightTheme = ["#1F9346", "#B4C8B1"];

  React.useEffect(() => {
    const fetchTheme = async () => {
      const theme = await fetchUserTheme();
      setIsDarkMode(theme);
    }


    fetchTheme();
  }, []);
  // Check if isDarkMode is not null before rendering
  if (isDarkMode === null) {
    return <div>Loading...</div>; // or some other loading state
  }

  return (
    <LinearGradient
      colors={isDarkMode == true ? DarkTheme : LightTheme}
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

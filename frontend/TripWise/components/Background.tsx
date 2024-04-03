import * as React from "react";
import { useContext } from "react";
import { View } from "react-native";
import ThemeContext from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ContainerProps = {
  children: React.ReactNode;
};

const Background: React.FC<ContainerProps> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "Dark"; // True = Dark Mode, False = Light Mode

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? "#171F21" : "#FFFFFF",

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

export default Background;

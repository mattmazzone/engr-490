import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

interface SettingOptionProps {
  icon: JSX.Element;
  title: string;
  onPress: () => void;
  hasBorder?: boolean;
}

const SettingOption = ({
  icon,
  title,
  onPress,
  hasBorder,
}: SettingOptionProps) => (
  <TouchableOpacity
    style={[styles.settingOption, hasBorder ? styles.settingOptionBorder : {}]}
    onPress={onPress}
  >
    <View style={styles.settingIconContainer}>{icon}</View>
    <Text style={styles.settingTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  settingOption: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 20,
    alignItems: "center",
  },
  settingIconContainer: {
    width: 50, // You can adjust this width as needed
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20, // This will be the gap between the icon and the text
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    // Add flex: 1 if you want to ensure the text is aligned left and the TouchableOpacity fills the available space
    flex: 1,
  },
  settingOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
});

export default SettingOption;

import React, { useEffect, useState, useContext } from "react";
import {
  Text,
  View,
  Modal,
  StyleSheet,
  Pressable,
  Switch,
  Dimensions,
} from "react-native";
import Background from "../Background";
import ThemeContext from "../../context/ThemeContext";
import BackButton from "../BackButton";

interface AppSettingsPageProps {
  isVisible: boolean;
  userSettings: any;
  updateUserSettings: any;
  closeModal: any;
  useModal: boolean;
}
const useResponsiveScreen = (breakpoint: number) => {
  const [isScreenSmall, setIsScreenSmall] = useState(
    Dimensions.get("window").width < breakpoint
  );

  useEffect(() => {
    const updateScreenSize = () => {
      const screenWidth = Dimensions.get("window").width;
      setIsScreenSmall(screenWidth < breakpoint);
    };

    // Add event listener
    const subscription = Dimensions.addEventListener(
      "change",
      updateScreenSize
    );

    // Remove event listener on cleanup
    return () => subscription.remove();
  }, [breakpoint]);

  return isScreenSmall;
};

const AppSettingsPage = ({
  isVisible = true,
  userSettings,
  updateUserSettings,
  closeModal = () => {},
  useModal = false,
}: AppSettingsPageProps) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    setIsEnabled(userSettings.backgroundTheme);
  }, [userSettings]);

  const toggleBackgroundSwitch = () => {
    const newTheme = !isEnabled ? "Dark" : "Light";
    setIsEnabled(!isEnabled);
    setTheme(newTheme); // Update global theme
  };
  const [isEmailEnabled, setIsEmailEnabled] = useState<boolean>(
    userSettings?.emailNotification || false
  );
  const toggleEmailSwitch = () =>
    setIsEmailEnabled((previousState: boolean) => !previousState);

  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(
    userSettings?.pushNotification || false
  );
  const togglePushSwitch = () => {
    setIsPushEnabled((previousState: boolean) => !previousState);
  };

  useEffect(() => {
    if (userSettings) {
      setIsEmailEnabled(userSettings.emailNotification);
      setIsPushEnabled(userSettings.pushNotification);
    }
  }, [userSettings]);

  const handleAppSettingsPreferences = async () => {
    const newSettings = {
      ...userSettings,
      emailNotification: isEmailEnabled,
      pushNotification: isPushEnabled,
      backgroundTheme: isEnabled,
    };

    await updateUserSettings(newSettings);
    const screenWidth = Dimensions.get("window").width;
    if (screenWidth <= 766) {
      closeModal();
    }
  };
  const isScreenSmall = useResponsiveScreen(768);

  const content = (
    <Background>
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme === "Dark" ? "#12181A" : "rgba(240, 241, 241, 0.69)",
          },
          isScreenSmall
            ? {
                margin: 10,
                alignItems: "center",
                alignSelf: "center",
                width: "90%",
              }
            : { margin: 80, alignSelf: "flex-start" },
        ]}
      >
        {isScreenSmall && <BackButton onPress={() => closeModal()} />}
        <Text
          style={[
            styles.header,
            { color: theme === "Dark" ? "white" : "black" },
          ]}
        >
          App
        </Text>
        <Text style={[styles.smallHeader, { color: "#6B7280", fontSize: 16 }]}>
          Manage your app preferences
        </Text>
        <View
          style={[
            isScreenSmall ? styles.containerSmall : styles.containerLarge,
          ]}
        >
          <View style={styles.notificationChoice}>
            <Text
              style={[
                styles.typeNotificationText,
                { color: theme === "Dark" ? "white" : "black" },
              ]}
            >
              Background Theme
            </Text>

            <Switch
              trackColor={{ false: "#767577", true: "rgba(34, 170, 85, 1)" }}
              thumbColor={isEnabled ? "#32cd32" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleBackgroundSwitch}
              value={isEnabled}
            />
          </View>

          <View style={styles.notificationChoice}>
            <Text
              style={[
                styles.typeNotificationText,
                { color: theme === "Dark" ? "#fff" : "#000" },
              ]}
            >
              E-Mail Notifications
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#rgba(34, 170, 85, 1)" }}
              thumbColor={isEmailEnabled ? "#32cd32" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleEmailSwitch}
              value={isEmailEnabled}
            />
          </View>
          <View style={styles.notificationChoice}>
            <Text
              style={[
                styles.typeNotificationText,
                { color: theme === "Dark" ? "#fff" : "#000" },
              ]}
            >
              Push Notifications
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#rgba(34, 170, 85, 1)" }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={togglePushSwitch}
              value={isPushEnabled}
            />
          </View>
        </View>

        <View>
          <Pressable
            onPress={handleAppSettingsPreferences}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Background>
  );

  return useModal ? (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={closeModal}
    >
      {content}
    </Modal>
  ) : (
    content
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 1000, // Adjust as needed
    borderRadius: 10, // Rounded corners for the container
    padding: 20, // Add padding to create spacing inside the container
    margin: 10, // Add margin to create spacing outside the container
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
  },
  containerSmall: {
    width: "100%", // Adjust as needed
    flexDirection: "column",
  },
  containerLarge: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  smallHeader: {
    fontSize: 15,
    marginBottom: 20,
  },

  typeNotificationText: {
    fontSize: 20,
    fontWeight: "bold",
  },

  notificationChoice: {
    flexDirection: "row",
    justifyContent: "space-between", // This spreads out the child elements across the available space.
    alignItems: "center", // This centers the elements vertically.
    marginBottom: 20,
    paddingHorizontal: 10, // Add some padding if needed.
  },
  button: {
    backgroundColor: "rgba(34, 170, 85, 1)",
    borderRadius: 7,
    justifyContent: "center", // Center the content horizontally
    alignItems: "center", // Center the button in the container
    paddingVertical: 10,
    paddingHorizontal: 20, // Padding inside the button for height
    width: 230, // Set the width of the button
  },
  buttonText: {
    color: "white",
    textAlign: "center", // Center the text horizontally
    fontSize: 18, // Set the font size
    fontWeight: "bold", // Bold font weight
  },
});

export default AppSettingsPage;

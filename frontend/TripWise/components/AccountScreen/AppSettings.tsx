import React, { useEffect, useState, useContext } from "react";
import {
  Text,
  View,
  Modal,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Switch,
  Dimensions,
} from "react-native";
import Background from "../Background";
import ThemeContext from "../../context/ThemeContext";
import BackButton from "../BackButton";
import { NavigationProp } from "@react-navigation/native";

interface AppSettingsPageProps {
  isVisible: boolean;
  userSettings: any;
  updateUserSettings: any;
  closeModal: any;
  useModal: boolean;
  navigation:NavigationProp<any, any>;
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
  navigation,
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

  const navigateToSelectInterests = () => {
    navigation.navigate("SelectInterests");
    closeModal(); 
  };

  const isScreenSmall = useResponsiveScreen(768);

  const content = (
    <Background>
      <SafeAreaView style={styles.container}>
        {isScreenSmall && <BackButton onPress={() => closeModal()} />}
        <View style={styles.titleView}>
          <Text
            style={[
              styles.titleText,
              { color: theme === "Dark" ? "white" : "black" },
            ]}
          >
            App Settings
          </Text>
        </View>
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
            style={{ height: 25 }}
            trackColor={{ false: "#767577", true: "rgba(34, 170, 85, 1)" }}
            thumbColor={isEnabled ? "#32cd32" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleBackgroundSwitch}
            value={isEnabled}
          />
        </View>
        <Text
          style={[
            styles.subtitleText,
            { color: theme === "Dark" ? "white" : "black" },
          ]}
        >
          Notification Settings
        </Text>
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
            style={{ height: 25 }}
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
            style={{ height: 25 }}
            trackColor={{ false: "#767577", true: "#rgba(34, 170, 85, 1)" }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={togglePushSwitch}
            value={isPushEnabled}
          />
        </View>
        <Text
            style={[
            styles.subtitleText,
            { color: theme === "Dark" ? "white" : "black" },
            ]}
            >
              User Settings
          </Text>

          <View style={styles.notificationChoice}>
              <Text
                style={[
                  styles.updateInterestsText,
                  { color: theme === "Dark" ? "white" : "black" },
                ]}
              >
                Update Interests
              </Text>
              <Pressable
                onPress={navigateToSelectInterests}
              >
                <Text
                  style={[
                    styles.arrowText,
                    { color: theme === "Dark" ? "white" : "grey" },
                  ]}
                >
                  {'>'}
                </Text>
              </Pressable>
        </View>
        <View>
          <Pressable
            onPress={handleAppSettingsPreferences}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
    flex: 1,
    alignItems: "center",
  },
  settingItem: {
    flexDirection: "row", // Align children horizontally
    alignItems: "center", // Center items vertically in the container
    marginBottom: 10, // Optional: add some space between this setting item and the next
  },
  titleView: {
    flexDirection: "row",
    justifyContent: "center",
    height: 60,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  titleText: {
    color: "white",
    fontSize: 30,
    marginTop: 3,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitleText: {
    color: "white",
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 32,
  },
  textStyle: {
    color: "white",
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold",
    width: "auto", //325
    marginBottom: 32,
    marginRight: 75,
  },
  lineSpace: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
    height: 70,
    justifyContent: "center",
  },
  textSpace: {
    alignItems: "flex-start",
    height: 70,
  },
  typeNotificationText: {
    color: "white",
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold",
    width: 315, //325
    marginBottom: 32,
  },
  updateInterestsText: {
    color: "white",
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold",
    width: 315, //325
    marginBottom: 32,
    marginRight: 30,
  },

  notificationSpaces: {
    alignItems: "flex-start",
    height: 120,
  },
  notificationChoice: {
    flexDirection: "row",
    alignItems: "flex-start",
    height: 50,
  },
  button: {
    backgroundColor: "rgba(34, 170, 85, 1)",
    flexDirection: "row",
    width: "75%",
    height: 45,
    borderRadius: 7,
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    marginTop: 10,
    fontSize: 18,
    width: 150,
    height: 50,
  },
  backButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 20,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default AppSettingsPage;

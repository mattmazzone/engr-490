import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Modal,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Switch,
} from "react-native";
import BackgroundGradient from "../BackgroundGradient";

const NotificationScreen = ({
  isVisible,
  userSettings,
  updateUserSettings,
  closeModal,
}: any) => {
  // Switch controls
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
    console.log("isPushEnabled", isPushEnabled);
  };

  useEffect(() => {
    if (userSettings) {
      console.log("userSettings", userSettings);
      setIsEmailEnabled(userSettings.emailNotification);
      setIsPushEnabled(userSettings.pushNotification);
    }
  }, [userSettings]);

  console.log("userSettings", userSettings);

  const handleNotificationPreferences = async () => {
    const newSettings = {
      emailNotification: isEmailEnabled,
      pushNotification: isPushEnabled,
    };

    await updateUserSettings(newSettings);
    closeModal();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={closeModal}
    >
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          <View style={styles.titleView}>
            <Text style={styles.titleText}> Notification Settings </Text>
          </View>
          <View style={styles.notificationSpaces}>
            <View style={styles.notificationChoice}>
              <Text style={styles.typeNotificationText}>
                {" "}
                E-Mail Notifications{" "}
              </Text>
              <Switch
                style={{ height: 25 }}
                trackColor={{ false: "#767577", true: "#00ff00" }}
                thumbColor={isEmailEnabled ? "#32cd32" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleEmailSwitch}
                value={isEmailEnabled}
              />
            </View>
            <View style={styles.notificationChoice}>
              <Text style={styles.typeNotificationText}>
                {" "}
                Push Notifications{" "}
              </Text>
              <Switch
                style={{ height: 25 }}
                trackColor={{ false: "#767577", true: "#00ff00" }}
                thumbColor={isPushEnabled ? "#32cd32" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={togglePushSwitch}
                value={isPushEnabled}
              />
            </View>
          </View>
          <View>
            <Pressable
              onPress={handleNotificationPreferences}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  titleView: {
    height: 60,
    width: 400,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  titleText: {
    color: "white",
    fontSize: 30,
    marginTop: 3,
    fontWeight: "bold",
    width: "80%",
    marginBottom: 16,
  },
  typeNotificationText: {
    color: "white",
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold",
    width: 315, //325
    marginBottom: 32,
  },
  notificationSpaces: {
    alignItems: "flex-start",
    height: 650,
  },
  notificationChoice: {
    flexDirection: "row",
    alignItems: "flex-start",
    height: 50,
  },
  button: {
    backgroundColor: "#006400",
    flexDirection: "row",
    width: "75%",
    height: 45,
    borderRadius: 7,
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    marginTop: 10,
    marginLeft: "30%",
    fontSize: 18,
    width: 150,
    height: 50, // add some space between text and logo
  },
});

export default NotificationScreen;

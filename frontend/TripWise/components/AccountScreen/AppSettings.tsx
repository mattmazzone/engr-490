import React, { useEffect, useState, useContext } from "react";
import {
  Text,
  View,
  Modal,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Switch,
} from "react-native";
import Background from "../Background";
import ThemeContext from "../../context/ThemeContext";

interface AppSettingsPageProps {
  isVisible: boolean;
  userSettings: any;
  updateUserSettings: any;
  closeModal: any;
}

const AppSettingsPage = ({
  isVisible,
  userSettings,
  updateUserSettings,
  closeModal,
}: AppSettingsPageProps) => {
  const { setTheme } = useContext(ThemeContext);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    setIsEnabled(userSettings.backgroundTheme);
  }, [userSettings]);

  const toggleBackgroundSwitch = () => {
    const newTheme = !isEnabled ? "Dark" : "Light";
    setIsEnabled(!isEnabled);
    setTheme(newTheme); // Update global theme
  };

  const handleAppSettingsPreferences = async () => {
    const newSettings = {
      ...userSettings,
      backgroundTheme: isEnabled,
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
      <Background>
        <SafeAreaView style={styles.container}>
          <View style={styles.titleView}>
            <Text style={styles.titleText}> App Settings </Text>
          </View>
          <View style={styles.lineSpace}>
            <View>
              <Text style={styles.textStyle}> Background Theme </Text>
            </View>
            <Text style={{ color: "white", fontSize: 20 }}>
              {isEnabled ? "Dark" : "Light"}
            </Text>
            <Switch
              style={{ height: 25 }}
              trackColor={{ false: "#767577", true: "#00ff00" }}
              thumbColor={isEnabled ? "#32cd32" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleBackgroundSwitch}
              value={isEnabled}
            />
          </View>
          <View>
            <Pressable
              onPress={handleAppSettingsPreferences}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Background>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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
    width: "95%",
    alignItems: "flex-start",
    height: 50,
  },
  textSpace: {
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
    height: 50,
  },
});

export default AppSettingsPage;

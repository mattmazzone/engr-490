import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";
import { useUserProfile } from "../../hooks/useUserProfile";
import * as UserService from "../../services/userServices";
import { NavigationProp } from "@react-navigation/native";
import About from "../../components/AccountScreen/About";
import NotificationScreen from "../../components/AccountScreen/NotificationScreen";
import AppSettingsLogo from "../../components/SVGLogos/AppSettingsLogo";
import PrivacySettingsLogo from "../../components/SVGLogos/PrivacySettingsLogo";
import BackupAndRestoreLogo from "../../components/SVGLogos/BackupAndRestoreLogo";
import HelpAndSupportLogo from "../../components/SVGLogos/HelpAndSupportLogo";
import NotificationSettingsLogo from "../../components/SVGLogos/NotificationSettingsLogo";
import TripWiseLogoSmall from "../../components/SVGLogos/TripWiseLogoSmall";
import AppSettingsPage from "../../components/AccountScreen/AppSettings";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Account = ({ navigation }: RouterProps) => {
  const { userProfile, isFetching } = useUserProfile();

  const [userSettings, setUserSettings] = useState({
    emailNotification: false,
    pushNotification: false,
    backgroundTheme: false,
  });

  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [appSettingsVisible, setAppSettingsModalVisible] = useState(false);

  // Get user settings
  useEffect(() => {
    console.log("userProfile", userProfile);
    if (userProfile && userProfile.settings) {
      setUserSettings({
        emailNotification: userProfile.settings.emailNotification,
        pushNotification: userProfile.settings.pushNotification,
        backgroundTheme: userProfile.settings.backgroundTheme,
      });
    }
  }, [userProfile]); // Update settings when userProfile changes

  // Function to update user settings
  const updateUserSettings = async (newSettings: any) => {
    try {
      await UserService.updateUserSettings(newSettings);
      setUserSettings(newSettings); // Update state with new settings
    } catch (error) {
      console.error("Error updating user settings:", error);
    }
  };

  const handleLogout = () => {
    FIREBASE_AUTH.signOut();
  };

  // TODO: REPLACE WITH COOL SPINNER
  if (isFetching) {
    return (
      <BackgroundGradient>
        <Text>Loading...</Text>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {/* Profile image and name */}
          <Image source={{}} style={styles.profileImage} />
          {userProfile && (
            <Text style={styles.profileName}>
              {`${userProfile.firstName} ${userProfile.lastName}`}
            </Text>
          )}
        </View>

        <View style={styles.settings}>
          {/* Settings options with icons */}
          {SettingOption(
            <AppSettingsLogo focused={false} />, 
            "App Settings",
            () => {
              setAppSettingsModalVisible(true);
            }
          )}
          {SettingOption(
            <PrivacySettingsLogo focused={false} />,
            "Privacy Settings"
          )}
          {SettingOption(
            <BackupAndRestoreLogo focused={false} />,
            "Backup and Restore"
          )}
          {SettingOption(
            <HelpAndSupportLogo focused={false} />,
            "Help and Support"
          )}
          {SettingOption(
            <NotificationSettingsLogo focused={false} />,
            "Notification Settings",
            () => {
              setNotificationModalVisible(true);
            }
          )}
          {SettingOption(
            <TripWiseLogoSmall />,
            "About",
            () => {
              setAboutModalVisible(true);
            },
            true
          )}
        </View>

        <AppSettingsPage
          isVisible={appSettingsVisible}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
          closeModal={() => setAppSettingsModalVisible(false)}
        />

        <NotificationScreen
          isVisible={notificationModalVisible}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
          closeModal={() => setNotificationModalVisible(false)}
        />

        <Modal
          animationType="slide"
          transparent={false}
          visible={aboutModalVisible}
          onRequestClose={() => {
            setAboutModalVisible(!aboutModalVisible);
          }}
        >
          <About
            closeModal={() => setAboutModalVisible(false)}
            navigation={navigation}
          />
        </Modal>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </BackgroundGradient>
  );
};

// Helper function to create a setting option with an icon
const SettingOption = (
  iconComponent: any,
  title: any,
  action?: any,
  isLast?: any
) => (
  <TouchableOpacity
    style={[styles.settingOption, isLast ? null : styles.settingOptionBorder]}
    onPress={action}
  >
    <View style={styles.settingIconContainer}>{iconComponent}</View>
    <Text style={styles.settingTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc", // Placeholder color
  },
  profileName: {
    color: "#fff",
    fontSize: 20,
    marginTop: 10,
    fontWeight: "bold",
  },
  settings: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 3,
  },
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
    color: "#fff",
    // Add flex: 1 if you want to ensure the text is aligned left and the TouchableOpacity fills the available space
    flex: 1,
  },
  settingOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 3,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default Account;

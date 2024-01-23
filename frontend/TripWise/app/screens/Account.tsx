import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
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
import SettingOption from "../../components/AccountScreen/SettingOption";
import BackupAndRestoreScreen from "../../components/AccountScreen/BackupAndRestoreScreen";
import HelpAndSupportScreen from "../../components/AccountScreen/HelpAndSupportScreen";
import { UserSettings } from "../../types/userTypes";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Account = ({ navigation }: RouterProps) => {
  const { userProfile, isFetchingProfile } = useUserProfile({
    refreshData: true,
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    emailNotification: false,
    pushNotification: false,
    backgroundTheme: false,
  });

  const [aboutModalVisible, setAboutModalVisible] = useState<boolean>(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState<boolean>(false);
  const [appSettingsVisible, setAppSettingsModalVisible] = useState<boolean>(false);
  const [backupAndRestoreModalVisible, setBackupAndRestoreModalVisible] = useState<boolean>(false);
  const [helpAndSupportModalVisible, setHelpAndSupportModalVisible] = useState<boolean>(false);

  // Get user settings
  useEffect(() => {
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
  if (isFetchingProfile) {
    return (
      <BackgroundGradient>
        <Text>Loading...</Text>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <View style={styles.container}>
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
          {SettingOption({
            icon: <AppSettingsLogo focused={false} />,
            title: "App Settings",
            onPress: () => {
              setAppSettingsModalVisible(true);
            },
            hasBorder: true,
          })}
          {SettingOption({
            icon: <PrivacySettingsLogo focused={false} />,
            title: "Privacy Settings",
            onPress: () => {
              console.log("Privacy Settings");
            },
            hasBorder: true,
          })}
          {SettingOption({
            icon: <BackupAndRestoreLogo focused={false} />,
            title: "Backup and Restore",
            onPress: () => {
              setBackupAndRestoreModalVisible(true);
            },
            hasBorder: true,
          })}
          {SettingOption({
            icon: <HelpAndSupportLogo focused={false} />,
            title: "Help and Support",
            onPress: () => {
              setHelpAndSupportModalVisible(true);
            },
            hasBorder: true,
          })}
          {SettingOption({
            icon: <NotificationSettingsLogo focused={false} />,
            title: "Notification Settings",
            onPress: () => {
              setNotificationModalVisible(true);
            },
            hasBorder: true,
          })}
          {SettingOption({
            icon: <TripWiseLogoSmall />,
            title: "About",
            onPress: () => {
              setAboutModalVisible(true);
            },
            hasBorder: false,
          })}
        </View>

        <AppSettingsPage
          isVisible={appSettingsVisible}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
          closeModal={() => setAppSettingsModalVisible(false)}
        />

        <BackupAndRestoreScreen
          isVisible={backupAndRestoreModalVisible}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
          closeModal={() => setBackupAndRestoreModalVisible(false)}
        />

        <NotificationScreen
          isVisible={notificationModalVisible}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
          closeModal={() => setNotificationModalVisible(false)}
        />

        <HelpAndSupportScreen
          isVisible={helpAndSupportModalVisible}
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
          closeModal={() => setHelpAndSupportModalVisible(false)}
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
      </View>
    </BackgroundGradient>
  );
};

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

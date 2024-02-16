// SettingsScreen.js
import React, { useEffect, useState, useContext } from "react";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  Modal,
} from "react-native";
import SettingOption from '../../components/AccountScreen/SettingOption';
import { UserSettings } from "../../types/userTypes";
import * as UserService from "../../services/userServices";
import { NavigationProp } from "@react-navigation/native";
import { useUserProfile } from "../../hooks/useUserProfile";
import AppSettingsLogo from "../../components/SVGLogos/AppSettingsLogo";
import PrivacySettingsLogo from "../../components/SVGLogos/PrivacySettingsLogo";
import BackupAndRestoreLogo from "../../components/SVGLogos/BackupAndRestoreLogo";
import HelpAndSupportLogo from "../../components/SVGLogos/HelpAndSupportLogo";
import AccountLogo from "../../components/SVGLogos/AccountLogo";
import LogoutLogo from "../../components/SVGLogos/LogoutLogo"
import AccountSettingPage from "../../components/AccountScreen/AccountSettings";
import AppSettingsPage from '../../components/AccountScreen/AppSettings'
import About from '../../components/AccountScreen/About';
import NotificationScreen from '../../components/AccountScreen/NotificationScreen'; // Your SettingOption component
import ThemeContext from '../../context/ThemeContext';
import TripWiseLogoSmall from "../../components/SVGLogos/TripWiseLogoSmall";
import Background from "../../components/Background";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const SettingsScreen = ({ navigation }: RouterProps) => {

  const { width } = useWindowDimensions();
  const isLargeScreen = width > 766;
  const [activeSetting, setActiveSetting] = useState('app');

  const { theme } = useContext(ThemeContext);
  const { userProfile, isFetchingProfile } = useUserProfile({
    refreshData: true,
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    emailNotification: false,
    pushNotification: false,
    backgroundTheme: false,
  });

  const [aboutModalVisible, setAboutModalVisible] = useState<boolean>(false);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState<boolean>(false);
  const [appSettingsVisible, setAppSettingsModalVisible] =
    useState<boolean>(false);
  const [accountSettingsVisible, setAccountSettingsVisible] = useState<boolean>(false)

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
  const updateUserSettings = async (newSettings: UserSettings) => {
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

  const renderContent = () => {
    switch (activeSetting) {
      case 'app':
        return <AccountSettingPage isVisible closeModal={() => setActiveSetting('')} useModal={false} />
      case 'settings':
        return <AppSettingsPage isVisible={true} userSettings={userSettings} updateUserSettings={updateUserSettings} closeModal={() => setActiveSetting('')} useModal={false} />;
      case 'notification':
        return <NotificationScreen />
      case 'about':
        return <About />
      default:
        return <View />;
    }
  };

  if (isLargeScreen) {

    return (
      <View style={[styles.container, { backgroundColor: theme === 'Dark' ? '#171F21' : 'white' }]}>
        <ScrollView style={[styles.sidebar, { backgroundColor: theme === 'Dark' ? '#12181A' : 'rgba(240, 241, 241, 0.69)' }]}>
          <View style={styles.header}>
            <Image source={{}} style={styles.profileImage} />
            {userProfile && (
              <Text
                style={[
                  styles.profileName,
                  { color: theme === "Dark" ? "white" : "black" },
                ]}
              >
                {`${userProfile.firstName} ${userProfile.lastName}`}
              </Text>
            )}
          </View>
          <SettingOption
            icon={<AccountLogo focused={true} />}
            title="Account Settings"
            onPress={() => setActiveSetting('app')}
            hasBorder={false}
            isActive={activeSetting === 'app'}
          />
          <SettingOption
            icon={<AppSettingsLogo />}
            title="App Settings"
            onPress={() => setActiveSetting('settings')}
            hasBorder={false}
            isActive={activeSetting === 'settings'}
          />
          <SettingOption
            icon={<PrivacySettingsLogo />}
            title="Privacy Settings"
            onPress={() => {
              console.log("Privacy Settings");
            }}
            hasBorder={false}
          />
          <SettingOption
            icon={<BackupAndRestoreLogo />}
            title="Backup and Restore"
            onPress={() => {
              console.log("Backup and Restore");
            }}
            hasBorder={false}
          />
          <SettingOption
            icon={<HelpAndSupportLogo />}
            title="Help and Support"
            onPress={() => {
              console.log("Help and Support");
            }}
            hasBorder={false}
          />
          <SettingOption
            title="About"
            onPress={() => setActiveSetting('about')}
            icon={<TripWiseLogoSmall />}
            hasBorder={false}
            isActive={activeSetting === 'about'}
          />
          <SettingOption
            title="Sign Out"
            onPress={handleLogout}
            icon={<LogoutLogo size={20} />}
            hasBorder={false}
          />
        </ScrollView>
        <View style={styles.contentArea}>
          {renderContent()}
        </View>
      </View>
    );

  }
  else {
    return (
      <Background>
        <View style={styles.container}>
          <ScrollView style={styles.settings}>
            <View style={styles.header}>
              <Image source={{}} style={styles.profileImage} />
              {userProfile && (
                <Text
                  style={[
                    styles.profileName,
                    { color: theme === "Dark" ? "white" : "black" },
                  ]}
                >
                  {`${userProfile.firstName} ${userProfile.lastName}`}
                </Text>
              )}
            </View>
            <SettingOption
              icon={<AccountLogo focused={false} />}
              title="Account Settings"
              onPress={() => setAccountSettingsVisible(true)}
              hasBorder={true}
            />
            <SettingOption
              icon={<AppSettingsLogo />}
              title="App Settings"
              onPress={() => setAppSettingsModalVisible(true)}
              hasBorder={true}
            />
            <SettingOption
              icon={<PrivacySettingsLogo />}
              title="Privacy Settings"
              onPress={() => {
                console.log("Privacy Settings");
              }}
              hasBorder={true}
            />
            <SettingOption
              icon={<BackupAndRestoreLogo />}
              title="Backup and Restore"
              onPress={() => {
                console.log("Backup and Restore");
              }}
              hasBorder={true}
            />
            <SettingOption
              icon={<HelpAndSupportLogo />}
              title="Help and Support"
              onPress={() => {
                console.log("Help and Support");
              }}
              hasBorder={true}
            />
            <SettingOption
              icon={<TripWiseLogoSmall />}
              title="About"
              onPress={() => {
                setAboutModalVisible(true);
              }}
              hasBorder={true}
            />
            <SettingOption
              title="Sign Out"
              onPress={handleLogout}
              icon={<LogoutLogo size={20} />}
              hasBorder={false}
            />
          </ScrollView>
          <AccountSettingPage
            isVisible={accountSettingsVisible}
            closeModal={() => setAccountSettingsVisible(false)}
            useModal={true} />
          <AppSettingsPage
            isVisible={appSettingsVisible}
            userSettings={userSettings}
            updateUserSettings={updateUserSettings}
            closeModal={() => setAppSettingsModalVisible(false)}
            useModal={true}
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


        </View>
      </Background>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',

  },
  sidebar: {
    flexGrow: 0,
    width: 280, // Adjust the width of the sidebar as needed
    marginBottom: 90,
    padding: 20, // Adjust padding to your preference
    borderRadius: 10, // Rounded corners
    // Shadow for iOS
    shadowColor: '#184D47',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 5,
  },
  contentArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    padding: 20,
    marginBottom: 20,

    borderRadius: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc", // Placeholder color
  },
  profileName: {
    fontSize: 20,
    marginTop: 10,
    fontWeight: "bold",
  },
  settings: {
    borderRadius: 3,

  },
  logoutButton: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    padding: 10,
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 10,
    borderRadius: 3,
    flexDirection: 'row',
  },
  logoutIcon: {
    justifyContent: 'flex-start',
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default SettingsScreen;

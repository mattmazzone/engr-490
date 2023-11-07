import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import BackgroundGradient from "../../components/BackgroundGradient";
import { UserProfile } from "../../types/userTypes";
import * as UserService from "../../services/userServices";
import { NavigationProp } from "@react-navigation/native";
import About from "../../components/AccountScreen/About";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Account = ({ navigation }: RouterProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(true); // To track the fetching state

  useEffect(() => {
    const initializeUserProfile = async () => {
      try {
        const profile = await UserService.fetchUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    initializeUserProfile();
  }, []);

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
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Profile image and name */}
          <Image
            source={{ uri: "path-to-your-image" }}
            style={styles.profileImage}
          />
          {userProfile && (
            <Text style={styles.profileName}>
              {`${userProfile.firstName} ${userProfile.lastName}`}
            </Text>
          )}
        </View>

        <View style={styles.settings}>
          {/* Settings options with icons */}
          {SettingOption("cog", "App Settings")}
          {SettingOption("shield", "Privacy Settings")}
          {SettingOption("cloud-upload", "Backup and Restore")}
          {SettingOption("question-circle", "Help and Support")}
          {SettingOption("bell", "Notification Settings")}
          {SettingOption("info-circle", "About", () => {
            setAboutModalVisible(true);
          })}
        </View>

        <Modal
          animationType="slide"
          transparent={false}
          visible={aboutModalVisible}
          onRequestClose={() => {
            setAboutModalVisible(!aboutModalVisible);
          }}
        >
          <About closeModal={() => setAboutModalVisible(false)} />
        </Modal>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </BackgroundGradient>
  );
};

// Helper function to create a setting option with an icon
const SettingOption = (iconName: any, title: any, action?: any) => (
  <TouchableOpacity style={styles.settingOption} onPress={action}>
    {/* <Icon name={iconName} size={20} color="#000" style={styles.settingIcon} /> */}
    <Text style={styles.settingTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
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
  },
  settings: {
    backgroundColor: "#fff",
  },
  settingOption: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  settingIcon: {
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default Account;

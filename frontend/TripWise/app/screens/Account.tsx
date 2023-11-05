import React from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const Account = () => {
  const handleLogout = () => {
    FIREBASE_AUTH.signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Profile image and name */}
        <Image
          source={{ uri: "path-to-your-image" }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Matteo Mazzone</Text>
      </View>

      <View style={styles.settings}>
        {/* Settings options with icons */}
        {SettingOption("cog", "App Settings")}
        {SettingOption("shield", "Privacy Settings")}
        {SettingOption("cloud-upload", "Backup and Restore")}
        {SettingOption("question-circle", "Help and Support")}
        {SettingOption("bell", "Notification Settings")}
        {SettingOption("info-circle", "About")}
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Helper function to create a setting option with an icon
const SettingOption = (iconName: any, title: any) => (
  <TouchableOpacity style={styles.settingOption}>
    {/* <Icon name={iconName} size={20} color="#000" style={styles.settingIcon} /> */}
    <Text style={styles.settingTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
  },
  header: {
    backgroundColor: "#008000",
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

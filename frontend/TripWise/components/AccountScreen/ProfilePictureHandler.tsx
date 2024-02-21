import React, { useState, useEffect, useContext } from "react";
import {
  Image,
  Alert,
  Platform,
  Pressable,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FIREBASE_STORAGE } from "../../FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ThemeContext from "../../context/ThemeContext";

const ProfilePictureUploader = ({ userID }: { userID: string }) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [imageNotFound, setImageNotFound] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    setIsLoading(true);
    const fetchProfileImageUrl = async () => {
      try {
        const imageUrl = await getDownloadURL(
          ref(FIREBASE_STORAGE, `profile-pictures/${userID}`)
        );
        setProfileImageUrl(imageUrl);
        setImageNotFound(false);
      } catch (error) {
        console.log("Error fetching profile image:", error);
        setImageNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (userID) {
      fetchProfileImageUrl();
    }
  }, [userID]);

  const uploadImage = async (uri: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(FIREBASE_STORAGE, `profile-pictures/${userID}`);
      if (blob.size > 5242880) {
        alert("File Size Exceeded, Please upload a file smaller than 5MB");
        return;
      }
      await uploadBytes(storageRef, blob);

      // Fetch and update the profile image URL after successful upload
      const imageUrl = await getDownloadURL(storageRef);
      setProfileImageUrl(imageUrl);
      setImageNotFound(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert(
        "Error",
        "There was an error uploading your profile picture."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Ensure the assets array and the fileSize property exist
      const pickedFile = result.assets ? result.assets[0] : null;
      if (
        pickedFile &&
        pickedFile.fileSize &&
        pickedFile.fileSize > 5 * 1024 * 1024
      ) {
        Alert.alert("File Too Large", "Please choose a file smaller than 5MB.");
        return;
      }

      if (pickedFile) {
        uploadImage(pickedFile.uri)
          .then(() => {
            Alert.alert(
              "Upload Successful",
              "Your profile picture has been updated."
            );
          })
          .catch((error) => {
            console.error("Error uploading image:", error);
            Alert.alert(
              "Error",
              "There was an error uploading your profile picture."
            );
          });
      }
    }
  };

  return (
    <Pressable onPress={handleChoosePhoto}>
      {isLoading ? (
        <ActivityIndicator size="large" color="rgba(34, 170, 85, 1)" /> // Display a loading indicator when isLoading is true
      ) : imageNotFound ? (
        <View
          style={{
            width: 90,
            height: 90,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 40,
            borderWidth: 3,
            borderColor: "#ccc",
          }}
        >
          <Text style={{ textAlign: "center", color: theme === "Dark" ? "white" : "black" }}>
            Click to upload a Profile Picture
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: profileImageUrl }}
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
      )}
    </Pressable>
  );
};

export default ProfilePictureUploader;

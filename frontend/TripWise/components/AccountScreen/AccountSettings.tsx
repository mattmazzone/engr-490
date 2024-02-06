import React, { useEffect, useState, useContext } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore"; // Import needed Firestore functions
import { updateEmail } from "firebase/auth";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Modal,
} from "react-native";
import Background from "../Background";
import { useUserProfile } from "../../hooks/useUserProfile";
import * as UserService from "../../services/userServices";
import { NavigationProp } from "@react-navigation/native";
import ThemeContext from "../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fi } from "@faker-js/faker";

const useResponsiveScreen = (breakpoint: number) => {
  const [isScreenSmall, setIsScreenSmall] = useState(Dimensions.get('window').width < breakpoint);

  useEffect(() => {
    const updateScreenSize = () => {
      const screenWidth = Dimensions.get('window').width;
      setIsScreenSmall(screenWidth < breakpoint);
    };

    // Add event listener
    const subscription = Dimensions.addEventListener('change', updateScreenSize);

    // Remove event listener on cleanup
    return () => subscription.remove();
  }, [breakpoint]);

  return isScreenSmall;
};
interface AccountPageProps {
  isVisible: boolean;
  closeModal: any;
  useModal: boolean;
}


const AccountPage = ({
  isVisible = true,
  closeModal = () => { },
  useModal = false,
}: AccountPageProps) => {

  const isScreenSmall = useResponsiveScreen(768);
  const { theme } = useContext(ThemeContext);
  const { userProfile, isFetchingProfile } = useUserProfile({ refreshData: true });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [focusState, setFocusState] = useState({
    firstName: false,
    lastName: false,
    phone: false,
  });

  // For border color change on focus
  const handleFocus = (inputName: string) => {
    setFocusState((prevFocusState) => ({
      ...prevFocusState,
      [inputName]: true,
    }));
  };

  const handleBlur = (inputName: string) => {
    setFocusState((prevFocusState) => ({
      ...prevFocusState,
      [inputName]: false,
    }));
  };

  //For phone number input
  const [phone, setPhone] = useState('');

  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digit characters from the input
    let cleaned = ('' + phoneNumber).replace(/\D/g, '');

    // Check the length and format accordingly
    // US Phone Number formatting (XXX) XXX-XXXX
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }
    let formattedNumber = cleaned;

    if (cleaned.length > 6) {
      formattedNumber = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length > 3) {
      formattedNumber = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length > 0) {
      formattedNumber = `(${cleaned}`;
    }

    setPhone(formattedNumber);
  };

  useEffect(() => {
    if (userProfile) {
      setFirstName(`${userProfile.firstName || ''}`);
      setLastName(`${userProfile.lastName || ''}`);
    }
  }, [userProfile]);

  const handleUpdate = async () => {
    const user = FIREBASE_AUTH.currentUser;

    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    // Update Firestore document
    const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
    await updateDoc(userDocRef, { firstName, lastName });


    // Optionally, update local storage
    const updatedProfile = { ...userProfile, firstName, lastName };
    await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    const screenWidth = Dimensions.get("window").width;
    if (screenWidth <= 766) {
      closeModal();
    }
    Alert.alert('Success', 'Profile updated successfully');
  };
  //TODO: REMOVE: For Testing Purposes
  const [isLoading, setIsLoading] = useState(true);
  setTimeout(() => setIsLoading(false), 1000);

  if (!isScreenSmall && (isLoading || isFetchingProfile)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: "center", backgroundColor: theme === 'Dark' ? '#12181A' : 'rgba(240, 241, 241, 0.69)' }}>
        <ActivityIndicator size="large" color="rgba(34, 170, 85, 1)" />
      </View>
    );
  }



  const content = (
    <Background>
      <View style={[styles.container, { backgroundColor: theme === 'Dark' ? '#12181A' : 'rgba(240, 241, 241, 0.69)' }, isScreenSmall ? { margin: 10, alignItems: 'center', alignSelf: 'center', width: '90%' } : { margin: 80, alignSelf: 'flex-start' },]}>
        <Text style={[styles.header, { color: theme === 'Dark' ? 'white' : 'black' }]}>
          Account
        </Text >
        <Text style={[styles.smallHeader, { color: '#6B7280', fontSize: 16 }]}>
          Manage your account details
        </Text>
        <View style={[isScreenSmall ? styles.containerSmall : styles.containerLarge]}>
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputTitles, { color: theme === 'Dark' ? 'white' : 'black' }]}>
              First Name
            </Text>
            <TextInput
              style={[styles.input, focusState.firstName ? styles.inputFocused : null, { backgroundColor: theme === 'Dark' ? '#202B2E' : 'white' }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              onFocus={() => handleFocus('phone')}
              onBlur={() => handleBlur('phone')}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputTitles, { color: theme === 'Dark' ? 'white' : 'black' }]}>
              Last Name
            </Text>
            <TextInput
              style={[styles.input, focusState.firstName ? styles.inputFocused : null, { backgroundColor: theme === 'Dark' ? '#202B2E' : 'white' }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              onFocus={() => handleFocus('phone')}
              onBlur={() => handleBlur('phone')}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputTitles, { color: theme === 'Dark' ? 'white' : 'black' }]}>
              Phone <Text style={{ color: "rgba(34, 170, 85, 1)", fontWeight: '500'! }}>(Optional)</Text>
            </Text>
            <TextInput
              style={[styles.input, focusState.firstName ? styles.inputFocused : null, { backgroundColor: theme === 'Dark' ? '#202B2E' : 'white' }]}
              onFocus={() => handleFocus('phone')}
              onBlur={() => handleBlur('phone')}
              value={phone}
              underlineColorAndroid="transparent"
              onChangeText={formatPhoneNumber}
              keyboardType="numeric"
            />
          </View>
        </View>
        <Pressable
          onPress={handleUpdate}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Save Changes</Text>
        </Pressable>
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
  ) : content;
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 1000, // Adjust as needed
    borderRadius: 10, // Rounded corners for the container
    padding: 20, // Add padding to create spacing inside the container
    margin: 10, // Add margin to create spacing outside the container
  },
  containerSmall: {
    width: '100%', // Adjust as needed
    flexDirection: 'column'
  },
  containerLarge: {
    flexDirection: 'row'!!!,
    flexWrap: 'wrap',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,

  },
  smallHeader: {
    fontSize: 15,
    marginBottom: 20,
  },
  inputWrapper: {
    alignItems: 'flex-start',
    marginRight: 25,
  },
  input: {
    marginBottom: 20, // Space between the inputs
    marginRight: 20, // Space between the inputs
    borderRadius: 10, // Rounded corners
    padding: 10, // Padding inside the input fields
    backgroundColor: "white", // Input background color
    fontSize: 16, // Set the font size
    borderColor: "rgba(34, 170, 85, 1)",
    borderWidth: 2,
    color: '#6B7280',
    width: '100%', // Set the width of the input
    maxWidth: 300, // Set a max-width for large screens
  },
  inputFocused: {
    borderWidth: 2,
  },
  inputTitles: {
    fontSize: 16,
    color: 'black',
    fontWeight: '700',
    paddingBottom: 10,
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
    textAlign: 'center', // Center the text horizontally
    fontSize: 18, // Set the font size
    fontWeight: 'bold', // Bold font weight
  },
});
export default AccountPage;
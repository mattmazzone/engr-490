import React, {useEffect, useState} from "react";
import {
  Text,
  View,
  Button,
  Modal,
  TextInput,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Switch,
} from "react-native";
import BackgroundGradient from "../BackgroundGradient";
import { UserProfile } from "firebase/auth";
import * as UserService from "../../services/userServices";
import { arraysEqual } from "../../util/arraysEqual"

const NotificationScreen = ({notificationPreferences, closeModal, navigation}:any)=>{
    const [isEmailEnabled, setIsEmailEnabled] = useState(false);
    const toggleEmailSwitch = () => setIsEmailEnabled(previousState => !previousState);
    const [isPushEnabled, setIsPushEnabled] = useState(false);
    const togglePushSwitch = () => setIsPushEnabled(previousState => !previousState);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(true);

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
    

    //Function to handle noticiations preferences
    const handlePreferences = async () => {
      if (userProfile && userProfile.uid){
        try{
          await UserService.userNotification(isEmailEnabled, isPushEnabled);
          const updatedProfile = await UserService.fetchUserProfile();
          if(!updatedProfile){
            return;
          }
          setUserProfile(updatedProfile);
        } catch (error){
          console.error("Error updating Notifications:", error);
        }
      }
    };

    return(
         <BackgroundGradient>
            <SafeAreaView style={styles.container}>
                <View style={styles.titleView}>
                    <Text style={styles.titleText}> Notification Settings </Text>
                </View> 
                <View style={styles.notificationSpaces}>
                    <View style={styles.notificationChoice}>
                        <Text style={styles.typeNotificationText}> E-Mail Notifications </Text>
                        <Switch style={{height:25}}
                            trackColor={{false: '#767577', true: '#00ff00'}}
                            thumbColor={isEmailEnabled ? '#32cd32' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleEmailSwitch}
                            value={isEmailEnabled}
                        />
                    </View>
                    <View style={styles.notificationChoice}>
                        <Text style={styles.typeNotificationText}> Push Notifications </Text>
                        <Switch style={{height:25}}
                            trackColor={{false: '#767577', true: '#00ff00'}}
                            thumbColor={isPushEnabled ? '#32cd32' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={togglePushSwitch}
                            value={isPushEnabled}
                        />
                    </View>
                </View>    
                <View>
                    <Pressable onPressIn= {handlePreferences} onPress={closeModal} style={styles.button}>
                            <Text style={styles.buttonText}>Close</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
                
                
        </BackgroundGradient>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
      },
      titleView:{
        height: 60,
        width: 400,
        alignItems:'center',
        marginTop: 16,
        marginBottom: 30,
      },
      titleText:{
        color: "white",
        fontSize: 30,
        marginTop: 3,
        fontWeight: 'bold',
        width:"80%",
        marginBottom:16,
      },
      typeNotificationText:{
        color: "white",
        alignSelf:'center',
        fontSize: 20,
        fontWeight: "bold",
        width:315,//325
        marginBottom: 32,
      },
      notificationSpaces:{
        alignItems:"flex-start",
        height: 650,
      },
      notificationChoice:{
        flexDirection:"row",
        alignItems:"flex-start",
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
        color:"white",
        marginTop: 10,
        marginLeft: "30%",
        fontSize: 18,
        width: 150,
        height: 50, // add some space between text and logo
      },
});

export default NotificationScreen;
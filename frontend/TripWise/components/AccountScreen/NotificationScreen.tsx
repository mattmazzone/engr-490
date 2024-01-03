import React, {useState} from "react";
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

const NotificationScreen = ({closeModal, navigation}:any)=>{
    const [isEmailEnabled, setIsEmailEnabled] = useState(false);
    const toggleEmailSwitch = () => setIsEmailEnabled(previousState => !previousState);
    const [isPushEnabled, setIsPushEnabled] = useState(false);
    const togglePushSwitch = () => setIsPushEnabled(previousState => !previousState);

    return(
         <BackgroundGradient>
            <SafeAreaView style={styles.container}>
                <View style={styles.titleView}>
                    <Text style={styles.titleText}> Notification Settings </Text>
                </View> 
                <View style={styles.notificationSpaces}>
                    <View style={styles.notificationChoice}>
                        <Text style={styles.typeNotificationText}> E-Mail Notifications </Text>
                        <Switch 
                            trackColor={{false: '#767577', true: '#81b0ff'}}
                            thumbColor={isEmailEnabled ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleEmailSwitch}
                            value={isEmailEnabled}
                        />
                    </View>
                    <View style={styles.notificationChoice}>
                        <Text style={styles.typeNotificationText}> Push Notifications </Text>
                        <Switch 
                            trackColor={{false: '#767577', true: '#81b0ff'}}
                            thumbColor={isPushEnabled ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={togglePushSwitch}
                            value={isPushEnabled}
                        />
                    </View>
                </View>    
                <View>
                    <Pressable onPress={closeModal} style={styles.button}>
                            <Text style={styles.buttonText}>Close Modal</Text>
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
      },
      titleText:{
        color: "black",
        fontSize: 30,
        marginTop: 3,
        fontWeight: "bold",
        width:"80%",
        marginBottom:16,
      },
      typeNotificationText:{
        color: "black",
        fontSize: 20,
        marginTop: 3,
        fontWeight: "bold",
        width:"80%",
      },
      notificationSpaces:{
        alignItems:"flex-start",
        height: 675,
      },
      notificationChoice:{
        flexDirection:"row",
        alignItems:"flex-start",
        height: 50,
      },
      button: {
        backgroundColor: "black",
        flexDirection: "row",
        width: "75%",
        height: 45,
        borderRadius: 7,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        paddingLeft: 30,
      },
      buttonText: {
        color:"white",
        fontSize: 18,
        marginRight: 30, // add some space between text and logo
      },
});

export default NotificationScreen;
import React, { useEffect, useState, useContext } from "react";
import {
  Text,
  View,
  Modal,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Switch,
  Linking,
} from "react-native";
import BackgroundGradient from "../BackgroundGradient";
import ThemeContext from "../../context/ThemeContext";

interface HelpAndSupportScreenProps {
    isVisible: boolean;
    userSettings: any;
    updateUserSettings: any;
    closeModal: any;
    
}

const HelpAndSupportScreen = ({
    isVisible,
    userSettings,
    updateUserSettings,
    closeModal,
}: HelpAndSupportScreenProps) => {

    return(
        <Modal
        animationType="slide"
        transparent={false}
        visible={isVisible}
        onRequestClose={closeModal}
        >
            <BackgroundGradient>
                <SafeAreaView style={styles.container}>
                    <View style={styles.titleView}>
                        <Text style={styles.titleText}>Help & Support</Text>
                    </View>
                    <View style={{flexDirection:'row', height:'auto', width:'90%'}}>
                        <View >
                            <Text style={styles.textStyle}>Link to documentation</Text>
                        </View>
                        <View>
                            <Pressable
                                onPress={() => {
                                    Linking.openURL("https://github.com/mattmazzone/engr-490/blob/main/README.md")}}
                                style={styles.linkButton}
                            >
                                <Text style={styles.linkText}>Link</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View>
                        
                    </View>
                    <View>
                        <Text style={{color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 10, marginLeft: 10}}>Contact Us</Text>
                        <Text style={{color: "white", fontSize: 15, marginBottom: 10, marginLeft: 10}}>Email: tripwise@gmail.com </Text>
                    </View>
                    <Pressable
                        onPress={closeModal}
                        style={styles.closeButton}
                        >
                        <Text style={styles.buttonText}>Close</Text>
                    </Pressable>
                </SafeAreaView>
            </BackgroundGradient>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: "center",
    },

    titleView: {
        height: 60,
        width: 280,
        alignItems: "center",
        marginTop: 16,
        marginBottom: 30,
    },

    textStyle: {
        color: "white",
        alignSelf: "center",
        fontSize: 20,
        fontWeight: "bold",
        width: "auto", //325
        alignContent:'flex-start',
        marginBottom: 32,
        marginRight: 70,
        height: 550,
    },

    titleText: {
        color: "white",
        fontSize: 30,
        marginTop: 3,
        fontWeight: "bold",
        width: "80%",
        marginBottom: 16,
    },

    linkButton: {
        backgroundColor: "#a9a9a9",
        flexDirection: "row",
        width: 70,
        height: 30,
        borderRadius: 7,
        justifyContent: "center",
    },

    linkText: {
        color: "white",
        fontSize: 14,
        marginTop: 5,
        justifyContent: "center",
    },
    
    closeButton:{
        backgroundColor: "#006400",
        flexDirection: "row",
        width: 100,
        height: 45,
        borderRadius: 7,
        justifyContent: "center",
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

export default HelpAndSupportScreen;
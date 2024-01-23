import React, { useEffect, useState, useContext } from "react";
import {
  Text,
  View,
  Modal,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Switch,
} from "react-native";
import BackgroundGradient from "../BackgroundGradient";
import ThemeContext from "../../context/ThemeContext";

const BackupAndRestoreScreen = ({
    isVisible,
    userSettings,
    updateUserSettings,
    closeModal,
}: any) => {
    const [confirmationModalVisible, setBackupAndRestoreModalVisible] = useState<boolean>(false);
    const { setTheme } = useContext(ThemeContext);

    const handleClose = async () => {
        closeModal();
      };

    const handleRestore = async () => {
        const newSettings = {
            emailNotification: true,
            pushNotification: true,
            backgroundTheme: true,
          };

        await updateUserSettings(newSettings);
        setTheme(newSettings.backgroundTheme ? "Dark" : "Light");

        closeConfirmationModal();
        closeModal();
    };
    const openConfirmation = () => {
        setBackupAndRestoreModalVisible(true);
    };

    const closeConfirmationModal = () => {
        setBackupAndRestoreModalVisible(false);
    };

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
                        <Text style={styles.titleText}>Backup & Restore</Text>
                    </View>
                    <View style={{flexDirection:'row', height:650}}>
                        <View>
                            <Text style={styles.textStyle}>Restore Settings to Default</Text>
                        </View>
                        <Pressable
                            onPress={openConfirmation}
                            style={styles.restoreButton}
                            >
                            <Text style={{alignSelf:'center', color:'white'}}>Restore</Text>
                        </Pressable>
                    </View>
                    <Pressable
                        onPress={handleClose}
                        style={styles.closeButton}
                        >
                        <Text style={styles.buttonText}>Close</Text>
                    </Pressable>
                </SafeAreaView>
                <Modal
                    animationType="slide"
                    visible={confirmationModalVisible}
                    onRequestClose={closeModal}
                    transparent={true}
                >
                    <View style={{justifyContent:'center', alignItems:'center',flex:1}}>
                        <View style ={styles.modalView}>
                            <View style={{marginBottom:10}}>
                                <Text style={{alignSelf:'center',textAlign:'center'}}>Are you sure you want to restore your settings to default?</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center'}}>
                                <View>
                                    <Pressable
                                        onPress={handleRestore}
                                        style={styles.yesButton}
                                        >
                                        <Text style={{alignSelf:'center', color:'white'}}>Yes</Text>
                                    </Pressable>
                                </View>
                                <View>
                                    <Pressable
                                        onPress={closeConfirmationModal}
                                        style={styles.noButton}
                                        >
                                        <Text style={{alignSelf:'center', color:'white'}}>No</Text>
                                    </Pressable>
                                </View>
                            </View>
                            

                        </View>
                        
                    </View>
                </Modal>
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
        width: 315,
        alignItems: "center",
        marginTop: 16,
        marginBottom: 30,
    },

    titleText: {
        color: "white",
        fontSize: 30,
        marginTop: 3,
        fontWeight: "bold",
        width: "80%",
        marginBottom: 16,
    },
    
    textStyle: {
        color: "white",
        alignSelf: "center",
        fontSize: 20,
        fontWeight: "bold",
        width: "auto", //325
        marginBottom: 32,
        marginRight: 30,
    },
    restoreButton: {
        backgroundColor: "#8b0000",
        flexDirection: "row",
        width: 70,
        height: 30,
        borderRadius: 7,
        justifyContent: "center",
      },
      restoreButtonText: {
        color: "white",
        marginTop: 10,
        marginLeft: "30%",
        fontSize: 14,
        width: 150,
        height: 50,
      },
      closeButton:{
        backgroundColor: "#006400",
        flexDirection: "row",
        width: 100,
        height: 45,
        borderRadius: 7,
        justifyContent: "center",
      },

      modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 2,
          height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
      yesButton:{
        backgroundColor: "#8b0000",
        flexDirection: "row",
        width: 70,
        height: 30,
        borderRadius: 7,
        justifyContent: "center",
        marginRight: 10,
      },
      noButton:{
        backgroundColor: "#a9a9a9",
        flexDirection: "row",
        width: 70,
        height: 30,
        borderRadius: 7,
        justifyContent: "center",
        marginLeft: 10,
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

export default BackupAndRestoreScreen;
import React, { useState, useContext } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Pressable } from 'react-native';
import AddressAutocomplete from './AddressAutocomplete';
import ThemeContext from '../../context/ThemeContext';

interface LocationPopupProps {
    visible: boolean;
    onClose: () => void; // Existing onClose callback
    onSave: (location: string) => void; // Existing onSave callback
    onModalClose: () => void; // New callback prop for when the modal is closed after saving
}

const LocationPopup: React.FC<LocationPopupProps> = ({ visible, onClose, onSave, onModalClose }) => {
    const [location, setLocation] = useState('');

    const handleSave = () => {
        onSave(location); // Assume this saves the location
        onClose(); // Closes the popup
        onModalClose(); // New callback to notify the parent component
        setLocation(''); // Reset location input
    };
    const { theme } = useContext(ThemeContext);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={[styles.modalText, { color: theme === "Dark" ? "#fff" : "#000" }]}>Please tell us where you're headed!</Text>
                    <AddressAutocomplete onAddressSelect={setLocation} />
                    <Pressable
                        style={styles.button}
                        onPress={handleSave}>
                        <Text style={[styles.buttonText,
                        { color: theme === "Dark" ? "#fff" : "#000" },
                        ]}>Save</Text>
                    </Pressable>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 16,
    },
    input: {
        height: 40,
        marginVertical: 12,
        borderWidth: 1,
        padding: 10,
        width: 200,
        borderRadius: 3,
        borderColor: 'gray',
    },
    button: {
        padding: 10,
        width: 100,
        backgroundColor: 'rgba(34, 170, 85, 1)',
        borderRadius: 7,
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 16,

    }
});

export default LocationPopup;

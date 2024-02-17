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
    const [error, setError] = useState(false);
    const { theme } = useContext(ThemeContext);


    const handleSave = () => {
        if (!location.trim()) { // Check if the location is empty or just whitespace
            setError(true); // Set error to true to show the error message
            return; // Prevent further execution
        }
        onSave(location); // Assume this saves the location
        onClose(); // Closes the popup
        onModalClose(); // New callback to notify the parent component
        setLocation(''); // Reset location input
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={[styles.modalText, { color: theme === "Dark" ? "#fff" : "#000" }]}>Please tell us where you're headed!</Text>
                    {error && (
                        <Text style={styles.errorText}>Location cannot be empty.</Text>
                    )}
                    <AddressAutocomplete onAddressSelect={(selectedLocation: any) => {
                        setLocation(selectedLocation.description);
                        setError(false);
                    }} />
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

    },
    errorText: {
        color: 'red', // Example error text color, adjust as needed
        marginBottom: 8, // Adjust spacing as needed
        // Add other styling for the error text here
    },
});

export default LocationPopup;

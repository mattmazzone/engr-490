import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Meeting} from '../../types/tripTypes'; 

const CustomCalendarEvent: React.FC<{ event: Meeting }> = ({ event }) => {
    return (
        <View style={styles.eventContainer}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventTime}>{`${event.start} - ${event.end}`}</Text>
            <Text style={styles.eventLocation}>{event.location}</Text>
        </View>
    );
};

export default CustomCalendarEvent;


const styles = StyleSheet.create({
    eventContainer: {
        padding: 10,
        margin: 5,
        backgroundColor: '#6185d0',
        borderRadius: 5,
    },
    eventTitle: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    eventTime: {
        fontSize: 10,
    },
    eventLocation: {
        fontSize: 10,
    },
});
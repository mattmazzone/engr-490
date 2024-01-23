import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Meeting} from '../../types/tripTypes'; 
import { CalendarTouchableOpacityProps, ICalendarEventBase } from 'react-native-big-calendar';

//const CustomCalendarEvent = <T extends ICalendarEventBase>(event: T, touchableOpacityProps: CalendarTouchableOpacityProps) => {
const CustomCalendarEvent = ({
    title,
    start,
    end,
    location,
    touchableOpacityProps,
    }: Meeting & { touchableOpacityProps: CalendarTouchableOpacityProps }) => {
    return (
        <TouchableOpacity {... touchableOpacityProps} style={styles.eventContainer}>
            <Text style={styles.eventTitle}>{title}</Text>
            <Text style={styles.eventTime}>{`${start} - ${end}`}</Text>
            <Text style={styles.eventLocation}>{location}</Text>
        </TouchableOpacity>
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
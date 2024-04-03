import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Meeting } from '../../types/tripTypes';

interface CalendarEventModalProps {
    event: Meeting | null;
    isVisible: boolean;
    onClose: () => void;
  }

const CalendarEventModal = ({ event, isVisible, onClose }: CalendarEventModalProps) => {

  const formatTime = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
        {event && (
            <>
              <Text style={styles.modalTitle}>{event.title}</Text>
              <Text style={styles.modalTime}>{`${formatTime(event.start)} - ${formatTime(event.end)}`}</Text>
              <Text style={styles.modalLocation}>{event.location}</Text>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 22,
  },
  modalContent: {
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
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTime: {
    fontSize: 14,
  },
  modalLocation: {
    fontSize: 14,
  },
});

export default CalendarEventModal;

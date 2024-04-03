import React, { useContext, useState } from 'react';
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ThemeContext from '../../context/ThemeContext';

interface SettingOptionProps {
  icon: JSX.Element;
  title: string;
  onPress: () => void;
  hasBorder?: boolean;
  isActive?: boolean;
  marginBottom?: number;
}

const SettingOption = ({ icon, title, onPress, hasBorder, isActive }: SettingOptionProps) => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverIn = () => setIsHovered(true);
  const handleHoverOut = () => setIsHovered(false);

  // Adjust style based on hover or active state
  const dynamicStyle = isHovered || isActive ? { backgroundColor: theme === 'Dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' } : {};

  // Additional props for web to support mouse hover
  const webHoverProps = Platform.OS === 'web' ? {
    onMouseEnter: handleHoverIn,
    onMouseLeave: handleHoverOut,
  } : {};


  return (
    <View>
      <Pressable style={[styles.settingOption,
      hasBorder && styles.settingOptionBorder,
        dynamicStyle // Use dynamic style based on hover or active state,

      ]}
        onPress={onPress}
        onPressIn={handleHoverIn} // Simulate hover for mobile
        onPressOut={handleHoverOut}
        {...webHoverProps} // Spread web-specific props if on web

      >
        <View style={styles.settingIconContainer}>{icon}</View>
        <Text style={[styles.settingTitle, { color: theme === 'Dark' ? 'lightgrey' : 'black' }]}>
          {title}
        </Text>
      </Pressable>
      {hasBorder && <View style={[styles.separator, { borderBottomColor: theme === 'Dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  settingIconContainer: {
    width: 50, // Adjust as needed
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20, // Gap between icon and text
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  settingOptionBorder: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  separator: {
    borderBottomWidth: 1,
    marginLeft: 70, // Adjust as needed

  },
});

export default SettingOption;

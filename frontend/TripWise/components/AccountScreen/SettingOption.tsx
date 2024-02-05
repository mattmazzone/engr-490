import React, { useContext } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ThemeContext from '../../context/ThemeContext';

interface SettingOptionProps {
  icon: JSX.Element;
  title: string;
  onPress: () => void;
  hasBorder?: boolean;
  isActive?: boolean;
}

const SettingOption = ({ icon, title, onPress, hasBorder, isActive }: SettingOptionProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View>
      <TouchableOpacity style={[styles.settingOption, hasBorder && styles.settingOptionBorder, 
      isActive && { backgroundColor: theme === 'Dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' } // Highlight active option
    ]} onPress={onPress}>
        <View style={styles.settingIconContainer}>{icon}</View>
        <Text style={[styles.settingTitle, { color: theme === 'Dark' ? 'white' : 'black' }]}>
          {title}
        </Text>
        <Svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          style={styles.arrowStyle}>
          <Path
            d="M9 18l6-6-6-6"
            stroke={theme === 'Dark' ? 'white' : 'black'}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
      {hasBorder && <View style={[styles.separator, {borderBottomColor: theme === 'Dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}]}/>}
    </View>
  );
};

const styles = StyleSheet.create({
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 10,
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 50, // Adjust as needed
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20, // Gap between icon and text
  },
  settingTitle: {
    fontSize: 16,
    fontWeight:'500',
    flex: 1,
  },
  arrowStyle: {
    // Adjust the margin as needed
    marginLeft: 'auto',
  },
  settingOptionBorder: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  separator: {
    borderBottomWidth: 1,
    
  },
});

export default SettingOption;

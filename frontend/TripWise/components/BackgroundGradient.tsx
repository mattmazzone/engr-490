import * as React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from 'react-native/Libraries/NewAppScreen';

type ContainerProps = {
    children: React.ReactNode;
};

const BackgroundGradient: React.FC<ContainerProps> = ({children}) => {
    const isDarkMode = useColorScheme() === 'dark';
    const DarkTheme = ['#082B14', '#2BCD61'];
    const LightTheme = ['#1F9346', '#B4C8B1'];


    return (<LinearGradient 
        colors={isDarkMode ? DarkTheme : LightTheme}
    style={styles.gradient}>
            {children}
  
    </LinearGradient>
    );
};


const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,

    },
});

export default BackgroundGradient

import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView, Platform, Dimensions, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "./FirebaseConfig";
import Login from "./app/screens/Login";
import SignUp from "./app/screens/SignUp";
import SelectLogin from "./app/screens/SelectLogin";
import Home from "./app/screens/Home";
import Account from "./app/screens/Account";
import Trip from "./app/screens/Trip";
import SelectInterests from "./app/screens/SelectInterests";
import AccountLogo from "./components/SVGLogos/AccountLogo";
import HomeLogo from "./components/SVGLogos/HomeLogo";
import TripLogo from "./components/SVGLogos/TripLogo";
import ThemeProvider from "./context/ThemeProvider";
import ThemeContext from "./context/ThemeContext";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Declare your stacks
const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
function BottomTabNavigation() {
  const { theme } = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Home") {
            return <HomeLogo focused={focused} />;
          } else if (route.name === "Trip") {
            return <TripLogo focused={focused} />;
          } else if (route.name === "Account") {
            return <AccountLogo focused={focused} />;
          }
        },
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          borderTopColor: theme === "Dark" ? "rgba(80, 80, 80, 1)" : "white", // Top border color
          borderTopWidth: 2, // Top border width
          borderStyle: "solid", // Add solid border style
          backgroundColor:
            theme === "Dark"
              ? "rgba(80, 80, 80, 0.9)"
              : "rgba(255,255,255, 0.9)", // Only the background is semi-transparent
          height: 100, // Set the height of the tab bar
        },
        tabBarActiveTintColor: theme === "Dark" ? "white" : "black",
        tabBarInactiveTintColor: "grey",
        tabBarLabelPosition: "beside-icon",
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      })}
    >
      {/*Change back to Home when done*/}
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Trip" component={Trip} />
      {/* Dont display in nav */}

      <Tab.Screen name="Account" component={Account} />
      {/* <Tab.Screen name="SelectInterests" component={SelectInterests} /> */}
    </Tab.Navigator>
  );
}

// Main stack navigator when logged in
function LoggedInStack() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="BottomTabNavigation"
        component={BottomTabNavigation}
        options={{ headerShown: false }}
      />
      <MainStack.Screen name="SelectInterests" component={SelectInterests} />
      {/* Add more screens that should be part of the main stack here */}
    </MainStack.Navigator>
  );
}

// Root navigator to switch between authentication and main app
function RootNavigator({ user }: any) {
  return (
    <RootStack.Navigator>
      {user ? (
        <>
          <RootStack.Group>
            <RootStack.Screen
              name="LoggedInStack"
              component={LoggedInStack}
              options={{ headerShown: false }}
            />
          </RootStack.Group>
        </>
      ) : (
        <>
          <RootStack.Screen
            name="SelectLogin"
            component={SelectLogin}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="SignUp"
            component={SignUp}
            options={{ headerShown: false }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      GoogleSignin.configure({
        iosClientId:
          "425734765321-poj5etgv9nffmi4n42mj6b1sroajrq4c.apps.googleusercontent.com",
        webClientId:
          "425734765321-lj7r5lgpisv442e293g7kf8vm27m5p0d.apps.googleusercontent.com",
        scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      });
    }

    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user: any) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      {/*This removes the white top bar on Android */}
      <StatusBar backgroundColor="transparent" translucent={true} />
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigator user={user} />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

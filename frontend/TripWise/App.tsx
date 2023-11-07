import React, { useEffect, useState } from "react";
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

// Declare your stacks
const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
function BottomTabNavigation() {
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
          borderTopColor: "white", // Top border color
          borderTopWidth: 2, // Top border width
          borderStyle: "solid", // Add solid border style
          backgroundColor: "rgba(255, 255, 255, 0.2)", // Only the background is semi-transparent
          height: 60, // Set the height of the tab bar
        },
        tabBarActiveTintColor: "grey",
        tabBarInactiveTintColor: "white",
        tabBarLabelPosition: "beside-icon",
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Trip" component={Trip} />
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
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user: any) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <RootNavigator user={user} />
    </NavigationContainer>
  );
}

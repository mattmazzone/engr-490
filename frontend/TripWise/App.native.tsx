import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView, Platform, Dimensions, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { onAuthStateChanged, User } from "firebase/auth";
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
import * as UserService from "./services/userServices";
import { RootStackParamList } from "./types/navigationTypes";
import { MainStackParamList } from "./types/navigationTypes";
import { BottomTabParamList } from "./types/navigationTypes";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Declare your stacks
const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

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
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Trip" component={Trip} />
      <Tab.Screen name="Account" component={Account} />
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
    </MainStack.Navigator>
  );
}

// Root navigator to switch between authentication and main app
function RootNavigator({
  user,
  onUserCreationComplete,
  isUserCreated,
  userHasInterests,
  setUserInterests,
}: {
  user: User | null;
  onUserCreationComplete: () => void;
  isUserCreated: boolean;
  userHasInterests: boolean;
  setUserInterests: (hasInterests: boolean) => void;
}) {
  return (
    <RootStack.Navigator>
      {user && isUserCreated ? (
        userHasInterests ? (
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
          <RootStack.Screen
            name="SelectInterests"
            component={SelectInterests}
            options={{ headerShown: false }}
            initialParams={{ setUserInterests }}
          />
        )
      ) : (
        <>
          <RootStack.Screen
            name="SelectLogin"
            component={SelectLogin}
            options={{ headerShown: false }}
            initialParams={{ onUserCreationComplete }}
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
            initialParams={{ onUserCreationComplete }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [userHasInterests, setUserHasInterests] = useState(false);

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

    const unsubscribe = onAuthStateChanged(
      FIREBASE_AUTH,
      async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          try {
            const profile = await UserService.fetchUserProfile();
            const hasInterests: boolean | null =
              profile &&
              Array.isArray(profile.interests) &&
              profile.interests.length > 0;
            setUserHasInterests(hasInterests !== null ? hasInterests : false);
            setIsUserCreated(true);
          } catch (error) {
            setUserHasInterests(false);
            setIsUserCreated(false);
          }
        } else {
          // Reset state if no user is signed in
          setUser(null);
          setIsUserCreated(false);
          setUserHasInterests(false);
        }
      }
    );

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const onUserCreationComplete = () => {
    setIsUserCreated(true);
  };

  const setUserInterests = (hasInterests: boolean) => {
    setUserHasInterests(hasInterests);
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="transparent" translucent={true} />
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigator
            user={user}
            onUserCreationComplete={onUserCreationComplete}
            isUserCreated={isUserCreated}
            userHasInterests={userHasInterests}
            setUserInterests={setUserInterests}
          />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

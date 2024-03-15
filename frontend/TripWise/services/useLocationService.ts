// useLocationService.js

import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import * as RNLocalize from 'react-native-localize';

interface Location {
  lat: number | null;
  lng: number | null;
  timezone: string | null;
}
const useLocationService = (): [Location, string | null] => {
    const [location, setLocation] = useState<Location>({ lat: null, lng: null, timezone: null });
    const [error, setError] = useState<string | null>(null);

    const requestLocationPermission = async (): Promise<boolean> => {
        const PermissionsAndroid = require('react-native').PermissionsAndroid;
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "This app needs access to your location.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err: any) {
                setError(err.message);
                return false;
            }
        }
        return true; // Assume always granted on iOS and web
    };

  useEffect(() => {
    const getLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        Geolocation.getCurrentPosition(
          (position: any) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timezone: RNLocalize.getTimeZone(),
            });
          },
          (err: any) => setError(err.message),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature.",
          [{ text: "OK" }]
        );
      }
    };

    getLocation();
  }, []);

  return [location, error];
};

export default useLocationService;

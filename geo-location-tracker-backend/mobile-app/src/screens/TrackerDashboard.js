
import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, Linking } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import * as Location from "expo-location";
import axios from "axios";

const { API_URL } = require("../../creds");

const TrackerDashboard = ({ route, navigation }) => {
  const { vehicleId, username, vehicleType } = route.params || {};

  const [location, setLocation] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vehicleId) {
      Alert.alert(
        "Error",
        "Vehicle ID is missing. Please register or login again."
      );
      return;
    }

    let trackingInterval;

    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for tracking."
        );
        return;
      }

      try {
        const firstLocation =
          await Location.getCurrentPositionAsync({});

        setLocation(firstLocation.coords);
        console.log(firstLocation.coords);
        setLoading(false);

        console.log(
          "Initial GPS:",
          firstLocation.coords.latitude,
          firstLocation.coords.longitude
        );

        trackingInterval = setInterval(async () => {
          try {
            const { coords } =
              await Location.getCurrentPositionAsync({});

            setLocation(coords);

            console.log(
              "GPS:",
              coords.latitude,
              coords.longitude
            );

            await axios.post(
              `${API_URL}/api/locations/new_location_add`,
              {
                vehicleId,
                latitude: coords.latitude,
                longitude: coords.longitude,
                timestamp: new Date().toISOString(),
              }
            );

            console.log("Location sent to backend");
          } catch (err) {
            console.error(
              "Error sending location:",
              err
            );
          }
        }, 10000);

        setIntervalId(trackingInterval);
      } catch (err) {
        console.error("Location error:", err);
      }
    })();

    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [vehicleId]);

  const handleLogout = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.vehicleType}>
        User Dashboard
      </Text>

      <Card mode="outlined" style={styles.card}>
        <Card.Title title={`User Name: ${username}`} />
        <Card.Title title={`Vehicle ID: ${vehicleId}`} />
        <Card.Title title={`Vehicle Type: ${vehicleType}`} />

        <Card.Content>
          {loading && (
            <ActivityIndicator
              size="small"
              style={styles.loader}
            />
          )}

          <Text style={styles.locationText}>
            {location
              ? `Lat: ${location.latitude}, Lng: ${location.longitude}`
              : "Waiting for GPS..."}
          </Text>

          {location && (
           <MapView
  style={{ width: "100%", height: 300 }}
  mapType="satellite"
  region={{
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
>
  <Marker
    coordinate={{
      latitude: location.latitude,
      longitude: location.longitude,
    }}
    title="Test"
  />
</MapView>
          )}
        </Card.Content>

        <Card.Actions>
          <Button
  mode="contained"
  onPress={() =>
    navigation.navigate("CitizenTracker", {
      vehicleId,
    })
  }
>
  View Tracker
</Button>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  card: {
    width: "90%",
    padding: 10,
    marginTop: 20,
  },
  vehicleType: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  locationText: {
    marginBottom: 10,
    fontSize: 14,
  },
  map: {
    width: "100%",
    height: 300,
    marginTop: 10,
  },
  loader: {
    marginBottom: 10,
  },
  logoutButton: {
    width: "100%",
    marginTop: 15,
  },
});

export default TrackerDashboard;


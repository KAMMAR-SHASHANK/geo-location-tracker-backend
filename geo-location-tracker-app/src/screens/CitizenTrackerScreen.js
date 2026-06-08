import React, { useEffect, useState } from "react";
import { View, StyleSheet,Text, Button, Linking } from "react-native";
import {  Card, ActivityIndicator } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const { API_URL } = require("../../creds");

export default function CitizenTrackerScreen() {
  const [vanLocation, setVanLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const currentUser =
        await Location.getCurrentPositionAsync({});

      setUserLocation(currentUser.coords);

      const response = await axios.get(
        `${API_URL}/api/locations/latest/124`
      );

      setVanLocation(response.data);

      calculateDistance(
        currentUser.coords.latitude,
        currentUser.coords.longitude,
        response.data.latitude,
        response.data.longitude
      );
    } catch (err) {
      console.log(err);
    }
  };

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c =
      2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    const distanceKm = R * c;

    setDistance(distanceKm.toFixed(2));
  };

  const estimateEta = () => {
    if (!distance) return "--";

    const averageSpeed = 20;

    const hours = distance / averageSpeed;

    return Math.round(hours * 60);
  };

  if (!vanLocation || !userLocation) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>🗑 Garbage Van #124</Text>

          <Text>Distance: {distance} km</Text>
          <Text>ETA: {estimateEta()} mins</Text>

          <Text style={styles.locationText}>
            Van Location:
          </Text>

          <Text>
            {vanLocation.latitude},
            {vanLocation.longitude}
          </Text>

          <View style={{ marginTop: 20 }}>
            <Button
              title="View Van on Google Maps"
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps?q=${vanLocation.latitude},${vanLocation.longitude}`
                )
              }
            />
          </View>

          <View style={{ marginTop: 15 }}>
            <Button
              title="Navigate to Van"
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&destination=${vanLocation.latitude},${vanLocation.longitude}`
                )
              }
            />
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  card: {
    margin: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  locationText: {
    marginTop: 15,
    fontWeight: "bold",
  },
});

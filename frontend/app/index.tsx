import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import Dropdown from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";

type LocationData = {
  latitude: number | null;
  longitude: number | null;
};

export default function Home() {
  const router = useRouter();
  const [soil, setSoil] = useState("");
  const [season, setSeason] = useState("");
  const [language, setLanguage] = useState("");
  const [location, setLocation] = useState<LocationData>({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        setLocationError("Error getting location");
        console.error(error);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!location.latitude || !location.longitude) {
      Alert.alert("Location Required", "Please enable location services to continue");
      return;
    }

    router.push({
      pathname: "/advisory",
      params: {
        soil,
        season,
        language,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Smart Kisan Salah</Text>
      <Dropdown label="Soil Type" options={["Loamy", "Sandy", "Clay"]} value={soil} onChange={setSoil} />
      <Dropdown label="Season" options={["Kharif", "Rabi"]} value={season} onChange={setSeason} />
      <Dropdown label="Language" options={["Hindi (hi)", "Telugu (te)", "Tamil (ta)"]} value={language} onChange={setLanguage} />
      <PrimaryButton title="Get Advisory" onPress={handleSubmit} />
      {locationError ? (
        <Text style={styles.errorText}>{locationError}</Text>
      ) : location.latitude ? (
        <Text style={styles.successText}>📍 Location acquired</Text>
      ) : (
        <Text>Getting location...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  errorText: { color: "red", textAlign: "center", marginTop: 10 },
  successText: { color: "green", textAlign: "center", marginTop: 10 },
});

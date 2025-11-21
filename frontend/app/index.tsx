import React, { useState, useEffect } from "react";
import { View, TextInput, Text, Alert, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import Dropdown from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";
import { sendAdvisoryRequest } from "../services/api";

export default function Home() {
  const router = useRouter();
  const [soil, setSoil] = useState("");
  const [waterAvailability, setWaterAvailability] = useState("");
  const [season, setSeason] = useState("");
  const [landSize, setLandSize] = useState("");
  const [language, setLanguage] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required for advisory.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  async function handleSubmit() {
    if (!soil || !season || !language || !waterAvailability || !landSize) {
      Alert.alert("Please fill all required fields");
      return;
    }

    const payload = {
      soil,
      waterAvailability,
      season,
      landSize,
      language,
      location,
    };

    console.log("Final payload:", JSON.stringify(payload, null, 2));

    try {
      const result = await sendAdvisoryRequest(payload);
      router.push({
        pathname: "/advisory",
        params: { advice: result.message || JSON.stringify(result), language },
      });
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to fetch advisory");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Smart Kisan Salah</Text>
      <Dropdown label="Soil Type" options={["Loamy", "Sandy", "Clay"]} value={soil} onChange={setSoil} />
      <Dropdown label="Water Availability" options={["High", "Medium", "Low"]} value={waterAvailability} onChange={setWaterAvailability} />
      <Dropdown label="Season" options={["Kharif", "Rabi"]} value={season} onChange={setSeason} />
      <TextInput
        style={styles.input}
        placeholder="Land Size (in acres)"
        value={landSize}
        onChangeText={setLandSize}
        keyboardType="numeric"
      />
      <Dropdown label="Language" options={["Hindi (hi)", "Telugu (te)", "Tamil (ta)"]} value={language} onChange={setLanguage} />
      <PrimaryButton title="Get Advisory" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
});

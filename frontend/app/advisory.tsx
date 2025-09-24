import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import * as Speech from "expo-speech";
import { getCropAdvice } from "../services/api";
import PrimaryButton from "../components/PrimaryButton";

type SearchParams = {
  soil: string;
  season: string;
  language: string;
  latitude: string;
  longitude: string;
};

export default function Advisory() {
  const params = useLocalSearchParams<SearchParams>();
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAdvice() {
      if (!params.soil || !params.season || !params.language || !params.latitude || !params.longitude) {
        setError("Missing required parameters");
        setLoading(false);
        return;
      }

      try {
        const res = await getCropAdvice(
          params.soil,
          params.season,
          params.language,
          parseFloat(params.latitude),    // Convert string to number
          parseFloat(params.longitude)    // Convert string to number
        );

        if (isMounted) {
          setAdvice(res.message);
          // Handle speech with error catching
          try {
            await Speech.speak(res.message, {
              language: params.language,
              rate: 0.8,
              pitch: 1.0
            });
          } catch (speechError) {
            console.error("Speech error:", speechError);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Error fetching advisory. Please try again.");
          console.error("API error:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAdvice();

    // Cleanup function
    return () => {
      isMounted = false;
      Speech.stop();
    };
  }, [params.soil, params.season, params.language, params.latitude, params.longitude]);

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Crop Advisory",
          headerShown: true
        }} 
      />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#008000" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <Text style={styles.text}>{advice}</Text>
            <PrimaryButton 
              title="Back" 
              onPress={() => {
                Speech.stop();
                router.back();
              }} 
            />
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff"
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 28
  },
  loader: {
    flex: 1
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center"
  }
});

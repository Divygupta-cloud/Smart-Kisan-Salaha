import { BASE_URL } from "../constants/api";
import { StyleSheet } from 'react-native';

interface ApiResponse {
  message: string;
}

export async function getCropAdvice(
  soil: string,
  waterAvailability: string,
  season: string,
  landSize: string,
  language: string,
  latitude: number,
  longitude: number
): Promise<ApiResponse> {
  try {
    const response = await fetch('http://localhost:5678/webhook/crop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        soil,
        waterAvailability,
        season,
        landSize,
        language,
        location: {
          latitude,
          longitude
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  successText: {
    color: 'green',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  }
});

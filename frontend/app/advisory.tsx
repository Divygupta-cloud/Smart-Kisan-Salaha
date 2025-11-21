import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useAudioPlayer } from 'expo-audio';
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import PrimaryButton from "../components/PrimaryButton";

type Params = { advice?: string; language?: string };

function mapLangCode(lang?: string) {
  if (!lang) return "hi";
  const langLower = lang.toLowerCase();
  if (langLower.includes("hindi") || langLower.startsWith("hi")) return "hi";
  if (langLower.includes("telugu") || langLower.startsWith("te")) return "te";
  if (langLower.includes("tamil") || langLower.startsWith("ta")) return "ta";
  return "hi";
}

export default function Advisory() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const rawText = typeof params.advice === "string" && params.advice.length 
    ? params.advice 
    : "No advisory received";
  
  const cleanText = rawText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const languageCode = mapLangCode(params.language);

  const labelsMap: Record<string, { play: string; pause: string; home: string }> = {
    hi: { play: "🔊 फिर से सुनें", pause: "⏸️ बंद करें", home: "🏠 होम पर वापस" },
    te: { play: "🔊 మళ్లీ వినండి", pause: "⏸️ ఆపండి", home: "🏠 హోమ్‌కు వెళ్ళండి" },
    ta: { play: "🔊 மீண்டும் கேட்கவும்", pause: "⏸️ நிறுத்து", home: "🏠 முகப்பு திரும்பு" },
  };
  const labels = labelsMap[languageCode] || labelsMap.hi;
  
  // Create audio player
  const player = useAudioPlayer(audioUrl);

  useEffect(() => {
    if (cleanText && cleanText !== "No advisory received") {
      setTimeout(() => playAudio(), 500);
    }

    return () => {
      player.remove();
    };
  }, []);

  const playAudio = async () => {
    try {
      setIsLoading(true);
      
      // Split text into chunks if too long (Google TTS has character limit)
      const maxLength = 200;
      const textToSpeak = cleanText.length > maxLength 
        ? cleanText.substring(0, maxLength) 
        : cleanText;

      const encodedText = encodeURIComponent(textToSpeak);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${languageCode}&client=tw-ob&q=${encodedText}`;

      console.log("Playing audio from:", url);
      setAudioUrl(url);
      
      await player.replace(url);
      player.play();
      setIsLoading(false);
    } catch (err) {
      console.error("Audio error:", err);
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    player.pause();
    player.seekTo(0);
  };

  const handleBackToHome = () => {
    stopAudio();
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ title: "सलाह" }} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.text}>{cleanText}</Text>
        </ScrollView>

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>लोड हो रहा है...</Text>
            </View>
          ) : (
            <>
              <PrimaryButton
                title={player.playing ? labels.pause : labels.play}
                onPress={player.playing ? stopAudio : playAudio}
              />
              <View style={styles.spacer} />
            </>
          )}
          <PrimaryButton title={labels.home} onPress={handleBackToHome} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  text: {
    fontSize: 18, lineHeight: 32, color: '#333',
    backgroundColor: '#fff', padding: 20, borderRadius: 10,
  },
  buttonContainer: {
    padding: 20, paddingBottom: 30, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
  },
  spacer: { height: 10 },
  loadingContainer: { alignItems: 'center', paddingVertical: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
});
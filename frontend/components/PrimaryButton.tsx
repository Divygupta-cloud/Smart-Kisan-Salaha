import React from "react";
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from "react-native";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

export default function PrimaryButton({ title, onPress, ...props }: PrimaryButtonProps) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} {...props}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: "green", padding: 15, borderRadius: 10, marginVertical: 15 },
  text: { color: "white", fontSize: 18, textAlign: "center" },
});
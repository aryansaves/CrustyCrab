import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface EntryCardProps {
  entry: {
    _id: string;
    title: string;
    ratingOverall?: number;
    remarks?: string;
    dateLogged: string;
  };
}

export default function EntryCard({ entry }: EntryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{entry.title}</Text>

      <Text style={styles.rating}>Rating: {entry.ratingOverall}/7</Text>

      {!!entry.remarks && (
        <Text style={styles.remarks}>{entry.remarks}</Text>
      )}

      <Text style={styles.date}>
        {new Date(entry.dateLogged).toLocaleDateString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  rating: {
    color: "#cccccc",
    marginTop: 4,
  },
  remarks: {
    color: "#aaaaaa",
    marginTop: 4,
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    color: "#888888",
  },
});

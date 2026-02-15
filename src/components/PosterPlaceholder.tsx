import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { TMDB_IMAGE_BASE } from "../config/tmdb";

interface PosterPlaceholderProps {
    title?: string;
    posterPath?: string;
    size?: number;
}

export default function PosterPlaceholder({ title, posterPath, size = 80 }: PosterPlaceholderProps) {
    const height = size * 1.5; // 2:3 aspect ratio

    return (
        <View style={styles.container}>
            {posterPath ? (
                <Image
                    source={{ uri: `${TMDB_IMAGE_BASE}${posterPath}` }}
                    style={[styles.poster, { width: size, height }]}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.poster, styles.noPoster, { width: size, height }]} />
            )}
            {title !== undefined && (
                <Text style={[styles.title, { maxWidth: size }]} numberOfLines={1}>
                    {title || " "}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    poster: {
        borderRadius: 4,
    },
    noPoster: {
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
    },
    title: {
        color: "#ffffff",
        fontSize: 11,
        marginTop: 6,
        textAlign: "center",
    },
});

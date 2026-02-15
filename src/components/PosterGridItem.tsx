import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";
import { TMDB_IMAGE_BASE } from "../config/tmdb";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - 32 - ITEM_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface PosterGridItemProps {
    title: string;
    posterPath?: string;
    onPress: () => void;
}

export default function PosterGridItem({ title, posterPath, onPress }: PosterGridItemProps) {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            {posterPath ? (
                <Image
                    source={{ uri: `${TMDB_IMAGE_BASE}${posterPath}` }}
                    style={styles.poster}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.poster, styles.noPoster]} />
            )}
            <Text style={styles.title} numberOfLines={2}>
                {title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: ITEM_WIDTH,
        marginBottom: 16,
    },
    poster: {
        width: "100%",
        aspectRatio: 2 / 3,
        borderRadius: 4,
    },
    noPoster: {
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
    },
    title: {
        color: "#ffffff",
        fontSize: 12,
        marginTop: 8,
        textAlign: "center",
    },
});

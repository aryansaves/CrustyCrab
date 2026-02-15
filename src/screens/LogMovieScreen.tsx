import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TMDB_IMAGE_BASE } from "../config/tmdb";
import { createEntry } from "../api/entries";
import type { AppStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "LogMovie">;

export default function LogMovieScreen({ route, navigation }: Props) {
    const { movieId, title, posterPath } = route.params;
    const [rating, setRating] = useState<number>(0);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert("Rating Required", "Please select a rating (1-7)");
            return;
        }

        setLoading(true);
        try {
            await createEntry({
                type: "movie",
                title,
                tmdbId: movieId,
                posterPath,
                ratingOverall: rating,
                remarks: remarks.trim() || undefined,
            });
            Alert.alert("Success", `"${title}" has been logged!`, [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Failed to log movie";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Poster */}
                <View style={styles.posterContainer}>
                    {posterPath ? (
                        <Image
                            source={{ uri: `${TMDB_IMAGE_BASE}${posterPath}` }}
                            style={styles.poster}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.poster, styles.noPoster]}>
                            <Text style={styles.noPosterText}>No Image</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.title}>{title}</Text>

                {/* Rating */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Rating</Text>
                    <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={[
                                    styles.ratingButton,
                                    rating === num && styles.ratingButtonActive,
                                ]}
                                onPress={() => setRating(num)}
                            >
                                <Text
                                    style={[
                                        styles.ratingButtonText,
                                        rating === num && styles.ratingButtonTextActive,
                                    ]}
                                >
                                    {num}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Remarks */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Review (Optional)</Text>
                    <TextInput
                        style={styles.remarksInput}
                        placeholder="Write your thoughts..."
                        placeholderTextColor="#666666"
                        value={remarks}
                        onChangeText={setRemarks}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#121212" />
                    ) : (
                        <Text style={styles.submitButtonText}>Log Movie</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    posterContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    poster: {
        width: 120,
        aspectRatio: 2 / 3,
        borderRadius: 8,
    },
    noPoster: {
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
        justifyContent: "center",
        alignItems: "center",
    },
    noPosterText: {
        color: "#666666",
        fontSize: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        color: "#888888",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    ratingButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
        justifyContent: "center",
        alignItems: "center",
    },
    ratingButtonActive: {
        backgroundColor: "#ffffff",
        borderColor: "#ffffff",
    },
    ratingButtonText: {
        color: "#888888",
        fontSize: 16,
        fontWeight: "600",
    },
    ratingButtonTextActive: {
        color: "#121212",
    },
    remarksInput: {
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
        borderRadius: 8,
        padding: 12,
        color: "#ffffff",
        fontSize: 15,
        minHeight: 100,
    },
    submitButton: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: "#121212",
        fontSize: 16,
        fontWeight: "700",
    },
});

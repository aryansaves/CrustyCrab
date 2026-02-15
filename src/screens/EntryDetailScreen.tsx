import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "EntryDetail">;

export default function EntryDetailScreen({ route }: Props) {
    const { entry } = route.params;

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Large poster placeholder */}
                <View style={styles.posterContainer}>
                    <View style={styles.poster} />
                </View>

                {/* Entry details */}
                <View style={styles.details}>
                    <Text style={styles.title}>{entry.title}</Text>

                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingLabel}>Rating</Text>
                        <Text style={styles.rating}>{entry.ratingOverall ?? "—"}/7</Text>
                    </View>

                    {!!entry.remarks && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Remarks</Text>
                            <Text style={styles.remarks}>{entry.remarks}</Text>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Logged</Text>
                        <Text style={styles.date}>
                            {new Date(entry.dateLogged).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </Text>
                    </View>
                </View>
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
    },
    posterContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    poster: {
        width: 200,
        height: 300,
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
        borderRadius: 8,
    },
    details: {
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
    },
    ratingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    ratingLabel: {
        fontSize: 14,
        color: "#888888",
    },
    rating: {
        fontSize: 20,
        fontWeight: "600",
        color: "#ffffff",
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 12,
        color: "#888888",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
    },
    remarks: {
        fontSize: 16,
        color: "#cccccc",
        lineHeight: 24,
    },
    date: {
        fontSize: 16,
        color: "#cccccc",
    },
});

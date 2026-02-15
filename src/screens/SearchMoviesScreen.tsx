import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    Image,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { tmdbApi } from "../api/tmdbClient";
import { TMDB_IMAGE_BASE } from "../config/tmdb";
import type { AppStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "MainTabs">;

interface TMDBMovie {
    id: number;
    title: string;
    poster_path: string | null;
    release_date?: string;
    overview?: string;
    vote_average?: number;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - 32 - ITEM_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function SearchMoviesScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<TMDBMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                setLoading(true);
                setError("");
                setHasSearched(true);
                const res = await tmdbApi.get("/search/movie", {
                    params: { query: query.trim() },
                });
                setResults(res.data.results || []);
            } catch (e: any) {
                setError("Failed to search movies");
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleMoviePress = useCallback((movie: TMDBMovie) => {
        navigation.navigate("MovieDetail", { movieId: movie.id });
    }, [navigation]);

    const renderMovie = ({ item }: { item: TMDBMovie }) => (
        <Pressable style={styles.movieItem} onPress={() => handleMoviePress(item)}>
            {item.poster_path ? (
                <Image
                    source={{ uri: `${TMDB_IMAGE_BASE}${item.poster_path}` }}
                    style={styles.poster}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.poster, styles.noPoster]}>
                    <Text style={styles.noPosterText}>No Image</Text>
                </View>
            )}
            <Text style={styles.movieTitle} numberOfLines={2}>
                {item.title}
            </Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <Text style={styles.header}>Search</Text>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search movies..."
                        placeholderTextColor="#888888"
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => setQuery("")}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.clearButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading && (
                <View style={styles.centered}>
                    <ActivityIndicator color="#ffffff" size="large" />
                </View>
            )}

            {error ? (
                <View style={styles.centered}>
                    <Text style={styles.error}>{error}</Text>
                </View>
            ) : !loading && hasSearched && results.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>No results found</Text>
                </View>
            ) : !loading && results.length > 0 ? (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={NUM_COLUMNS}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.content}
                    renderItem={renderMovie}
                    showsVerticalScrollIndicator={false}
                />
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    header: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        padding: 12,
        color: "#ffffff",
        fontSize: 16,
    },
    clearButton: {
        padding: 12,
    },
    clearButtonText: {
        color: "#888888",
        fontSize: 16,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    columnWrapper: {
        justifyContent: "space-between",
    },
    movieItem: {
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
        justifyContent: "center",
        alignItems: "center",
    },
    noPosterText: {
        color: "#666666",
        fontSize: 10,
    },
    movieTitle: {
        color: "#ffffff",
        fontSize: 11,
        marginTop: 6,
        textAlign: "center",
    },
    error: {
        color: "#ff6b6b",
        fontSize: 14,
    },
    emptyText: {
        color: "#888888",
        fontSize: 14,
    },
});

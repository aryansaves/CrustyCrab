import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Image,
    Pressable,
    Dimensions,
    RefreshControl,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getWatchlist, removeFromWatchlist, WatchlistItem } from "../api/watchlist";
import { TMDB_IMAGE_BASE } from "../config/tmdb";
import type { AppStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "MainTabs">;

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - 32 - ITEM_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function WatchlistScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");
            const res = await getWatchlist(1, 50);
            setItems(res.data || []);
        } catch (e: any) {
            setError("Failed to load watchlist");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Reload when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        load();
    }, [load]);

    const handleItemPress = (item: WatchlistItem) => {
        navigation.navigate("MovieDetail", { movieId: item.tmdbId });
    };

    const handleLongPress = (item: WatchlistItem) => {
        Alert.alert(
            "Remove from Watchlist",
            `Remove "${item.title}" from your watchlist?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeFromWatchlist(item.tmdbId);
                            setItems((prev) => prev.filter((i) => i.tmdbId !== item.tmdbId));
                        } catch {
                            Alert.alert("Error", "Failed to remove from watchlist");
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: WatchlistItem }) => (
        <Pressable
            style={styles.movieItem}
            onPress={() => handleItemPress(item)}
            onLongPress={() => handleLongPress(item)}
        >
            {item.posterPath ? (
                <Image
                    source={{ uri: `${TMDB_IMAGE_BASE}${item.posterPath}` }}
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

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <Text style={styles.header}>Watchlist</Text>
                <View style={styles.centered}>
                    <ActivityIndicator color="#ffffff" size="large" />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <Text style={styles.header}>Watchlist</Text>
                <View style={styles.centered}>
                    <Text style={styles.error}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <Text style={styles.header}>Watchlist</Text>

            {items.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>Your watchlist is empty</Text>
                    <Text style={styles.emptySubtext}>
                        Search for movies and add them to your watchlist
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.tmdbId.toString()}
                    numColumns={NUM_COLUMNS}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.content}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#ffffff"
                        />
                    }
                />
            )}
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
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    columnWrapper: {
        justifyContent: "flex-start",
        gap: ITEM_MARGIN,
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
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptySubtext: {
        color: "#888888",
        fontSize: 14,
        textAlign: "center",
    },
});

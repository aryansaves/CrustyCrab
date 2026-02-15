import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    Modal,
    Pressable,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { tmdbApi } from "../api/tmdbClient";
import { TMDB_IMAGE_BASE } from "../config/tmdb";
import { getEntryByTmdbId } from "../api/entries";
import { addToWatchlist, checkInWatchlist } from "../api/watchlist";
import type { AppStackParamList, DiaryEntry } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "MovieDetail">;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const TMDB_IMAGE_PROFILE = "https://image.tmdb.org/t/p/w185";

interface MovieDetails {
    id: number;
    title: string;
    poster_path: string | null;
    overview: string;
    release_date: string;
    vote_average: number;
    runtime?: number;
    genres?: { id: number; name: string }[];
}

interface CastMember {
    id: number;
    name: string;
    character?: string;
    profile_path: string | null;
}

interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function MovieDetailScreen({ route }: Props) {
    const navigation = useNavigation<NavigationProp>();
    const { movieId } = route.params;
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [credits, setCredits] = useState<Credits | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userEntry, setUserEntry] = useState<DiaryEntry | null>(null);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                // Fetch movie details, credits, entry status, and watchlist status in parallel
                const [movieRes, creditsRes] = await Promise.all([
                    tmdbApi.get(`/movie/${movieId}`),
                    tmdbApi.get(`/movie/${movieId}/credits`),
                ]);
                setMovie(movieRes.data);
                setCredits(creditsRes.data);

                // Check if user has logged this movie by tmdbId
                try {
                    const entryRes = await getEntryByTmdbId(movieId);
                    if (entryRes.logged && entryRes.data) {
                        setUserEntry(entryRes.data);
                    }
                } catch {
                    // Ignore entry fetch errors
                }

                // Check if in watchlist
                try {
                    const isInWatchlist = await checkInWatchlist(movieId);
                    setInWatchlist(isInWatchlist);
                } catch {
                    // Ignore watchlist check errors
                }
            } catch (e: any) {
                setError("Failed to load movie details");
            } finally {
                setLoading(false);
            }
        })();
    }, [movieId]);

    const handleMyReview = () => {
        if (userEntry) {
            navigation.navigate("EntryDetail", { entry: userEntry });
        }
    };

    const handleAddToWatchlist = async () => {
        setMenuVisible(false);
        if (movie) {
            try {
                await addToWatchlist({
                    tmdbId: movie.id,
                    title: movie.title,
                    posterPath: movie.poster_path || undefined,
                    type: "movie"
                });
                setInWatchlist(true);
                Alert.alert(
                    "Added to Watchlist",
                    `"${movie.title}" has been added to your watchlist.`,
                    [{ text: "OK" }]
                );
            } catch (e: any) {
                const msg = e?.response?.data?.message || "Failed to add to watchlist";
                Alert.alert("Error", msg, [{ text: "OK" }]);
            }
        }
    };

    const handleLogMovie = () => {
        setMenuVisible(false);
        if (movie) {
            navigation.navigate("LogMovie", {
                movieId: movie.id,
                title: movie.title,
                posterPath: movie.poster_path || undefined
            });
        }
    };

    // Get key crew members
    const getDirectors = () => {
        if (!credits) return [];
        return credits.crew.filter((c) => c.job === "Director").slice(0, 2);
    };

    const getCinematographers = () => {
        if (!credits) return [];
        return credits.crew.filter((c) => c.job === "Director of Photography").slice(0, 1);
    };

    const getComposers = () => {
        if (!credits) return [];
        return credits.crew.filter((c) => c.job === "Original Music Composer" || c.job === "Music").slice(0, 1);
    };

    const getTopCast = () => {
        if (!credits) return [];
        return credits.cast.slice(0, 6);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <View style={styles.centered}>
                    <ActivityIndicator color="#ffffff" size="large" />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !movie) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <View style={styles.centered}>
                    <Text style={styles.error}>{error || "Movie not found"}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const year = movie.release_date ? movie.release_date.split("-")[0] : "";
    const directors = getDirectors();
    const cinematographers = getCinematographers();
    const composers = getComposers();
    const topCast = getTopCast();

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Poster */}
                <View style={styles.posterContainer}>
                    {movie.poster_path ? (
                        <Image
                            source={{ uri: `${TMDB_IMAGE_BASE}${movie.poster_path}` }}
                            style={styles.poster}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.poster, styles.noPoster]}>
                            <Text style={styles.noPosterText}>No Image</Text>
                        </View>
                    )}
                </View>

                {/* Title and Year */}
                <Text style={styles.title}>{movie.title}</Text>
                {year && <Text style={styles.year}>{year}</Text>}

                {/* My Review Bar (if logged) */}
                {userEntry && (
                    <TouchableOpacity style={styles.myReviewBar} onPress={handleMyReview}>
                        <Text style={styles.myReviewText}>My Review</Text>
                        <Text style={styles.myReviewArrow}>→</Text>
                    </TouchableOpacity>
                )}

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                    <View style={styles.genresRow}>
                        {movie.genres.map((genre) => (
                            <View key={genre.id} style={styles.genreTag}>
                                <Text style={styles.genreText}>{genre.name}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Overview */}
                {movie.overview && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <Text style={styles.overview}>{movie.overview}</Text>
                    </View>
                )}

                {/* Credits Section */}
                {directors.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Director{directors.length > 1 ? "s" : ""}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.creditsRow}>
                                {directors.map((person) => (
                                    <CreditItem key={person.id} person={person} role="Director" />
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {topCast.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cast</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.creditsRow}>
                                {topCast.map((person) => (
                                    <CreditItem
                                        key={person.id}
                                        person={person}
                                        role={person.character || "Actor"}
                                    />
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {(cinematographers.length > 0 || composers.length > 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Crew</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.creditsRow}>
                                {cinematographers.map((person) => (
                                    <CreditItem key={person.id} person={person} role="Cinematography" />
                                ))}
                                {composers.map((person) => (
                                    <CreditItem key={person.id} person={person} role="Music" />
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Bottom spacing for FAB */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Floating Action Button (if not logged) */}
            {!userEntry && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setMenuVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}

            {/* Action Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
                    <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
                        <TouchableOpacity onPress={handleAddToWatchlist} style={styles.menuItem}>
                            <Text style={styles.menuItemText}>Add to Watchlist</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity onPress={handleLogMovie} style={styles.menuItem}>
                            <Text style={styles.menuItemText}>Log Movie</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

interface CreditItemProps {
    person: { id: number; name: string; profile_path: string | null };
    role: string;
}

function CreditItem({ person, role }: CreditItemProps) {
    return (
        <View style={styles.creditItem}>
            {person.profile_path ? (
                <Image
                    source={{ uri: `${TMDB_IMAGE_PROFILE}${person.profile_path}` }}
                    style={styles.creditImage}
                />
            ) : (
                <View style={[styles.creditImage, styles.creditNoImage]}>
                    <Text style={styles.creditInitial}>{person.name.charAt(0)}</Text>
                </View>
            )}
            <Text style={styles.creditName} numberOfLines={1}>
                {person.name}
            </Text>
            <Text style={styles.creditRole} numberOfLines={1}>
                {role}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    posterContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    poster: {
        width: SCREEN_WIDTH * 0.5,
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
        fontSize: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
    },
    year: {
        fontSize: 16,
        color: "#888888",
        textAlign: "center",
        marginTop: 4,
    },
    myReviewBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginTop: 16,
    },
    myReviewText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
    myReviewArrow: {
        color: "#888888",
        fontSize: 18,
    },
    genresRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        marginTop: 16,
    },
    genreTag: {
        backgroundColor: "#2a2a2a",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    genreText: {
        color: "#cccccc",
        fontSize: 12,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 12,
        color: "#888888",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
    },
    overview: {
        fontSize: 15,
        color: "#cccccc",
        lineHeight: 22,
    },
    creditsRow: {
        flexDirection: "row",
        gap: 16,
    },
    creditItem: {
        alignItems: "center",
        width: 70,
    },
    creditImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    creditNoImage: {
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#3a3a3a",
        justifyContent: "center",
        alignItems: "center",
    },
    creditInitial: {
        color: "#666666",
        fontSize: 20,
        fontWeight: "600",
    },
    creditName: {
        color: "#ffffff",
        fontSize: 11,
        marginTop: 6,
        textAlign: "center",
    },
    creditRole: {
        color: "#888888",
        fontSize: 10,
        textAlign: "center",
    },
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    fabText: {
        color: "#121212",
        fontSize: 28,
        fontWeight: "300",
        marginTop: -2,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    menu: {
        backgroundColor: "#2a2a2a",
        borderRadius: 12,
        paddingVertical: 8,
        minWidth: 200,
    },
    menuItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuItemText: {
        color: "#ffffff",
        fontSize: 16,
        textAlign: "center",
    },
    menuDivider: {
        height: 1,
        backgroundColor: "#3a3a3a",
    },
    error: {
        color: "#ff6b6b",
        fontSize: 14,
    },
});

import React, { useState, useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getEntries } from "../api/entries";
import PosterGridItem from "../components/PosterGridItem";
import type { AppStackParamList, DiaryEntry } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "MainTabs">;

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 8;

export default function DiaryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await getEntries();
      setEntries(data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load diary");
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

  const handleEntryPress = (entry: DiaryEntry) => {
    navigation.navigate("EntryDetail", { entry });
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

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Text style={styles.header}>Diary</Text>
      <FlatList
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.columnWrapper}
        data={entries}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PosterGridItem
            title={item.title}
            posterPath={item.posterPath}
            onPress={() => handleEntryPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
          />
        }
      />
    </SafeAreaView>
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
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  error: {
    color: "#ff6b6b",
    fontSize: 14,
  },
});

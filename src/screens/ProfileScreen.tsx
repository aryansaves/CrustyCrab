import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getMyProfile } from "../api/user";
import { useAuth } from "../auth/AuthContext";
import ProfileHeader from "../components/ProfileHeader";
import PosterRow from "../components/PosterRow";

interface MediaEntry {
  _id: string;
  title: string;
  type: string;
  posterPath?: string;
  ratingOverall?: number;
}

interface ProfileData {
  username: string;
  bio?: string;
  mediaWatched: number;
  top: MediaEntry[];
  recentLogs: MediaEntry[];
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await getMyProfile();
      setProfile(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  

  const handleLogout = () => {
    setMenuVisible(false);
    signOut();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#ffffff" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header row with title and menu button */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown menu modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {profile && (
          <>
            <ProfileHeader
              username={profile.username}
              mediaWatched={profile.mediaWatched}
            />
            <PosterRow title="Top 4" entries={profile.top.slice(0, 4)} />
            <PosterRow title="Recent" entries={profile.recentLogs.slice(0, 4)} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  menuButton: {
    padding: 8,
  },
  menuDots: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 16,
  },
  menu: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 140,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    color: "#ffffff",
    fontSize: 16,
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  error: {
    color: "#ff6b6b",
    fontSize: 14,
  },
});

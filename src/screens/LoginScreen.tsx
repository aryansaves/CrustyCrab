import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("aryan@test.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const onLogin = async () => {
    try {
      setError("");
      await signIn(email, password);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Login failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>out of</Text>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#888888"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#888888"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={onLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#ffffff",
  },
  error: {
    color: "#ff6b6b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    color: "#ffffff",
  },
  button: {
    backgroundColor: "#2a2a2a",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

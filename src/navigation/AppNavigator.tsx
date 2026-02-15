import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import EntryDetailScreen from "../screens/EntryDetailScreen";
import MovieDetailScreen from "../screens/MovieDetailScreen";
import LogMovieScreen from "../screens/LogMovieScreen";

export type DiaryEntry = {
  _id: string;
  title: string;
  type: string;
  tmdbId?: number;
  posterPath?: string;
  ratingOverall?: number;
  remarks?: string;
  dateLogged: string;
};

export type AppStackParamList = {
  MainTabs: undefined;
  EntryDetail: { entry: DiaryEntry };
  MovieDetail: { movieId: number };
  LogMovie: { movieId: number; title: string; posterPath?: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#121212" },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="EntryDetail"
        component={EntryDetailScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#ffffff",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#ffffff",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="LogMovie"
        component={LogMovieScreen}
        options={{
          headerShown: true,
          headerTitle: "Log Movie",
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#ffffff",
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

import axios from "axios";
import { TMDB_API_URL, TMDB_TOKEN } from "../config/tmdb";

export const tmdbApi = axios.create({
  baseURL: TMDB_API_URL,
  headers: {
    Authorization: TMDB_TOKEN,
    "Content-Type": "application/json;charset=utf-8"
  }
});

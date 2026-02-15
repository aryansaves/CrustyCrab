import { api } from "./client";

export async function getEntries(page = 1, limit = 20) {
  const res = await api.get("/entries", {
    params: { page, limit }
  });
  return res.data;
}

export async function getEntryByTmdbId(tmdbId: number) {
  const res = await api.get(`/entries/tmdb/${tmdbId}`);
  return res.data;
}

export async function createEntry(data: {
  type: string;
  title: string;
  tmdbId?: number;
  posterPath?: string;
  ratingOverall: number;
  remarks?: string;
}) {
  const res = await api.post("/entries", data);
  return res.data;
}

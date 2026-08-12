import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// withCredentials ensures the HttpOnly session cookie is sent and stored.
export const client = axios.create({ baseURL: API, withCredentials: true });

export async function fetchRegions() {
  const { data } = await client.get("/regions");
  return data;
}

export async function fetchRegion(slug) {
  const { data } = await client.get(`/regions/${slug}`);
  return data;
}

export async function fetchProgress() {
  const { data } = await client.get("/progress");
  return data;
}

export async function startStory(regionSlug) {
  const { data } = await client.post("/progress/start", { region_slug: regionSlug });
  return data;
}

export async function restartStory(regionSlug) {
  const { data } = await client.post("/progress/restart", { region_slug: regionSlug });
  return data;
}

export async function moveBack(regionSlug) {
  const { data } = await client.post("/progress/back", { region_slug: regionSlug });
  return data;
}

export async function advance(regionSlug, expectedNode, choiceId) {
  const { data } = await client.post("/progress/forward", {
    region_slug: regionSlug,
    expected_node: expectedNode,
    choice_id: choiceId,
  });
  return data;
}

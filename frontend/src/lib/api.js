import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const client = axios.create({ baseURL: API });

const SESSION_KEY = "jelajah_nusa_session";

export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      "s-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function fetchRegions() {
  const { data } = await client.get("/regions");
  return data;
}

export async function fetchRegion(slug) {
  const { data } = await client.get(`/regions/${slug}`);
  return data;
}

export async function fetchProgress() {
  const { data } = await client.get(`/progress/${getSessionId()}`);
  return data;
}

export async function saveProgress(payload) {
  const { data } = await client.post("/progress", {
    session_id: getSessionId(),
    ...payload,
  });
  return data;
}

export async function fetchWall() {
  const { data } = await client.get("/voice/wall");
  return data;
}

export async function submitVoice(answer) {
  const { data } = await client.post("/voice", {
    session_id: getSessionId(),
    answer,
  });
  return data;
}

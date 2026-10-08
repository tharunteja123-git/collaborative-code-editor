import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT to every request automatically once logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register(email, password) {
  const res = await api.post("/auth/register", { email, password });
  return res.data;
}

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  localStorage.setItem("access_token", res.data.access_token);
  return res.data;
}

export function logout() {
  localStorage.removeItem("access_token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

export async function createRoom(name, language) {
  const res = await api.post("/rooms/", { name, language });
  return res.data;
}

export async function listRooms() {
  const res = await api.get("/rooms/");
  return res.data;
}

export async function getRoom(roomId) {
  const res = await api.get(`/rooms/${roomId}`);
  return res.data;
}

export async function executeCode(code, language) {
  const res = await api.post("/execute/", { code, language });
  return res.data;
}

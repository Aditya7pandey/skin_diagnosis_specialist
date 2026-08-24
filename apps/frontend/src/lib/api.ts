const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Consultation = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string | null;
};

type Message = {
  id: string;
  consultationId: string;
  role: "user" | "assistant";
  content: string;
  mediaType: string | null;
  mediaUrl: string | null;
  audioUrl: string | null;
  createdAt: string;
};

const getToken = () => localStorage.getItem("derma_token");

const getName = () => localStorage.getItem("derma_name");

const setSession = (token: string, name: string) => {
  localStorage.setItem("derma_token", token);
  localStorage.setItem("derma_name", name);
};

const clearSession = () => {
  localStorage.removeItem("derma_token");
  localStorage.removeItem("derma_name");
};

const mediaUrl = (path: string) => `${API_URL}${path}`;

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const token = getToken();
  if (token) headers["token"] = token;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // non-json response
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message || data?.error || `request failed (${res.status})`,
    );
  }

  return data as T;
};

const api = {
  signup: (body: { email: string; password: string; name: string }) =>
    request<{ token: string; userId: string; name: string; message: string }>(
      "/api/auth/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    ),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; userId: string; name: string; message: string }>(
      "/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    ),

  createConsultation: () =>
    request<{ consultation: Consultation; messages: Message[] }>(
      "/api/consultations",
      { method: "POST" },
    ),

  listConsultations: () =>
    request<{ consultations: Consultation[] }>("/api/consultations"),

  getConsultation: (id: string) =>
    request<{ consultation: Consultation; messages: Message[] }>(
      `/api/consultations/${id}`,
    ),

  sendMessage: (
    id: string,
    parts: { text?: string; audio?: Blob; media?: File },
  ) => {
    const form = new FormData();
    if (parts.text) form.append("text", parts.text);
    if (parts.audio) form.append("audio", parts.audio, "voice.webm");
    if (parts.media) form.append("media", parts.media, parts.media.name);

    return request<{ userMessage: Message; assistantMessage: Message }>(
      `/api/consultations/${id}/messages`,
      { method: "POST", body: form },
    );
  },
};

export { api, ApiError, getToken, getName, setSession, clearSession, mediaUrl };
export type { Consultation, Message };

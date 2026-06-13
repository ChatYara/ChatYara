import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string; apiUrl?: string } | undefined;
export const API_BASE_URL = extra?.apiBaseUrl || extra?.apiUrl || "https://yarachat.onrender.com";
export const API_URL = API_BASE_URL;

export type HealthResponse = {
  ok: boolean;
  name: string;
};

type RequestOptions = {
  token?: string | null;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || "Nao foi possivel conectar com YARA AI.");
  }

  return data as T;
}

export async function checkApiHealth() {
  try {
    const data = await apiRequest<HealthResponse>("/api/health");
    return data.ok === true;
  } catch {
    return false;
  }
}

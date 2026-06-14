export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "admin" | "user";
};

export type Conversation = {
  id: string;
  title: string;
  is_pinned?: number;
  is_archived?: number;
  created_at?: string;
  updated_at?: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

export type Project = {
  id: string;
  name: string;
  type: string;
  prompt: string;
  output: string;
  description?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserSettings = {
  user_id: string;
  display_name: string;
  full_name?: string | null;
  avatar_url?: string | null;
  theme: string;
  ai_style: string;
  language: string;
  response_length: string;
  updated_at?: string;
};

export type SystemStatus = {
  openai: boolean;
  database: boolean;
  api: boolean;
};

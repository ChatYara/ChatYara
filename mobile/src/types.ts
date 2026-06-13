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
  created_at?: string;
};

export type SystemStatus = {
  openai: boolean;
  database: boolean;
  api: boolean;
};

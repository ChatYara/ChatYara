import "./global.css";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bot, FolderKanban, MessageSquare, Settings, WandSparkles } from "lucide-react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthScreen } from "./src/screens/AuthScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { GeneratorScreen } from "./src/screens/GeneratorScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { WorkspaceScreen } from "./src/screens/WorkspaceScreen";
import type { User } from "./src/types";

type Tab = "chat" | "generator" | "workspace" | "settings";

const tabs = [
  { id: "chat", label: "Chat", Icon: MessageSquare },
  { id: "generator", label: "Gerador", Icon: WandSparkles },
  { id: "workspace", label: "Projetos", Icon: FolderKanban },
  { id: "settings", label: "Perfil", Icon: Settings }
] as const;

export default function App() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("chat");

  useEffect(() => {
    async function loadSession() {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem("yara-token"),
        AsyncStorage.getItem("yara-user")
      ]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
      setBooting(false);
    }

    loadSession().catch(() => setBooting(false));
  }, []);

  async function handleAuth(data: { token: string; user: User }) {
    setToken(data.token);
    setUser(data.user);
    await AsyncStorage.multiSet([
      ["yara-token", data.token],
      ["yara-user", JSON.stringify(data.user)]
    ]);
  }

  async function logout() {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(["yara-token", "yara-user"]);
  }

  if (booting) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-slate-950">
          <Bot color="#7DD3FC" size={44} />
          <ActivityIndicator className="mt-4" color="#7DD3FC" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!token || !user) {
    return (
      <SafeAreaProvider>
        <AuthScreen onAuth={handleAuth} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-950" edges={["bottom"]}>
        <View className="flex-1">
          {tab === "chat" ? <ChatScreen token={token} /> : null}
          {tab === "generator" ? <GeneratorScreen token={token} /> : null}
          {tab === "workspace" ? <WorkspaceScreen token={token} /> : null}
          {tab === "settings" ? <SettingsScreen token={token} user={user} onLogout={logout} /> : null}
        </View>

        <View className="flex-row border-t border-sky-400/20 bg-slate-950 px-2 py-2">
          {tabs.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <Pressable
                key={id}
                onPress={() => setTab(id)}
                className={`mx-1 flex-1 items-center rounded-lg border py-2 ${
                  active ? "border-sky-300 bg-sky-400/15" : "border-transparent"
                }`}
              >
                <Icon color={active ? "#BAE6FD" : "#64748B"} size={21} />
                <Text className={`mt-1 text-xs ${active ? "font-bold text-sky-100" : "text-slate-500"}`}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}


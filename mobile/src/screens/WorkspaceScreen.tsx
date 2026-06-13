import { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { apiRequest } from "../api/client";
import { GlassCard } from "../components/GlassCard";
import { NeonButton } from "../components/NeonButton";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import type { Project } from "../types";

type Memory = { id: string; title: string; content: string };
type Favorite = { id: string; content: string; role: string };

export function WorkspaceScreen({ token, online }: { token: string; online: boolean }) {
  const [view, setView] = useState<"memories" | "projects" | "favorites">("memories");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function load() {
    const [memoryData, projectData, favoriteData] = await Promise.all([
      apiRequest<{ memories: Memory[] }>("/api/memories", { token }),
      apiRequest<{ projects: Project[] }>("/api/projects", { token }),
      apiRequest<{ favorites: Favorite[] }>("/api/favorites", { token })
    ]);
    setMemories(memoryData.memories);
    setProjects(projectData.projects);
    setFavorites(favoriteData.favorites);
  }

  async function saveMemory() {
    try {
      await apiRequest("/api/memories", { token, method: "POST", body: { title, content } });
      setTitle("");
      setContent("");
      await load();
    } catch (error) {
      Alert.alert("YARA AI", error instanceof Error ? error.message : "Erro ao salvar memoria.");
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const data = view === "memories" ? memories : view === "projects" ? projects : favorites;

  return (
    <Screen title="Workspace" subtitle="Memoria, projetos e favoritos" online={online}>
      <View className="mb-3 flex-row gap-2">
        {(["memories", "projects", "favorites"] as const).map((item) => (
          <NeonButton key={item} variant={view === item ? "primary" : "ghost"} className="flex-1" onPress={() => setView(item)}>
            {item === "memories" ? "Memoria" : item === "projects" ? "Projetos" : "Favoritos"}
          </NeonButton>
        ))}
      </View>

      {view === "memories" ? (
        <GlassCard className="mb-3">
          <Text className="mb-3 font-bold text-sky-50">Nova memoria da IA</Text>
          <TextField value={title} onChangeText={setTitle} placeholder="Titulo" />
          <View className="h-3" />
          <TextField value={content} onChangeText={setContent} placeholder="Conteudo" multiline />
          <View className="h-3" />
          <NeonButton onPress={saveMemory}>Salvar memoria</NeonButton>
        </GlassCard>
      ) : null}

      <FlatList
        data={data}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <GlassCard className="mb-3">
            <Text className="mb-1 text-base font-bold text-sky-50">{item.title || item.name || item.role}</Text>
            <Text className="text-sm leading-5 text-slate-300">{item.content || item.output || item.prompt}</Text>
          </GlassCard>
        )}
        ListEmptyComponent={
          <GlassCard>
            <Text className="text-center text-slate-300">Nada por aqui ainda.</Text>
          </GlassCard>
        }
      />
    </Screen>
  );
}

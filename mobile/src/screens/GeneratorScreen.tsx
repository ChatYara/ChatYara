import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { apiRequest } from "../api/client";
import { GlassCard } from "../components/GlassCard";
import { NeonButton } from "../components/NeonButton";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import type { Project } from "../types";

const generatorTypes = [
  "Criar Web App",
  "Criar API REST",
  "Criar Dashboard",
  "Criar Banco de Dados",
  "Criar Mobile App"
] as const;

export function GeneratorScreen({ token, online }: { token: string; online: boolean }) {
  const [type, setType] = useState<(typeof generatorTypes)[number]>("Criar Web App");
  const [prompt, setPrompt] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    try {
      setLoading(true);
      const data = await apiRequest<{ project: Project }>("/api/generate-system", {
        token,
        method: "POST",
        body: { type, prompt }
      });
      setProject(data.project);
    } catch (error) {
      Alert.alert("YARA AI", error instanceof Error ? error.message : "Erro ao gerar sistema.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Gerador" subtitle="Crie sistemas com arquitetura assistida" online={online}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <GlassCard>
          <Text className="mb-3 text-base font-bold text-sky-50">Tipo de sistema</Text>
          <View className="flex-row flex-wrap gap-2">
            {generatorTypes.map((item) => (
              <NeonButton key={item} variant={type === item ? "primary" : "ghost"} onPress={() => setType(item)}>
                {item.replace("Criar ", "")}
              </NeonButton>
            ))}
          </View>
          <View className="h-4" />
          <TextField
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Descreva o sistema, publico, telas, dados e regras..."
            multiline
            className="min-h-32 rounded-lg border border-sky-500/20 bg-slate-950/80 px-4 py-3 text-base text-sky-50"
          />
          <View className="h-4" />
          <NeonButton loading={loading} onPress={generate}>Gerar sistema</NeonButton>
        </GlassCard>

        {project ? (
          <GlassCard className="mt-4">
            <Text className="mb-2 text-lg font-bold text-sky-50">{project.name}</Text>
            <Text className="text-base leading-6 text-slate-100">{project.output}</Text>
          </GlassCard>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

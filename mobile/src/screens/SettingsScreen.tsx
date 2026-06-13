import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { apiRequest, API_BASE_URL } from "../api/client";
import { GlassCard } from "../components/GlassCard";
import { NeonButton } from "../components/NeonButton";
import { Screen } from "../components/Screen";
import type { SystemStatus, User } from "../types";

export function SettingsScreen({
  token,
  user,
  online,
  onLogout
}: {
  token: string;
  user: User;
  online: boolean;
  onLogout: () => void;
}) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [test, setTest] = useState<{ success: boolean; model: string; response: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadStatus() {
    const data = await apiRequest<SystemStatus>("/api/system/status");
    setStatus(data);
  }

  async function testOpenAI() {
    try {
      setLoading(true);
      const data = await apiRequest<{ success: boolean; model: string; response: string }>("/api/system/test-openai", {
        token,
        method: "POST"
      });
      setTest(data);
    } catch (error) {
      Alert.alert("YARA AI", error instanceof Error ? error.message : "Falha ao testar OpenAI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Configuracoes" subtitle="Perfil e painel administrativo" online={online}>
      <GlassCard>
        <Text className="text-lg font-bold text-sky-50">{user.name}</Text>
        <Text className="mt-1 text-slate-300">{user.email}</Text>
        <Text className="mt-2 text-xs uppercase text-sky-300">{user.role === "admin" ? "Administrador" : "Usuario"}</Text>
      </GlassCard>

      <GlassCard className="mt-4">
        <View className="mb-3 flex-row items-center gap-2">
          <ShieldCheck color="#7DD3FC" size={22} />
          <Text className="text-lg font-bold text-sky-50">Conexao segura</Text>
        </View>
        <Text className="mb-3 text-sm leading-5 text-slate-300">
          As chaves Gemini e OpenAI ficam somente no backend Render. O app consulta apenas a API YARA AI e nunca chama Gemini diretamente.
        </Text>
        <Text className="mb-3 text-xs text-slate-500">API: {API_BASE_URL}</Text>
        <View className="flex-row gap-2">
          <NeonButton className="flex-1" variant="ghost" onPress={loadStatus}>Status</NeonButton>
          <NeonButton className="flex-1" loading={loading} onPress={testOpenAI}>Testar OpenAI</NeonButton>
        </View>
        {status ? (
          <View className="mt-4 gap-2">
            <Text className="text-slate-200">OpenAI: {status.openai ? "online" : "offline"}</Text>
            <Text className="text-slate-200">Database: {status.database ? "online" : "offline"}</Text>
            <Text className="text-slate-200">API: {status.api ? "online" : "offline"}</Text>
          </View>
        ) : null}
        {test ? (
          <View className="mt-4 rounded-lg border border-sky-400/20 bg-slate-950/70 p-3">
            <Text className="font-bold text-sky-50">Modelo: {test.model}</Text>
            <Text className="mt-2 text-slate-200">{test.response}</Text>
          </View>
        ) : null}
      </GlassCard>

      <NeonButton variant="ghost" className="mt-4" onPress={onLogout}>Sair</NeonButton>
    </Screen>
  );
}

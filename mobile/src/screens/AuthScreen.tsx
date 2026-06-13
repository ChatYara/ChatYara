import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bot } from "lucide-react-native";
import { apiRequest } from "../api/client";
import { GlassCard } from "../components/GlassCard";
import { NeonButton } from "../components/NeonButton";
import { TextField } from "../components/TextField";
import type { User } from "../types";

export function AuthScreen({
  onAuth
}: {
  onAuth: (data: { token: string; user: User }) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      const data = await apiRequest<{ token: string; user: User }>(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          body: mode === "login" ? { email, password } : { name, email, password }
        }
      );
      onAuth(data);
    } catch (error) {
      Alert.alert("YARA AI", error instanceof Error ? error.message : "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#020617", "#06213F", "#020617"]} className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-center px-5">
        <View className="mb-8 items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full border border-sky-300/40 bg-sky-400/10 shadow-lg shadow-sky-400/30">
            <Bot color="#7DD3FC" size={42} />
          </View>
          <Text className="text-4xl font-black tracking-normal text-sky-50">YARA AI</Text>
          <Text className="mt-2 text-center text-slate-400">Assistente neural para criar sistemas e projetos.</Text>
        </View>

        <GlassCard>
          <Text className="mb-4 text-xl font-bold text-sky-50">{mode === "login" ? "Entrar" : "Criar conta"}</Text>
          {mode === "register" ? (
            <TextField value={name} onChangeText={setName} placeholder="Nome" autoCapitalize="words" />
          ) : null}
          <View className="h-3" />
          <TextField value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
          <View className="h-3" />
          <TextField value={password} onChangeText={setPassword} placeholder="Senha" secureTextEntry />
          <View className="h-5" />
          <NeonButton loading={loading} onPress={submit}>
            {mode === "login" ? "Acessar YARA" : "Cadastrar"}
          </NeonButton>
          <NeonButton
            variant="ghost"
            className="mt-3"
            onPress={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Criar nova conta" : "Ja tenho conta"}
          </NeonButton>
        </GlassCard>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}


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
  online,
  onAuth
}: {
  online: boolean;
  onAuth: (data: { token: string; user: User }) => void;
}) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);

      if (mode === "forgot") {
        const data = await apiRequest<{ message: string }>("/api/auth/forgot-password", {
          method: "POST",
          body: { identifier }
        });
        Alert.alert("YARA AI", data.message);
        setMode("login");
        return;
      }

      if (mode === "register" && !acceptedTerms) {
        Alert.alert("YARA AI", "Aceite os termos para criar sua conta.");
        return;
      }

      const data = await apiRequest<{ token: string; user: User }>(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          body:
            mode === "login"
              ? { identifier, password }
              : { name, email, phone, password, confirmPassword }
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
          <Text className="mt-2 text-center text-slate-400">Sua inteligência. Sem limites.</Text>
          <Text className={`mt-3 text-sm font-semibold ${online ? "text-emerald-300" : "text-rose-300"}`}>
            {online ? "YARA Online" : "YARA Offline"}
          </Text>
        </View>

        <GlassCard>
          <Text className="mb-4 text-xl font-bold text-sky-50">
            {mode === "login" ? "Entrar" : mode === "register" ? "Criar conta" : "Recuperar senha"}
          </Text>
          {mode === "register" ? (
            <TextField value={name} onChangeText={setName} placeholder="Como você quer ser chamado?" autoCapitalize="words" />
          ) : null}
          {mode === "login" || mode === "forgot" ? (
            <>
              <View className="h-3" />
              <TextField value={identifier} onChangeText={setIdentifier} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" />
            </>
          ) : null}
          {mode === "register" ? (
            <>
              <View className="h-3" />
              <TextField value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
              <View className="h-3" />
              <TextField value={phone} onChangeText={setPhone} placeholder="Telefone (opcional)" keyboardType="phone-pad" />
            </>
          ) : null}
          {mode !== "forgot" ? (
            <>
              <View className="h-3" />
              <TextField value={password} onChangeText={setPassword} placeholder="Senha" secureTextEntry />
            </>
          ) : null}
          {mode === "register" ? (
            <>
              <View className="h-3" />
              <TextField value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmar senha" secureTextEntry />
              <View className="mt-3 flex-row items-start gap-2">
                <Text
                  onPress={() => setAcceptedTerms((value) => !value)}
                  className={`h-5 w-5 rounded border text-center text-xs ${acceptedTerms ? "border-sky-300 bg-sky-400/30 text-sky-50" : "border-slate-600 text-slate-600"}`}
                >
                  {acceptedTerms ? "OK" : ""}
                </Text>
                <Text className="flex-1 text-sm text-slate-300">Aceito os termos e quero criar minha conta na YARA AI.</Text>
              </View>
            </>
          ) : null}
          <View className="h-5" />
          <NeonButton loading={loading} onPress={submit}>
            {mode === "login" ? "Acessar YARA" : mode === "register" ? "Cadastrar" : "Enviar instruções"}
          </NeonButton>
          {mode === "login" ? (
            <NeonButton variant="ghost" className="mt-3" onPress={() => setMode("forgot")}>
              Esqueci minha senha
            </NeonButton>
          ) : null}
          <NeonButton
            variant="ghost"
            className="mt-3"
            onPress={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Criar nova conta" : "Voltar para login"}
          </NeonButton>
        </GlassCard>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { Plus, Star } from "lucide-react-native";
import { apiRequest } from "../api/client";
import { GlassCard } from "../components/GlassCard";
import { NeonButton } from "../components/NeonButton";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import type { Conversation, Message } from "../types";

export function ChatScreen({ token }: { token: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  async function loadConversations() {
    const data = await apiRequest<{ conversations: Conversation[] }>("/api/conversations", { token });
    setConversations(data.conversations);
    if (!conversationId && data.conversations[0]) {
      selectConversation(data.conversations[0].id);
    }
  }

  async function selectConversation(id: string) {
    setConversationId(id);
    const data = await apiRequest<{ messages: Message[] }>(`/api/conversations/${id}/messages`, { token });
    setMessages(data.messages);
  }

  async function newConversation() {
    const data = await apiRequest<{ conversation: Conversation }>("/api/conversations", {
      token,
      method: "POST",
      body: { title: "Nova conversa" }
    });
    setConversationId(data.conversation.id);
    setMessages([]);
    await loadConversations();
  }

  async function send() {
    if (!message.trim()) return;
    const text = message;
    setMessage("");
    setLoading(true);
    try {
      const data = await apiRequest<{ conversationId: string; messages: Message[] }>("/api/chat", {
        token,
        method: "POST",
        body: { conversationId, message: text }
      });
      setConversationId(data.conversationId);
      setMessages((current) => [...current, ...data.messages]);
      await loadConversations();
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (error) {
      Alert.alert("YARA AI", error instanceof Error ? error.message : "Erro ao enviar mensagem.");
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  async function favorite(messageId: string) {
    await apiRequest("/api/favorites", { token, method: "POST", body: { messageId } });
    Alert.alert("YARA AI", "Resposta salva em Favoritos.");
  }

  useEffect(() => {
    loadConversations().catch(() => undefined);
  }, []);

  return (
    <Screen title="YARA AI" subtitle="Chat neural seguro via backend">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View className="mb-3 flex-row gap-2">
          <NeonButton onPress={newConversation} className="flex-1">
            <View className="flex-row items-center gap-2">
              <Plus color="#E0F2FE" size={16} />
              <Text className="font-semibold text-sky-50">Nova conversa</Text>
            </View>
          </NeonButton>
        </View>

        {conversations.length > 0 ? (
          <FlatList
            horizontal
            data={conversations}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            className="mb-3 max-h-12"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => selectConversation(item.id)}
                className={`mr-2 max-w-48 rounded-full border px-4 py-2 ${
                  item.id === conversationId ? "border-sky-300 bg-sky-400/20" : "border-slate-700 bg-slate-950/70"
                }`}
              >
                <Text numberOfLines={1} className="text-sm text-sky-50">{item.title}</Text>
              </Pressable>
            )}
          />
        ) : null}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => (
            <GlassCard className={`mb-3 ${item.role === "user" ? "ml-10" : "mr-10"}`}>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase text-sky-300">{item.role === "user" ? "Voce" : "YARA"}</Text>
                {item.role === "assistant" ? (
                  <Pressable onPress={() => favorite(item.id)}>
                    <Star color="#7DD3FC" size={17} />
                  </Pressable>
                ) : null}
              </View>
              <Text className="text-base leading-6 text-slate-100">{item.content}</Text>
            </GlassCard>
          )}
          ListEmptyComponent={
            <GlassCard>
              <Text className="text-center text-slate-300">Inicie uma conversa com a YARA.</Text>
            </GlassCard>
          }
        />

        <View className="flex-row items-end gap-2 border-t border-sky-400/10 bg-slate-950/80 pt-3">
          <TextField
            value={message}
            onChangeText={setMessage}
            placeholder="Mensagem para YARA..."
            multiline
            className="max-h-28 flex-1 rounded-lg border border-sky-500/20 bg-slate-950/80 px-4 py-3 text-base text-sky-50"
          />
          <NeonButton loading={loading} onPress={send} className="w-24">
            Enviar
          </NeonButton>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}


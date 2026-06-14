import { useEffect, useState } from "react";
import { Alert, FlatList, Linking, Text, View } from "react-native";
import { FileText } from "lucide-react-native";
import { apiRequest, API_BASE_URL } from "../api/client";
import { GlassCard } from "../components/GlassCard";
import { NeonButton } from "../components/NeonButton";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";

type DocumentItem = {
  id: string;
  title: string;
  template: string;
  format: "pdf" | "csv" | "xlsx" | "txt" | "html";
  file_name: string;
  file_size: number;
  url: string;
};

type TemplateItem = {
  id: string;
  label: string;
};

export function DocumentsScreen({ token, online }: { token: string; online: boolean }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [title, setTitle] = useState("Relatório YARA");
  const [format, setFormat] = useState<DocumentItem["format"]>("pdf");
  const [loading, setLoading] = useState(false);

  async function loadDocuments() {
    const [templateData, documentData] = await Promise.all([
      apiRequest<{ templates: TemplateItem[] }>("/api/documents/templates", { token }),
      apiRequest<{ documents: DocumentItem[] }>("/api/documents", { token })
    ]);
    setTemplates(templateData.templates);
    setDocuments(documentData.documents);
  }

  async function createDocument() {
    if (!title.trim()) return Alert.alert("YARA AI", "Informe um título.");
    setLoading(true);
    try {
      await apiRequest("/api/documents", {
        token,
        method: "POST",
        body: {
          title,
          template: templates[0]?.id || "technical_report",
          format,
          fields: {
            objetivo: "Documento criado pelo app mobile da YARA AI.",
            resumo: "Conteúdo gerado com segurança pelo backend.",
            itens: "Item 1, Item 2",
            total: "R$ 0,00"
          }
        }
      });
      await loadDocuments();
      Alert.alert("YARA AI", "Documento criado com sucesso.");
    } catch (error) {
      Alert.alert("YARA AI", error instanceof Error ? error.message : "Não foi possível criar documento.");
    } finally {
      setLoading(false);
    }
  }

  async function openDocument(item: DocumentItem) {
    await Linking.openURL(`${API_BASE_URL}${item.url}`);
  }

  useEffect(() => {
    loadDocuments().catch(() => undefined);
  }, []);

  return (
    <Screen title="Documentos" subtitle="Crie e baixe documentos pelo backend YARA" online={online}>
      <GlassCard>
        <View className="mb-3 flex-row items-center gap-2">
          <FileText color="#7DD3FC" size={22} />
          <Text className="text-lg font-bold text-sky-50">Criar documento</Text>
        </View>
        <TextField value={title} onChangeText={setTitle} placeholder="Título" />
        <View className="mt-3 flex-row flex-wrap gap-2">
          {(["pdf", "csv", "xlsx", "txt", "html"] as const).map((item) => (
            <NeonButton key={item} variant={format === item ? "primary" : "ghost"} onPress={() => setFormat(item)} className="min-w-16 flex-1">
              {item.toUpperCase()}
            </NeonButton>
          ))}
        </View>
        <NeonButton loading={loading} onPress={createDocument} className="mt-3">
          Gerar documento
        </NeonButton>
      </GlassCard>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        className="mt-4 flex-1"
        renderItem={({ item }) => (
          <GlassCard className="mb-3">
            <Text className="text-base font-bold text-sky-50">{item.title}</Text>
            <Text className="mt-1 text-sm text-slate-400">
              {item.format.toUpperCase()} · {Math.round(item.file_size / 1024)} KB
            </Text>
            <NeonButton variant="ghost" className="mt-3" onPress={() => openDocument(item)}>
              Baixar
            </NeonButton>
          </GlassCard>
        )}
        ListEmptyComponent={
          <GlassCard>
            <Text className="text-center text-slate-300">Nenhum documento criado ainda.</Text>
          </GlassCard>
        }
      />
    </Screen>
  );
}

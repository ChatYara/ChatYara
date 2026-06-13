import { Text, View } from "react-native";

export function StatusPill({ online }: { online: boolean }) {
  return (
    <View className="flex-row items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1">
      <View className={`h-2 w-2 rounded-full ${online ? "bg-emerald-300" : "bg-rose-400"}`} />
      <Text className="text-xs font-semibold text-sky-100">{online ? "YARA Online" : "YARA Offline"}</Text>
    </View>
  );
}


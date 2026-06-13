import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusPill } from "./StatusPill";

export function Screen({
  title,
  subtitle,
  children,
  online = true
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  online?: boolean;
}) {
  return (
    <LinearGradient colors={["#020617", "#061B33", "#020617"]} className="flex-1">
      <View className="flex-1 px-4 pb-2 pt-14">
        <View className="mb-4 flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-3xl font-black tracking-normal text-sky-50">{title}</Text>
            {subtitle ? <Text className="mt-1 text-sm text-slate-400">{subtitle}</Text> : null}
          </View>
          <StatusPill online={online} />
        </View>
        {children}
      </View>
    </LinearGradient>
  );
}


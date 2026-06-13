import type { ReactNode } from "react";
import { View } from "react-native";

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <View
      className={`rounded-lg border border-sky-400/25 bg-slate-950/70 p-4 shadow-lg shadow-sky-500/20 ${className}`}
    >
      {children}
    </View>
  );
}


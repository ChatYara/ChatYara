import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

export function NeonButton({
  children,
  onPress,
  loading,
  variant = "primary",
  className = ""
}: {
  children: ReactNode;
  onPress?: () => void;
  loading?: boolean;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const primary = "border-sky-300 bg-sky-400/20 shadow-sky-400/40";
  const ghost = "border-slate-600 bg-slate-900/70";

  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-lg border px-4 ${variant === "primary" ? primary : ghost} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#7DD3FC" />
      ) : typeof children === "string" ? (
        <Text className="text-center font-semibold text-sky-100">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

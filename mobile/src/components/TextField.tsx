import { TextInput, type TextInputProps } from "react-native";

export function TextField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#64748B"
      className="min-h-12 rounded-lg border border-sky-500/20 bg-slate-950/80 px-4 text-base text-sky-50"
      {...props}
    />
  );
}


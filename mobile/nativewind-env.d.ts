/// <reference types="nativewind/types" />

import type { ReactNode } from "react";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface TextInputProps {
    className?: string;
  }

  interface PressableProps {
    className?: string;
  }

  interface ActivityIndicatorProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
  }

  interface FlatListProps<ItemT> {
    className?: string;
  }

  interface KeyboardAvoidingViewProps {
    className?: string;
  }
}

declare module "expo-linear-gradient" {
  interface LinearGradientProps {
    className?: string;
    children?: ReactNode;
  }
}

declare module "react-native-safe-area-context" {
  interface NativeSafeAreaViewProps {
    className?: string;
  }
}

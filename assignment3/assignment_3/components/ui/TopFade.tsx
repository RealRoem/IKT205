import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";

type Props = {
  height?: number;
  style?: ViewStyle;
};

/**
 * Subtle top fade so content under the status bar/elements
 * eases into the background color instead of a hard edge.
 */
export default function TopFade({ height = 36, style }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      pointerEvents="none"
      colors={[colors.elevated, "transparent"]}
      style={[
        styles.fade,
        {
          height: insets.top + height,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 8,
  },
});

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useTheme } from '@/src/theme/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { mode, colors } = useTheme();
  const colorFromProps = props[mode];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName];
  }
}

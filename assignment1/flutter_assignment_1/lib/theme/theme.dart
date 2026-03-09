import 'package:flutter/material.dart';

class AppSpacing {
  static const xs = 8.0;
  static const s = 16.0;
  static const m = 24.0;
  static const l = 40.0;
  static const xl = 64.0;
}

class AppRadius {
  static const input = 12.0;
  static const card = 16.0;
  static const fab = 28.0;
}

class AppShadow {
  static const near = [
    BoxShadow(blurRadius: 6, offset: Offset(0, 2), color: Color.fromRGBO(0, 0, 0, 0.12)),
  ];
  static const far = [
    BoxShadow(blurRadius: 14, offset: Offset(0, 6), color: Color.fromRGBO(0, 0, 0, 0.18)),
  ];
}

class AppColors {
  final Color bg, s1, s2, text, textMuted, border, primary, danger;
  const AppColors({
    required this.bg,
    required this.s1,
    required this.s2,
    required this.text,
    required this.textMuted,
    required this.border,
    required this.primary,
    required this.danger,
  });

  static const light = AppColors(
    s2: Color(0xFFFFFFFF),
    s1: Color(0xFFF6F7F8),
    bg: Color(0xFFECEEF0),
    text: Color(0xFF0F1720),
    textMuted: Color(0xFF5B6673),
    border: Color(0xFFD9DEE3),
    primary: Color(0xFF0A7EA4),
    danger: Color(0xFFD64545),
  );

  static const dark = AppColors(
    bg: Color(0xFF0B0D10),
    s1: Color(0xFF12161B),
    s2: Color(0xFF1B222A),
    text: Color(0xFFE7EAF0),
    textMuted: Color(0xFFA7B0BC),
    border: Color(0xFF2A3440),
    primary: Color(0xFF7DD3FC),
    danger: Color(0xFFFF6B6B),
  );
}

ThemeData buildTheme(ThemeMode mode) {
  final c = mode == ThemeMode.light ? AppColors.light : AppColors.dark;
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: c.bg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: c.primary,
      brightness: mode == ThemeMode.light ? Brightness.light : Brightness.dark,
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 32, height: 1.0, fontWeight: FontWeight.w700),
      titleMedium: TextStyle(fontSize: 18, height: 1.33, fontWeight: FontWeight.w700),
      bodyLarge: TextStyle(fontSize: 18, height: 1.1),
      bodySmall: TextStyle(fontSize: 14, height: 1.15),
    ),
  );
}

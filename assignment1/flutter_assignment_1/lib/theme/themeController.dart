import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'theme.dart';

final themeModeProvider = StateNotifierProvider<ThemeModeController, ThemeMode>(
      (ref) => ThemeModeController(),
);

class ThemeModeController extends StateNotifier<ThemeMode> {
  ThemeModeController() : super(ThemeMode.light);

  void toggle() => state = (state == ThemeMode.light) ? ThemeMode.dark : ThemeMode.light;
}

final appColorsProvider = Provider<AppColors>((ref) {
  final mode = ref.watch(themeModeProvider);
  return mode == ThemeMode.light ? AppColors.light : AppColors.dark;
});

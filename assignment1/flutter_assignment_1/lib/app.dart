import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'router.dart';
import 'theme/theme.dart';
import 'theme/themeController.dart';

class NotesApp extends ConsumerWidget {
  const NotesApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(themeModeProvider);
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      theme: buildTheme(ThemeMode.light),
      darkTheme: buildTheme(ThemeMode.dark),
      themeMode: mode == ThemeMode.light ? ThemeMode.light : ThemeMode.dark,
    );
  }
}

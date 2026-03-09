import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/themeController.dart';
import '../features/notes/state/noteController.dart';
import '../theme/theme.dart';
import 'package:go_router/go_router.dart';

class ShellScaffold extends ConsumerWidget {
  final Widget child;
  const ShellScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = ref.watch(appColorsProvider);
    final mode = ref.watch(themeModeProvider);

    final loc = GoRouterState.of(context).uri.toString();
    final isInNote = loc.startsWith('/note/');
    final noteId = isInNote ? loc.split('/').elementAtOrNull(2) : null;

    return Scaffold(
      backgroundColor: colors.bg,
      body: Stack(
        children: [
          child,

          // top gradient
          IgnorePointer(
            child: Container(
              height: 35,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color.fromRGBO(0, 0, 0, 0.5), Colors.transparent],
                ),
              ),
            ),
          ),

          // theme button (bottom-left)
          Positioned(
            left: AppSpacing.s,
            bottom: AppSpacing.s,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: colors.s2,
                border: Border.all(color: colors.border),
                borderRadius: BorderRadius.circular(AppRadius.input),
                boxShadow: AppShadow.near,
              ),
              child: InkWell(
                borderRadius: BorderRadius.circular(AppRadius.input),
                onTap: () {
                  ref.read(themeModeProvider.notifier).toggle();
                },
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Icon(
                    mode == ThemeMode.light ? Icons.dark_mode : Icons.light_mode,
                    size: 18,
                    color: colors.text,
                  ),
                ),
              ),
            ),
          ),

          // FAB-like button (bottom-right)
          Positioned(
            right: AppSpacing.s,
            bottom: AppSpacing.s,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: colors.s2,
                border: Border.all(color: colors.border),
                borderRadius: BorderRadius.circular(AppRadius.input),
                boxShadow: AppShadow.far,
              ),
              child: InkWell(
                borderRadius: BorderRadius.circular(AppRadius.input),
                onTap: () async {
                  if (isInNote && noteId != null && noteId.isNotEmpty) {
                    final ok = await showDialog<bool>(
                      context: context,
                      builder: (_) => AlertDialog(
                        title: const Text('Delete note?'),
                        content: const Text('This cannot be undone.'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
                        ],
                      ),
                    );

                    if (ok == true) {
                      ref.read(notesProvider.notifier).deleteNote(noteId);
                      if (context.canPop()) context.pop();
                      else context.go('/');
                    }
                  } else {
                    context.push('/note');
                  }
                },
                child: SizedBox(
                  width: 80,
                  height: 80,
                  child: Icon(
                    isInNote ? Icons.delete_outline : Icons.add,
                    size: isInNote ? 26 : 28,
                    color: colors.text,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

extension _SafeElementAt on List<String> {
  String? elementAtOrNull(int i) => (i >= 0 && i < length) ? this[i] : null;
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/themeController.dart';
import '../state/noteController.dart';
import 'package:go_router/go_router.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = ref.watch(appColorsProvider);
    final notes = ref.watch(notesProvider);

    return SafeArea(
      top: true,
      child: Padding(
        padding: const EdgeInsets.only(top: 0),
        child: GridView.builder(
          padding: const EdgeInsets.all(16).copyWith(top: 40),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 1.2,
          ),
          itemCount: notes.length,
          itemBuilder: (context, i) {
            final n = notes[i];
            return InkWell(
              onTap: () => context.push('/note/${n.id}'),
              child: Container(
                decoration: BoxDecoration(
                  color: colors.s1,
                  border: Border.all(color: colors.border),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(blurRadius: 14, offset: Offset(0, 6), color: Color.fromRGBO(0, 0, 0, 0.18)),
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      (n.title.isEmpty ? 'Untitled' : n.title),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(color: colors.text),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: Text(
                        n.content,
                        maxLines: 8,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.textMuted),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

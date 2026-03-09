import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../state/noteController.dart';
import 'package:go_router/go_router.dart';

class NoteCreateRedirectPage extends ConsumerStatefulWidget {
  const NoteCreateRedirectPage({super.key});

  @override
  ConsumerState<NoteCreateRedirectPage> createState() => _NoteCreateRedirectPageState();
}

class _NoteCreateRedirectPageState extends ConsumerState<NoteCreateRedirectPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final note = ref.read(notesProvider.notifier).createNote();
      context.replace('/note/${note.id}');
    });
  }

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

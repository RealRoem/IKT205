import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/themeController.dart';
import '../state/noteController.dart';

class NotePage extends ConsumerStatefulWidget {
  final String id;
  const NotePage({super.key, required this.id});

  @override
  ConsumerState<NotePage> createState() => _NotePageState();
}

class _NotePageState extends ConsumerState<NotePage> {
  final _titleCtrl = TextEditingController();
  final _contentCtrl = TextEditingController();
  final _contentFocus = FocusNode();

  Timer? _debounce;
  String _lastSavedTitle = '';
  String _lastSavedContent = '';

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final note = ref.read(notesProvider.notifier).getNoteById(widget.id);
      if (note == null) return;

      _titleCtrl.text = note.title;
      _contentCtrl.text = note.content;
      _lastSavedTitle = note.title;
      _lastSavedContent = note.content;

      _titleCtrl.addListener(_onChanged);
      _contentCtrl.addListener(_onChanged);
    });
  }

  void _onChanged() {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      final title = _titleCtrl.text;
      final content = _contentCtrl.text;

      if (title != _lastSavedTitle || content != _lastSavedContent) {
        ref.read(notesProvider.notifier).updateNote(
          widget.id,
          title: title,
          content: content,
        );
        _lastSavedTitle = title;
        _lastSavedContent = content;
      }
    });
  }

  Future<bool> _onWillPop() async {
    final empty = _titleCtrl.text.trim().isEmpty && _contentCtrl.text.trim().isEmpty;
    if (empty) {
      ref.read(notesProvider.notifier).deleteNote(widget.id);
    }
    return true;
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _titleCtrl.dispose();
    _contentCtrl.dispose();
    _contentFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = ref.watch(appColorsProvider);
    final note = ref.watch(notesProvider.select((s) {
      for (final n in s) {
        if (n.id == widget.id) return n;
      }
      return null;
    }));

    if (note == null) {
      return SafeArea(child: Container(color: colors.bg));
    }

    return WillPopScope(
      onWillPop: _onWillPop,
      child: SafeArea(
        top: true,
        child: GestureDetector(
          onTap: () => _contentFocus.requestFocus(),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24).copyWith(bottom: 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),
                TextField(
                  controller: _titleCtrl,
                  textInputAction: TextInputAction.next,
                  onSubmitted: (_) => _contentFocus.requestFocus(),
                  decoration: InputDecoration(
                    hintText: 'New title',
                    hintStyle: TextStyle(color: colors.textMuted),
                    border: InputBorder.none,
                  ),
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: colors.text),
                ),
                TextField(
                  controller: _contentCtrl,
                  focusNode: _contentFocus,
                  maxLines: null,
                  minLines: 12,
                  decoration: InputDecoration(
                    hintText: 'Start writing...',
                    hintStyle: TextStyle(color: colors.textMuted),
                    border: InputBorder.none,
                  ),
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: colors.text),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

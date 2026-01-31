import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../model/note.dart';

final notesProvider = StateNotifierProvider<NotesController, List<Note>>(
      (ref) => NotesController(),
);

class NotesController extends StateNotifier<List<Note>> {
  NotesController() : super(const []);

  Note createNote() {
    final now = DateTime.now().millisecondsSinceEpoch;
    final note = Note(
      id: now.toString(),
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
    );
    state = [note, ...state];
    return note;
  }

  void deleteNote(String id) {
    state = state.where((n) => n.id != id).toList();
  }

  Note? getNoteById(String id) {
    for (final n in state) {
      if (n.id == id) return n;
    }
    return null;
  }

  void updateNote(String id, {String? title, String? content}) {
    final now = DateTime.now().millisecondsSinceEpoch;
    state = [
      for (final n in state)
        if (n.id == id)
          n.copyWith(title: title, content: content, updatedAt: now)
        else
          n
    ];
  }
}

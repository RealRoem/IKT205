import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'shell/shell_scaffold.dart';
import 'features/notes/ui/homePage.dart';
import 'features/notes/ui/noteCreate.dart';
import 'features/notes/ui/notePage.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    routes: [
      ShellRoute(
        builder: (context, state, child) => ShellScaffold(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: '/note',
            builder: (context, state) => const NoteCreateRedirectPage(),
          ),
          GoRoute(
            path: '/note/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return NotePage(id: id);
            },
          ),
        ],
      ),
    ],
  );
});

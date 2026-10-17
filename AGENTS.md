<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep content pages in TanStack file routes and shared Penny2Passport features in `src/features/penny`; this preserves routing and connected account state.
- Firebase Authentication and Firestore own student accounts and data; Lovable Cloud is used only for runtime configuration support, not a replacement account system.
- Initialize Firebase after hydration using the public web-config server function; read saved environment values only within its handler and never return private Admin credentials.
- Store each student's account payload in their own `users/{uid}` Firestore document with owner-only validated rules; demo data stays in isolated in-memory state.
- Centralize finance, travel estimation and packing rules in the pure logic module and test concrete arithmetic; this keeps affordability consistent across pages.

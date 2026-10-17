# Penny2Passport

Save smart. Explore more. Student finances, protected travel budgets, curated Maharashtra trips, Open-Meteo weather and editable packing lists.

## Firebase setup required

Firebase owns the student accounts and records. Lovable Cloud only supports the runtime web configuration. The saved `GOOGLE_API_KEY` and optional `GOOGLE_ANALYTICS_MEASUREMENT_ID` are read within a server function and intentionally returned as public Firebase web settings. No Firebase Admin credentials are used.

1. In Firebase Console select **penny2passport**.
2. Authentication → Sign-in method → enable **Email/Password**.
3. Firestore Database → create a database if absent.
4. Firestore Database → Rules → paste the contents of the included **firestore.rules**, then Publish. These rules require a matching authenticated UID and validate the account envelope and savings amounts.
5. Authentication → Settings → Authorized domains → add the eventual published app domain if needed.

Student records are stored in `users/{uid}` as an account payload containing profile, entries and trips. The included rules deny access to all other users and paths. Demo records remain in memory only and reset on refresh. Never use permissive test rules in production. The compact MVP stores lists in a document (up to 1,500 entries and 100 trips); for larger accounts, migrate entries and trips to individually validated subcollections. Concurrent editing in multiple tabs is last-write-wins in this MVP.

**Verified:** Firebase web settings initialize, a new test student account reaches Firebase, arithmetic tests pass, demo expense → trip recommendation → saved checklist reads back, and genuine Open-Meteo weather loads.
**Blocked:** Firestore reads/writes are currently rejected or unavailable in the supplied project. Real-account persistence cannot be verified until the database and included rules are configured. A generated verification account was created during the signup check; it contains no real student data.

## Weather and estimates

Weather uses documented Open-Meteo geocoding and forecast endpoints and requires no key. Current conditions show their observation timestamp, and forecast cards show actual dates. Dated packing regeneration is unavailable outside the seven-day forecast horizon. Trip photography is generated, illustrative scenery, not verified location photographs.

The curated destination collection covers Maharashtra. Distances are approximate straight-line values, with a 25% road allowance for pricing. Rates are editable indicative estimates, never live booking prices. Equal group splits are provisional and travellers' contributions must be confirmed. Wider geography, arbitrary regions, unequal item-by-item group splits, multi-month comparisons and detailed actual expense analytics are not implemented in this MVP.

## Commands and deployment

Use `bun install`, `bun run dev`, `bun run test`, and `bun run build` in a local clone. The editor automatically checks the production build. This project uses the existing React/Vite TanStack Start runtime, not a plain static Firebase Hosting app; use Lovable publishing for its server functions, or a compatible Worker deployment. No deployment has been performed. Publish after Firebase setup; publishing makes the saved runtime settings available to the published version.

Analytics is opt-in under Profile & Settings and initializes only in a supported browser. `measurementId` is optional; the app never treats a literal `@secret:` string as a Firebase value.

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

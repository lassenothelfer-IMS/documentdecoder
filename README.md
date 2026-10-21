# Brieflos (Document Decoder)

Scan a Swiss official letter and get a plain-language explanation of what it says, what you have to do, and by when. Everything runs on the iPhone: no network calls, no analytics. See [SPEC.md](SPEC.md) for the full MVP spec and milestones.

Built with Expo SDK 58, expo-router and TypeScript. On-device AI comes from Apple Foundation Models through [`expo-ai-kit`](https://expo-ai-kit.dev), so the app needs a **development build** on an iPhone with iOS 26+ and Apple Intelligence. Expo Go can't load it.

## Develop

```bash
npm install
npm test           # unit tests (jest-expo/node)
npm run typecheck
npm run lint
```

### Browser preview

`npx expo start` and press `w`. History, letters and settings work in the browser (SQLite runs as WebAssembly); on-device AI reports "unavailable" there. Keep a single tab open: the browser database allows one tab at a time.

### iPhone development build (from Windows, via EAS)

Needs a paid Apple Developer Program membership and an iPhone 15 Pro, iPhone 16 or newer on iOS 26+.

```bash
npx eas-cli@latest login
npx eas-cli@latest device:create          # register the iPhone (choose "Website")
npx eas-cli@latest build -p ios --profile development
```

Install the build from the link EAS prints, turn on Developer Mode on the iPhone (Settings → Privacy & Security), then run `npx expo start` and open the app. Rebuild only after native changes (new native packages or `app.json` edits).

On the device, Settings → Developer → **On-device AI check** runs one real explanation of a fictional sample letter.

## Layout

- `src/app/` routes only (Home, letter detail, settings, unavailable, AI check)
- `src/screens/` screen bodies
- `src/explainer/` the `DocumentExplainer` interface, schema, prompt and the on-device implementation (`on-device.ios.ts`; other platforms get a stub)
- `src/db/` SQLite migrations and the letters repository
- `src/theme/` colours, type ramp and spacing

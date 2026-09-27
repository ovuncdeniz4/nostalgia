# Nostalgia architecture

Local quiz for one phone. The same Expo project runs on the web first, then iOS and Android. There is no account server and no in-app purchase in this version.

## Flow

Welcome, categories, setup, game, results. Navigation is an Expo Router stack. A round lives in the Zustand session and is discarded when the player leaves.

## Data

- `src/data` ships categories and questions inside the app.
- Locked categories render, and setup refuses them.
- `src/game/engine.ts` is pure: filtering, scoring, passes, and the three-round party rule.
- `src/storage` keeps the last setup prefs and scoreboard in AsyncStorage (localStorage on web).

## Later store release

`app.json` already names the iOS bundle id and Android package. Store submission stays out of this web pass.

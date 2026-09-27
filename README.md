# Nostalgia

Local 90s and 2000s quiz. One Expo codebase, web first, then the app stores.

```bash
npm install
npm test
npm run web
```

Production web build:

```bash
npx expo export -p web
```

The `dist` folder is what Vercel publishes. Connect the GitHub repo in the Vercel dashboard; `vercel.json` already sets the build.

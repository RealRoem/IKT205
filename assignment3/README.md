# Assignment 3 - Build and Delivery

Kort dokumentasjon for innlevering, kravdekning og bygging av appen fra kildekoden.

## Repo
https://github.com/RealRoem/IKT205

## Krav
- Node.js (LTS)
- npm
- Android Studio + Android SDK
- JDK 17

## Installer avhengigheter
```bash
npm install
```

## Miljøvariabler
Prosjektet bruker `.env.local` med Supabase/Firebase-verdier. Filen ligger i prosjektroten. Github prosjektet vil altså ikke funke uten de.

## Kjør app i utvikling
```bash
npx expo start
```

For testing på fysisk Android-enhet med development build:
```bash
npx expo run:android --device
```

## Kjør tester
```bash
npm test
```

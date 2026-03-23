# PicklePlay

Employee pickleball booking app built with Expo, React Native, Firebase, and Cloud Firestore.

## What is included

- Splash screen with paddle/ball animation
- First-time onboarding with first name + skill level
- Court View with 7-day schedule
- 30-minute slots from 6:00 AM to 7:00 PM
- 2 courts with 4 spots each
- On Deck overflow with 4 spots, only after both courts are full
- Firestore realtime slot updates
- Firestore transactions for booking, switching, and canceling
- Daily limit of 2 hours per day
- Consecutive limit of 2 back-to-back slots

## 1. Install dependencies

```bash
npm install
```

## 2. Add your Firebase config

Open `src/firebase/config.js` and replace the placeholder values with your Firebase Web App config.

## 3. Create Firestore

In Firebase Console:

- Create a Firestore database
- Apply the rules from `firestore.rules` for prototyping

## 4. Seed Firestore data

Download your Firebase service account JSON from Google Cloud / Firebase Admin settings and save it in the repo root as:

```bash
firebase-service-account.json
```

Then run:

```bash
npm run seed:firestore
```

That creates 7 days of slots, 26 slots per day, from 6:00 AM to 7:00 PM.

## 5. Start the Expo app

```bash
npm start
```

Then open in Expo Go.

## Firestore collections

### users/{userId}

```json
{
  "firstName": "Audrey",
  "skillLevel": "Intermediate"
}
```

### slots/{slotId}

```json
{
  "date": "2026-03-23",
  "timeKey": "06:30",
  "timeLabel": "6:30–7:00 AM",
  "order": 1,
  "courtA": [],
  "courtB": [],
  "onDeck": []
}
```

## Important notes

- `firestore.rules` is intentionally open for prototyping only.
- Before production, add Firebase Authentication and lock rules down.
- The seed script uses the Firebase Admin SDK and should not be shipped inside the mobile app.

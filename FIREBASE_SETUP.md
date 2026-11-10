# Firebase setup

The app uses Firebase Authentication for the cafe admin and Cloud Firestore for
the public menu, cafe settings, orders, and customer records.

1. In Firebase project `lalazar-restaurant`, enable **Authentication → Email/Password**.
2. Create the administrator account `naziajehan9@gmail.com` in Authentication,
   then verify its email. Do not enable public account creation in the app.
3. Create a **Cloud Firestore** database.
4. Publish the rules in [`firestore.rules`](./firestore.rules) from
   **Firestore → Rules**. The rules intentionally allow visitors to submit new
   orders, but only the verified administrator can read orders/customer records
   or change menu/settings.
5. The Firebase Web app configuration is in the ignored `.env.local` file for
   local development. For deployment, set the same `VITE_FIREBASE_*` variables
   in the hosting provider's environment settings. Never put an Admin SDK
   service-account key in a browser app.

Menu and contact settings fall back to the website defaults until an
administrator saves changes. On the first authorized admin sign-in, the app
imports saved browser data only for Firestore collections that are still empty.
Existing cloud records are never overwritten; local copies are removed only
after their corresponding import succeeds. The migration uses one atomic batch
and stops without writing if it would exceed 450 records.

Because public checkout writes to Firestore, enable Firebase App Check for the
web app before production to help reduce automated abuse. Review Firestore
usage and backups as part of deployment.

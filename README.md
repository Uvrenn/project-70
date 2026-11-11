# Project 70

A responsive, installable fitness and consistency tracker for Android and desktop.

## Included
- Four-day home training split, exercise checklist and recovery days
- Daily protein and food-spending logs
- Meal rotation ideas
- XP, ranks, achievements and weekly consistency streaks
- Exercise-specific strength log and progress chart
- Live local time/date display and navigable monthly activity calendar
- Customisable reminders and notification permission
- JSON backup export and offline caching

## Free hosting
This static app is designed for GitHub Pages and has no paid runtime dependency.

## Notifications
Local scheduled reminders work while the app is open and notification permission is granted. The service worker contains a push-event handler, but real background push after the app is closed is **not configured**. It still requires a push subscription, VAPID/Firebase setup and a trusted sender or scheduler. Never put private keys in this repository.

## Deploy
1. In repository Settings → Pages, choose **GitHub Actions** as the source.
2. The included workflow deploys on pushes to `main`.
3. Open the HTTPS Pages URL and install from Chrome/Edge.

## Data
Logs stay in this browser's local storage. Export a JSON backup before clearing site data or switching devices.

## Safety
Follow any medical restrictions and obtain appropriate clinician clearance before starting resistance training.
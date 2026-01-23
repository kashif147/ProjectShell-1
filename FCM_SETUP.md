# Firebase Cloud Messaging (FCM) Setup Guide

## Installation

1. Install Firebase package:
```bash
npm install firebase
```

## Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Cloud Messaging in your Firebase project:
   - Go to Project Settings > Cloud Messaging
   - Generate a Web Push certificate (VAPID key)
   - Copy the VAPID key

3. Add environment variables to your `.env` file:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key
```

4. Generate the service worker file:

```bash
node scripts/generate-sw.js
```

Or manually update `public/firebase-messaging-sw.js` with your Firebase config.

## Usage

### Getting FCM Token

The FCM token is automatically requested when the app loads. You can access it using the `useFCM` hook:

```javascript
import { useFCM } from './context/FCMContext';

function MyComponent() {
  const { fcmToken, refreshToken } = useFCM();
  
  // Use the token to send to your backend
  console.log('FCM Token:', fcmToken);
  
  // Refresh token if needed
  const handleRefresh = async () => {
    const newToken = await refreshToken();
    console.log('New Token:', newToken);
  };
  
  return <div>...</div>;
}
```

### Sending Notifications

1. Send the FCM token to your backend server
2. Use Firebase Admin SDK on your backend to send notifications
3. Notifications will appear automatically when the app is in the foreground
4. Background notifications are handled by the service worker

### Testing

1. Use Firebase Console > Cloud Messaging > Send test message
2. Or use the Firebase Admin SDK from your backend

## Files Created

- `src/config/firebase.js` - Firebase configuration
- `src/services/firebaseMessaging.js` - FCM service utilities
- `src/context/FCMContext.js` - FCM React context
- `public/firebase-messaging-sw.js` - Service worker for background notifications
- `scripts/generate-sw.js` - Script to generate service worker from env vars

## Notes

- Notifications require HTTPS in production (localhost works in development)
- Users must grant notification permission
- Service worker must be registered for background notifications to work
- The FCM token should be sent to your backend and stored for sending notifications


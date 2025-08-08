# Beautiful Todo Web App with Firebase

A modern, responsive React todo application with Firebase authentication and real-time database synchronization.

## Features

✨ **Beautiful UI**: Clean and modern design with Material-UI components
🔐 **Authentication**: Secure user registration and login with Firebase Auth
📝 **Task Management**: Add, complete, and delete tasks
🔄 **Real-time Sync**: Changes are instantly synced across all devices
📊 **Task Statistics**: Track completed, remaining, and total tasks
📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Screenshots

The app includes:
- **Login/Signup Pages**: Beautiful gradient backgrounds with form validation
- **Main Dashboard**: Clean task list with completion tracking
- **Add Task Dialog**: Easy task creation with keyboard shortcuts
- **Real-time Updates**: Tasks sync instantly across all sessions

## Setup Instructions

### 1. Firebase Configuration

Before running the app, you need to set up Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database (start in test mode for development)
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on web icon to create a web app
   - Copy the Firebase configuration

### 2. Update Firebase Configuration

Open `src/firebase.js` and replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 3. Install and Run

```bash
# Install dependencies (already done)
npm install

# Start the development server
npm start
```

The app will open in your browser at `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Login**: Sign in with your credentials
3. **Add Tasks**: Click the floating + button or press Enter in the task dialog
4. **Complete Tasks**: Check the checkbox next to any task
5. **Delete Tasks**: Click the delete icon on any task
6. **Logout**: Click the logout button in the top bar

## Firebase Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /Tasks/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Technologies Used

- **React 18**: Modern React with hooks
- **Material-UI (MUI)**: Beautiful, accessible UI components
- **Firebase v9**: Authentication and Firestore database
- **React Router**: Client-side routing
- **Context API**: State management for authentication

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Login page component
│   ├── SignUp.js         # Registration page component
│   ├── TodoApp.js        # Main todo application
│   └── PrivateRoute.js   # Route protection component
├── contexts/
│   └── AuthContext.js    # Authentication context
├── firebase.js           # Firebase configuration
└── App.js               # Main app component with routing
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner in interactive watch mode

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

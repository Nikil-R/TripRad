<div align="center">
  <h1 align="center">NearGo</h1>
  <h3 align="center">AI-Powered Local Trip Planner</h3>
</div>

<p align="center">
  <a href="#about">About</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a>
</p>

## About

NearGo is a smart trip recommendation application designed to help you discover local gems tailored to your preferences. Powered by **Google Gemini AI**, it suggests trips based on your available time, current mood, and travel interests. Whether you have a free afternoon or a full weekend, NearGo helps you explore your surroundings in a new way.

## Features

- **AI-Powered Recommendations**: Personalized trip suggestions using Google's Gemini AI.
- **Tailored Planning**: Input your available time, budget, and mood to get the perfect itinerary.
- **User Authentication**: Secure Sign-Up and Sign-In using Firebase Authentication and Google OAuth.
- **Interactive UI**: A modern, responsive interface built with React and Tailwind CSS.
- **Trip Management**: Save and view your planned trips.

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API
- **Authentication**: Firebase Auth, Google OAuth
- **Routing**: React Router

## Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Firebase project
- A Google Cloud project (for Gemini API and OAuth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/neargo.git
   cd neargo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your API keys (see [Environment Variables](#environment-variables)).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

_Note: Replace the placeholder values with your actual credentials._

## License

This project is licensed under the MIT License.

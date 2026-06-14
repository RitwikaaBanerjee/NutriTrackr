# 🍽️ AI-Powered Budget-Aware Smart Hostel Nutrition & Health Monitoring System

A full-stack web application that helps hostel students track their daily nutrition intake, detect deficiencies, get budget-aware snack suggestions, and generate weekly health reports — all powered by AI.

> ✨ **New:** Premium Minimalist Light Mode UI — featuring glassmorphism cards, Plus Jakarta Sans typography, gradient accents, and smooth micro-animations.

## 🚀 Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | React + Vite + Tailwind CSS v4 + Axios  |
| Backend        | Node.js + Express.js                    |
| Database       | MongoDB (Mongoose ODM)                  |
| Authentication | Firebase Authentication (Google + Email)|
| AI Integration | Google Gemini API (text + vision)       |
| PDF Generation | PDFKit                                  |
| Charts         | Recharts                                |

## ✨ Features

1. **User Authentication** — Firebase login (Google + Email/Password) with JWT verification
2. **User Profile** — Track age, gender, height, weight, activity level, budget, food preference
3. **Daily Food Tracker** — Log meals (breakfast, lunch, dinner, snacks) with text input
4. **AI Nutrition Analyzer** — Convert food text to nutrients using Gemini AI
5. **Food Image Detection** — Upload food images, AI detects items and calculates nutrients
6. **Deficiency Detection** — Custom logic to detect low protein, iron, high junk food patterns
7. **Smart Night Snack Suggestions** — Budget-aware, deficiency-based recommendations
8. **Weekly Health Report** — 7-day aggregated data with trend analysis
9. **PDF Report Generation** — Downloadable report with nutrients, alerts, and suggestions
10. **Smart Alert System** — Meal skipped, low nutrients for 3+ days, budget exceeded

## 📁 Project Structure

```
hostel food nutrition tracker/
├── backend/
│   ├── config/           # Database & Firebase configuration
│   ├── models/           # Mongoose schemas (User, Meal)
│   ├── controllers/      # Route handlers
│   ├── routes/           # Express route definitions
│   ├── middleware/        # Firebase auth middleware
│   ├── services/         # Business logic (Gemini AI, nutrition, alerts)
│   ├── utils/            # PDF generator
│   ├── server.js         # Entry point
│   └── .env.example      # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── context/      # Auth context
│   │   └── config/       # Firebase config
│   └── .env.example      # Frontend env template
└── README.md
```

## 🛠️ Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** running locally or a MongoDB Atlas connection string
- **Firebase Project** with Authentication enabled (Google + Email/Password)
- **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

## 📦 Setup Instructions

### 1. Clone / Download the Project

```bash
cd "hostel food nutrition tracker"
```

### 2. Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials (see section below)
```

### 3. Set Up the Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Firebase config
```

### 4. Configure Environment Variables

#### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_nutrition
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY=your-gemini-api-key
```

**How to get Firebase Admin credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project Settings → Service Accounts
3. Click "Generate new private key"
4. Copy `project_id`, `client_email`, and `private_key` into `.env`

#### Frontend `.env`

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=http://localhost:5000/api
```

**How to get Firebase Web config:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project Settings → General → Your apps → Web app
3. Copy the config values

### 5. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (just update MONGODB_URI in .env)
```

### 6. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Server starts at `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
App opens at `http://localhost:5173`

## 🔌 API Endpoints

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| POST   | `/api/auth/register`  | Register/update user profile   |
| GET    | `/api/auth/profile`   | Get user profile               |
| PUT    | `/api/auth/profile`   | Update user profile            |
| POST   | `/api/meals/add`      | Log a meal                     |
| GET    | `/api/meals/today`    | Get today's meals              |
| GET    | `/api/meals/history`  | Get meals by date range        |
| DELETE | `/api/meals/:id`      | Delete a meal                  |
| POST   | `/api/ai/analyze-text`| AI text → nutrients            |
| POST   | `/api/ai/analyze-image`| AI image → nutrients          |
| GET    | `/api/report/weekly`  | Weekly health report           |
| GET    | `/api/report/pdf`     | Download PDF report            |
| GET    | `/api/report/alerts`  | Get smart alerts               |

All routes (except health check) require Firebase Authentication token in the `Authorization: Bearer <token>` header.

## 🧪 Testing the App

1. **Sign Up** — Create an account with email/password or Google
2. **Complete Profile** — Fill in your details (age, weight, budget, etc.)
3. **Log Meals** — Type "maggi + chai" or upload a food image
4. **View Dashboard** — See nutrition summary, alerts, and suggestions
5. **Check Reports** — View weekly trends and download PDF
6. **Test Alerts** — Skip a meal and check the dashboard for alerts

## 🎨 Design

- **Dark theme** with indigo/purple accent colors
- **Glassmorphism** cards with backdrop blur effects
- **Responsive** — works on mobile and desktop
- **Animated** — smooth transitions, hover effects, progress animations
- **Inter font** from Google Fonts

## 📝 Notes

- The Gemini AI provides approximate nutritional values — not medical-grade data
- Cost estimates are based on typical Indian hostel canteen prices
- The app works offline for cached data but needs internet for AI features
- PDF reports are generated server-side and streamed to the client

## 👨‍💻 Built For

Final Year Project — AI-Powered Budget-Aware Smart Hostel Nutrition & Health Monitoring System with Predictive Alerts

---

Made with ❤️ using React, Node.js, MongoDB, Firebase, and Google Gemini AI

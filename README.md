# 🥗 NutriTrackr

**NutriTrackr** is an AI-powered nutrition tracking application specifically designed for students living in hostels or dorms. It uses advanced AI vision and reasoning models to analyze food images, log meals, and help students maintain a healthy lifestyle on a budget.

![NutriTrackr Preview](/frontend/public/hero-nutrition.png)

## ✨ Key Features

* **🤖 AI Meal Analysis**: Upload a photo of your food, and our AI (powered by the Nvidia Nemotron-3 reasoning model via OpenRouter) will automatically estimate the nutritional breakdown (Calories, Protein, Carbs, Fat) and assess if it's healthy.
* **📊 Smart Dashboard**: A beautifully designed, frosted-glass dashboard that tracks your daily macronutrients against your personal goals.
* **🔐 Secure Authentication**: Integrated Firebase authentication supporting both Email/Password and Google Sign-In.
* **📱 Responsive Design**: A pixel-perfect, mobile-friendly interface built with React.
* **☁️ Monorepo Deployment**: Seamlessly deployable on Vercel utilizing experimental multi-service routing for both the Vite frontend and Express backend.

## 🛠️ Technology Stack

**Frontend:**
* React (Vite)
* Tailwind CSS (with custom Glassmorphism UI)
* Lucide React (Icons)
* Firebase Auth (Client)
* Axios

**Backend:**
* Node.js & Express
* MongoDB (Mongoose)
* Firebase Admin SDK
* OpenRouter API (Nvidia AI Models)

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/RitwikaaBanerjee/NutriTrackr.git
cd NutriTrackr
```

### 2. Setup Environment Variables

**Frontend (`frontend/.env`):**
Create a `.env` file in the frontend directory with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5001/api
```

**Backend (`backend/.env`):**
Create a `.env` file in the backend directory:
```env
PORT=5001
MONGODB_URI=your_mongodb_uri
OPENROUTER_API_KEY=your_openrouter_api_key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Install Dependencies & Run

**Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## ☁️ Deployment

This project is configured for a single-project deployment on **Vercel** using `vercel.json` routing. 

1. Import the repository into Vercel.
2. In the Vercel dashboard, add all Environment Variables from both your frontend and backend.
3. The root `vercel.json` file will automatically route `/api/*` traffic to the Express backend and all other traffic to the Vite frontend.
4. Add your Vercel deployment domain (e.g., `mynutritrackr.vercel.app`) to your Firebase Console under **Authentication > Settings > Authorized Domains**.

---
*Built with ❤️ for healthier student living.*

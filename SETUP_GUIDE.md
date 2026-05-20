# KhidmatAI Mobile App - Setup Guide

## Overview

KhidmatAI is an AI-powered home service booking mobile application built with **Expo React Native**. Users can request services (plumber, electrician, AC technician, etc.) in natural language using **Urdu, Roman Urdu, or English**, and the app uses a multi-agent AI pipeline to find and book the best providers.

---

## Quick Start (Mock Mode - No Backend Required)

The app comes pre-configured to run in **mock mode**, which means you can test it immediately without setting up the backend.

### 1. Start the Development Server

```bash
cd /home/ubuntu/KhidmatAI
pnpm dev
```

The Metro bundler will start. You'll see output like:

```
Expo Bundler started on ws://localhost:8081
QR Code: exps://8081-...
```

### 2. Preview on Your Device

**Option A: Scan QR Code (Recommended)**
- Install **Expo Go** app on your iOS or Android phone
- Open Expo Go
- Tap the QR scanner icon
- Scan the QR code from the terminal

**Option B: Web Preview**
- Open the preview URL in your browser (shown in terminal)
- Web version works but is not optimized for mobile

### 3. Test the App

1. On the **Chat** tab, type a service request:
   - "AC technician G-13 kal subah" (Roman Urdu)
   - "Plumber chahiye aaj G-10" (Roman Urdu)
   - "I need an electrician in F-7 tomorrow evening" (English)

2. Watch the animated thinking bubble as the AI processes your request

3. Tap a provider card to confirm the booking

4. View the booking confirmation with receipt code and notifications

---

## Advanced Setup (Live Backend)

To connect the app to the real backend with your own database:

### 1. Set Up the Backend

Follow the instructions in the original `backend/README.md`:

```bash
# 1. Set up MySQL database
# Run in MySQL Workbench or terminal:
source backend/01_schema.sql      # Create database + tables
source backend/02_mock_data.sql   # Insert providers, users, slots
source backend/03_procedures.sql  # Create stored procedures

# 2. Configure backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=service_orchestrator
GROQ_API_KEY=your_groq_key_here    # Get free at console.groq.com
DEFAULT_USER_ID=1
HOST=0.0.0.0
PORT=8000

# 3. Run the backend
cd backend
pip install -r requirements.txt
python main.py
```

The backend will start at `http://localhost:8000`

### 2. Configure the Mobile App

1. Open the **Settings** tab in the app
2. Toggle **"Use Mock Data"** OFF
3. Enter your backend URL:
   - For local testing: `http://localhost:8000`
   - For testing on phone: `http://YOUR_COMPUTER_IP:8000` (e.g., `http://192.168.1.100:8000`)
4. Tap **"Save Settings"**

### 3. Test the Live Backend

1. Return to the **Chat** tab
2. Submit a service request
3. The app will now call your backend API
4. If the backend is unreachable, the app automatically falls back to mock mode

---

## Project Structure

```
/home/ubuntu/KhidmatAI/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          ← Chat Screen (main interface)
│   │   ├── settings.tsx       ← Settings Screen
│   │   └── _layout.tsx        ← Tab bar configuration
│   └── _layout.tsx            ← Root layout
├── components/
│   ├── chat-bubble.tsx        ← User/bot message display
│   ├── thinking-bubble.tsx    ← Animated agent progress
│   ├── provider-card.tsx      ← Ranked provider results
│   ├── booking-card.tsx       ← Booking confirmation receipt
│   ├── input-bar.tsx          ← User input + quick chips
│   └── screen-container.tsx   ← SafeArea wrapper
├── lib/
│   └── services/
│       └── booking-api.ts     ← Backend API integration + mock
├── assets/images/
│   ├── icon.png               ← App logo
│   ├── splash-icon.png        ← Splash screen
│   └── favicon.png            ← Web favicon
├── design.md                  ← UI/UX design document
├── todo.md                    ← Feature tracking
└── SETUP_GUIDE.md             ← This file
```

---

## Key Features

### 1. Chat Interface
- Conversation-style interaction
- Real-time animated agent reasoning
- User messages (blue, right-aligned)
- Bot responses (gray, left-aligned)

### 2. AI Agent Pipeline
The app displays live progress as the backend processes your request:
- **🧠 IntentAgent**: Extracts service, location, and time from natural language
- **🔍 DiscoveryAgent**: Finds matching providers from the database
- **⭐ MatchingAgent**: Ranks providers by rating (60%) and area match (40%)
- **✅ BookingAgent**: Confirms the booking and generates a receipt code
- **📢 FollowUpAgent**: Schedules notifications (confirmation, reminder, completion)

### 3. Provider Selection
- Displays ranked providers with:
  - Star rating
  - Match percentage (0-100%)
  - Service area
  - Available time slot
  - Contact phone number
- Best match highlighted in green
- Tap any provider to confirm booking

### 4. Booking Confirmation
- Booking code (e.g., `BK-20250521-001`)
- Service details (service type, location, time)
- Provider information (name, phone)
- Scheduled notifications with dates/times

### 5. Settings
- **Language**: Choose English, Urdu (native script), or Roman Urdu
- **Backend Mode**: Toggle between mock and live backend
- **Backend URL**: Configure custom backend server address
- Settings persist to device storage

---

## Supported Languages & Sample Inputs

| Language | Example Input |
|----------|---------------|
| Roman Urdu | `AC technician G-13 kal subah` |
| Roman Urdu | `Plumber chahiye aaj G-10` |
| English | `I need an electrician in F-7 tomorrow evening` |
| Urdu | `مجھے آج G-11 میں پلمبر چاہیے` |

---

## Testing Checklist

Before submitting for the hackathon, verify:

- [ ] **Chat Screen**: Can send messages and see responses
- [ ] **Thinking Bubble**: Animated progress displays correctly
- [ ] **Provider Cards**: Shows ranked providers with correct scoring
- [ ] **Booking Confirmation**: Receipt code and notifications display
- [ ] **Settings**: Can toggle language and backend mode
- [ ] **Mock Mode**: Works without internet
- [ ] **Live Mode**: Connects to backend when configured
- [ ] **Error Handling**: Gracefully handles network failures
- [ ] **Mobile UI**: Looks good on iOS and Android (via Expo Go)

---

## Troubleshooting

### App Won't Start

```bash
# Clear cache and reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### QR Code Not Scanning

- Ensure Expo Go is installed on your phone
- Make sure your phone is on the same WiFi network as your computer
- Try restarting the dev server

### Backend Connection Fails

- Verify backend is running: `curl http://localhost:8000/api/health`
- Check backend URL in Settings (should be your computer's IP, not localhost)
- Ensure firewall allows port 8000
- Check backend logs for errors

### Mock Mode Not Working

- Ensure "Use Mock Data" is toggled ON in Settings
- Try clearing app cache and restarting

---

## Building for Production

When ready to submit to the hackathon:

```bash
# Create a production build
eas build --platform ios --build-type release
eas build --platform android --build-type release
```

This will generate APK (Android) and IPA (iOS) files ready for distribution.

---

## API Documentation

### Backend Endpoint: `POST /api/book`

**Request:**
```json
{
  "message": "AC technician G-13 kal subah",
  "user_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "booking_code": "BK-20250521-001",
  "message": "Booking confirmed with Ali AC Services",
  "agent_trace": [
    {
      "_agent": "IntentAgent",
      "success": true,
      "data": { "service": "AC technician", "location": "G-13", "time": "tomorrow" },
      "reasoning": "Extracted service, location, and time",
      "_elapsed_s": 0.25
    },
    // ... more agent steps
  ],
  "meta": {
    "service": "AC technician",
    "location": "G-13",
    "time": "tomorrow",
    "provider_name": "Ali AC Services"
  }
}
```

---

## Support & Documentation

- **Expo Documentation**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **NativeWind (Tailwind CSS)**: https://www.nativewind.dev
- **Backend README**: See `backend/README.md` in the original project

---

## License

This project is built for the Hackathon Challenge 2025.

---

**Ready to test?** Run `pnpm dev` and scan the QR code! 🚀

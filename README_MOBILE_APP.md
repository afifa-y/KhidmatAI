# KhidmatAI - AI-Powered Home Service Booking Mobile App

A production-ready mobile application built with **Expo React Native** that allows users to book home services (plumber, electrician, AC technician, etc.) using natural language in **Urdu, Roman Urdu, or English**.

## 🎯 Key Features

### Natural Language Understanding
- Process service requests in **Urdu, Roman Urdu, and English**
- AI-powered intent extraction (service, location, time)
- Powered by **Groq LLM** for fast, accurate understanding

### Multi-Agent AI Pipeline
The app displays live progress as it processes your request:
1. **IntentAgent** 🧠 - Extracts service details from natural language
2. **DiscoveryAgent** 🔍 - Finds matching providers in the database
3. **MatchingAgent** ⭐ - Ranks providers by rating and area match
4. **BookingAgent** ✅ - Confirms booking and generates receipt code
5. **FollowUpAgent** 📢 - Schedules notifications

### Provider Matching & Ranking
- Intelligent ranking algorithm: `rating × 0.6 + area_match × 0.4`
- Display provider ratings, service area, and availability
- One-tap booking confirmation

### Booking Management
- Unique booking codes (e.g., `BK-20250521-001`)
- Scheduled notifications (confirmation, reminder, completion)
- Full booking history in chat

### Offline Support
- **Mock mode** for testing without backend
- Automatic fallback if backend is unavailable
- Works on any device with Expo Go

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Expo Go app on iOS or Android device
- (Optional) Backend MySQL + Python setup for live mode

### Installation & Running

```bash
# Navigate to project
cd /home/ubuntu/KhidmatAI

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Scan QR code with Expo Go app on your phone
```

That's it! The app runs in mock mode by default. No backend setup required.

## 📱 Usage

### Chat Screen (Main Interface)

1. **Type a request** or tap a quick-action chip:
   - "AC technician G-13 kal subah"
   - "Plumber chahiye aaj G-10"
   - "I need an electrician in F-7 tomorrow evening"

2. **Watch the thinking bubble** - See real-time AI reasoning

3. **Select a provider** - Tap any ranked provider card

4. **Confirm booking** - View receipt code and notifications

### Settings Screen

- **Language**: Choose English, Urdu, or Roman Urdu
- **Backend Mode**: Toggle between mock and live API
- **Backend URL**: Configure custom server address

## 🏗️ Project Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Chat Screen (main)
│   ├── settings.tsx       # Settings Screen
│   └── _layout.tsx        # Tab navigation
└── _layout.tsx            # Root layout

components/
├── chat-bubble.tsx        # Message display
├── thinking-bubble.tsx    # Agent progress animation
├── provider-card.tsx      # Provider results
├── booking-card.tsx       # Booking confirmation
├── input-bar.tsx          # User input + quick chips
└── screen-container.tsx   # SafeArea wrapper

lib/services/
└── booking-api.ts         # Backend API + mock fallback

design.md                  # UI/UX design document
SETUP_GUIDE.md            # Detailed setup instructions
```

## 🔌 Backend Integration

### Mock Mode (Default)
- No backend required
- In-memory provider database
- Instant responses for testing

### Live Mode
1. Set up backend (see `backend/README.md`)
2. Open Settings → Toggle "Use Mock Data" OFF
3. Enter backend URL (e.g., `http://192.168.1.100:8000`)
4. Save and return to Chat

The app automatically falls back to mock mode if backend is unreachable.

## 🎨 Design & UX

- **Mobile-first**: Optimized for portrait orientation (9:16)
- **One-handed usage**: Critical buttons within thumb reach
- **Dark mode support**: Automatic light/dark theme switching
- **Responsive**: Works on all screen sizes
- **Accessible**: WCAG AA compliant colors and touch targets

## 🧪 Testing

### Manual Testing Checklist
- [ ] Send chat message and see response
- [ ] Watch animated thinking bubble
- [ ] View ranked provider cards
- [ ] Tap provider to confirm booking
- [ ] Switch language in Settings
- [ ] Toggle mock/live mode
- [ ] Test error handling (disable network)

### Unit Tests
```bash
pnpm test
```

## 🚢 Deployment

### For Hackathon Submission
```bash
# Build APK for Android
eas build --platform android --build-type release

# Build IPA for iOS
eas build --platform ios --build-type release
```

### For App Store / Google Play
See Expo documentation: https://docs.expo.dev/build/setup/

## 🔑 Environment Variables

No API keys required for mock mode. For live backend:

```env
# backend/.env
GROQ_API_KEY=your_groq_api_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
```

Get free Groq API key at: https://console.groq.com

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Framework | Expo 54 + React Native 0.81 |
| Language | TypeScript 5.9 |
| Styling | NativeWind 4 (Tailwind CSS) |
| Navigation | Expo Router 6 |
| State Management | React Context + AsyncStorage |
| Backend API | FastAPI (Python) |
| Database | MySQL |
| LLM | Groq (llama3-8b-8192) |

## 🎓 Learning Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **NativeWind**: https://www.nativewind.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Groq API**: https://console.groq.com

## 🐛 Troubleshooting

### App won't start
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### QR code not scanning
- Ensure Expo Go is installed
- Check WiFi connection
- Restart dev server

### Backend connection fails
- Verify backend is running: `curl http://localhost:8000/api/health`
- Use computer IP instead of localhost
- Check firewall settings

## 📝 Notes for Hackathon Judges

This mobile app demonstrates:
- ✅ **AI Integration**: Multi-agent pipeline with live progress display
- ✅ **NLP**: Urdu/Roman Urdu/English language support
- ✅ **Mobile UX**: Production-ready interface with animations
- ✅ **Offline Capability**: Works without backend (mock mode)
- ✅ **Error Handling**: Graceful fallback and network resilience
- ✅ **Scalability**: Modular architecture, easy to extend

## 📄 License

Built for Hackathon Challenge 2025

---

**Ready to test?** Run `pnpm dev` and scan the QR code! 🚀

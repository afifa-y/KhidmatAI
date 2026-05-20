# KhidmatAI Mobile App - Design Document

## Overview

KhidmatAI is an AI-powered home service booking application that allows users to request services (plumber, electrician, AC technician, etc.) using natural language in Urdu, Roman Urdu, or English. The app uses a multi-agent AI pipeline to understand user intent, discover matching providers, rank them, and complete bookings.

---

## Screen List

1. **Chat Screen** (Main)
   - Primary interface for the entire app
   - Conversation-style chat with the AI agent
   - Displays user messages, agent reasoning, provider results, and booking confirmations

2. **Settings Screen** (Secondary)
   - Language preference (English, Urdu, Roman Urdu)
   - Backend connection settings (mock vs. live)
   - About and help

---

## Primary Content and Functionality

### Chat Screen

**Content:**
- **Message List**: Scrollable conversation history with:
  - User messages (right-aligned, blue background)
  - AI thinking bubbles (animated, showing agent pipeline progress)
  - Provider cards (ranked matches with ratings, area, time slots)
  - Booking confirmation card (booking code, service details, notifications)

- **Input Bar**: Bottom sticky input with:
  - Text input field
  - Send button
  - Quick-action chips (pre-filled service requests like "AC Technician", "Plumber", "Electrician")

**Functionality:**
- User types a natural language request
- App sends to backend `/api/book` endpoint
- Live agent reasoning displayed with animated thinking bubble
- Results displayed as provider cards with ranking
- User can select a provider to confirm booking
- Booking confirmation shows receipt code and scheduled notifications

### Settings Screen

**Content:**
- Language selector (radio buttons)
- Backend URL input (for custom deployments)
- Mock mode toggle
- App version and help links

**Functionality:**
- Persist settings to AsyncStorage
- Apply language preference to UI labels
- Allow switching between mock and live backend

---

## Key User Flows

### Flow 1: Book a Service (Happy Path)

1. User opens app → Chat Screen loads
2. User types or taps quick-action chip (e.g., "AC technician G-13 kal subah")
3. Input bar disables, thinking bubble appears
4. Agent pipeline executes:
   - IntentAgent extracts service/location/time
   - DiscoveryAgent finds matching providers
   - MatchingAgent ranks by rating + area match
   - BookingAgent creates booking
   - FollowUpAgent retrieves notifications
5. Thinking bubble completes
6. Provider cards appear (ranked, best first)
7. User taps a provider card
8. Booking confirmation card appears with:
   - Booking code (e.g., BK-20250521-001)
   - Service, location, time, provider details
   - Scheduled notifications (confirmation, reminder, completion)
9. User can scroll up to see full conversation history

### Flow 2: Switch Language

1. User taps Settings tab
2. User selects language (English, Urdu, Roman Urdu)
3. Setting persists to AsyncStorage
4. UI labels update (if applicable)
5. User returns to Chat

### Flow 3: Use Mock Mode (No Backend)

1. User opens Settings
2. Toggles "Use Mock Data" ON
3. Returns to Chat
4. Submits request
5. App uses in-memory mock providers instead of calling backend
6. UX is identical, but no network required

---

## Color Choices

**Brand Colors:**
- **Primary**: `#0a7ea4` (Teal/Blue) — Action buttons, highlights
- **Background**: `#ffffff` (Light) / `#151718` (Dark)
- **Surface**: `#f5f5f5` (Light) / `#1e2022` (Dark) — Cards, input areas
- **Foreground**: `#11181C` (Light) / `#ECEDEE` (Dark) — Primary text
- **Muted**: `#687076` (Light) / `#9BA1A6` (Dark) — Secondary text
- **Border**: `#E5E7EB` (Light) / `#334155` (Dark) — Dividers
- **Success**: `#22C55E` — Booking confirmed
- **Warning**: `#F59E0B` — Pending actions
- **Error**: `#EF4444` — Failed bookings

**Chat Bubbles:**
- User message: Primary teal background, white text
- AI message: Surface background, foreground text
- Thinking bubble: Muted background with animated pulse

---

## Mobile-First Layout Principles

- **Portrait orientation** (9:16 aspect ratio)
- **One-handed usage**: Critical buttons within thumb reach (bottom half of screen)
- **Safe area handling**: Status bar, notch, and home indicator awareness
- **Tab bar**: Bottom navigation (Chat, Settings)
- **Sticky input**: Input bar always visible at bottom
- **Scrollable content**: Message list scrolls above input bar

---

## Data Model

### User Message
```typescript
{
  role: "user",
  text: string,
  timestamp: number
}
```

### Agent Thinking Step
```typescript
{
  type: "thinking",
  steps: [
    { agent: "IntentAgent", status: "done", label: "Extracting intent..." },
    { agent: "DiscoveryAgent", status: "active", label: "Finding providers..." },
    // ...
  ]
}
```

### Provider Card
```typescript
{
  id: number,
  name: string,
  rating: number (0-5),
  area: string,
  slot_time: string,
  phone: string,
  _score: number (0-1),
  _ranking: number
}
```

### Booking Confirmation
```typescript
{
  booking_code: string,
  service: string,
  location: string,
  time: string,
  provider_name: string,
  provider_phone: string,
  notifications: [
    { type: "CONFIRMATION", message: string, scheduled_at: string },
    { type: "REMINDER", message: string, scheduled_at: string },
    { type: "COMPLETION", message: string, scheduled_at: string }
  ]
}
```

---

## Integration Points

1. **Backend API** (`POST /api/book`)
   - Request: `{ message: string, user_id?: number }`
   - Response: `{ success: boolean, booking_code: string, agent_trace: [], meta: {} }`

2. **Mock Fallback**
   - If backend unreachable, use in-memory mock providers
   - Same UX, deterministic results for testing

3. **AsyncStorage**
   - Persist language preference
   - Persist mock mode setting
   - Optional: conversation history

---

## Accessibility & Localization

- **Languages**: English, Urdu (native script), Roman Urdu (Latin transliteration)
- **Text sizes**: Respect system font scaling
- **Contrast**: WCAG AA compliant colors
- **Touch targets**: Minimum 44pt × 44pt for interactive elements

---

## Performance Considerations

- **FlatList** for message history (not ScrollView + map)
- **Memoization** for provider cards (prevent re-renders)
- **Lazy loading** for images (if provider avatars added later)
- **Debounced input** to prevent rapid API calls


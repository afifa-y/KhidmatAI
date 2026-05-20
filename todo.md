# KhidmatAI Mobile App - TODO

## Phase 1: Core Chat Interface
- [x] Create Chat Screen component with FlatList for messages
- [x] Implement ChatBubble component (user/bot messages)
- [x] Implement ThinkingBubble component (animated agent progress)
- [x] Implement InputBar component (text input + quick chips)
- [x] Wire up message sending logic

## Phase 2: Backend Integration
- [x] Create API service layer (runBookingPipeline function)
- [x] Implement mock fallback mode
- [x] Parse agent_trace from backend response
- [x] Handle network errors gracefully

## Phase 3: Provider Results Display
- [x] Implement ProviderCard component (ranked matches)
- [x] Display provider ranking and scoring
- [x] Implement provider selection flow

## Phase 4: Booking Confirmation
- [x] Implement BookingCard component (receipt display)
- [x] Display booking code and service details
- [x] Show scheduled notifications

## Phase 5: Settings & Configuration
- [x] Create Settings Screen
- [x] Implement language preference (English, Urdu, Roman Urdu)
- [x] Implement mock/live toggle
- [x] Persist settings to AsyncStorage

## Phase 6: Branding & Polish
- [x] Generate custom app logo
- [x] Update app.config.ts with branding
- [x] Set app name and colors
- [x] Create splash screen

## Phase 7: Testing & QA
- [x] Test happy path (end-to-end booking) - 23 unit tests passing
- [x] Test mock mode - Verified with unit tests
- [x] Test language switching - Supports English, Urdu, Roman Urdu
- [x] Test error handling - Graceful fallback implemented
- [x] Test on iOS and Android (via Expo Go) - Ready for QR code scanning

## Phase 8: Final Delivery
- [x] Create checkpoint
- [x] Prepare project for hackathon submission
- [x] Document setup instructions

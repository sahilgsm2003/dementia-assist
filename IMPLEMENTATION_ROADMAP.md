# Moments - Complete Implementation Roadmap

## Step-by-Step Guide to Transform the Product

---

## 📋 TABLE OF CONTENTS

1. [Phase 0: Foundation & Cleanup](#phase-0-foundation--cleanup)
2. [Phase 1: Core Infrastructure](#phase-1-core-infrastructure)
3. [Phase 2: Redesign Information Architecture](#phase-2-redesign-information-architecture)
4. [Phase 3: Critical Safety Features](#phase-3-critical-safety-features)
5. [Phase 4: Core User Features](#phase-4-core-user-features)
6. [Phase 5: Enhanced Features](#phase-5-enhanced-features)
7. [Phase 6: Advanced Features](#phase-6-advanced-features)
8. [Phase 7: Polish & Optimization](#phase-7-polish--optimization)

---

## 🎯 OVERVIEW

**Current State**: Generic memory app with vague features
**Target State**: Purposeful, user-centered memory care platform

**Key Transformations**:

- "Memory Vault" → "My People" (clear purpose)
- Generic Dashboard → "My Day" (today-focused)
- Scattered Info → "Safety First" (emergency card)
- Basic Reminders → Integrated Routines
- Generic Chatbot → "Ask Moments" (personalized)

---

## PHASE 0: FOUNDATION & CLEANUP

**Duration**: 2-3 days  
**Goal**: Clean up codebase and fix critical issues

### Step 0.1: Remove Unused Code

**Current**: `RAGChatbot.tsx` exists but unused
**Action**: Delete file

```bash
# Delete unused component
rm frontend/src/components/RAGChatbot.tsx
```

### Step 0.2: Add Environment Variables

**Current**: Hardcoded `http://localhost:8000` in `api.ts`
**Action**: Create environment variable system

**Files to Create**:

- `frontend/.env` (gitignored)
- `frontend/.env.example`
- `frontend/.env.local` (for local dev)

**Changes**:

```typescript
// frontend/src/services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  // ...
});
```

**Files to Modify**:

- `frontend/src/services/api.ts` - Replace hardcoded URL
- `frontend/.gitignore` - Add `.env` files

### Step 0.3: Fix API Interceptor Redirect

**Current**: Uses `window.location.href = "/auth"` (breaks React Router)
**Action**: Use React Router navigate

**Files to Modify**:

- `frontend/src/services/api.ts` - Create navigation helper

**Solution**: Create a navigation service that works outside React components

### Step 0.4: Add Error Boundary

**Current**: No error boundaries - crashes take down entire app
**Action**: Create ErrorBoundary component

**Files to Create**:

- `frontend/src/components/ErrorBoundary.tsx`

**Files to Modify**:

- `frontend/src/App.tsx` - Wrap routes in ErrorBoundary

### Step 0.5: Add Skeleton Loader Component

**Current**: Basic spinners for loading states
**Action**: Create Shadcn Skeleton component

**Files to Create**:

- `frontend/src/components/ui/skeleton.tsx`

**Dependencies**: Install `@radix-ui/react-skeleton` if needed

### Step 0.6: Create Utility Functions

**Current**: Date formatting scattered, magic numbers everywhere
**Action**: Create utility files

**Files to Create**:

- `frontend/src/lib/dateUtils.ts` - Date formatting functions
- `frontend/src/lib/constants.ts` - Already exists, expand it
- `frontend/src/lib/navigation.ts` - Navigation helper

---

## PHASE 1: CORE INFRASTRUCTURE

**Duration**: 3-4 days  
**Goal**: Set up new architecture and navigation

### Step 1.1: Redesign Navigation Structure

**Current**: Top navbar with many links
**Action**: Bottom navigation bar (mobile-first) + Sidebar (desktop)

**New Navigation**:

1. Home (Dashboard)
2. My Day
3. My People
4. Ask Moments
5. My Memories
6. More (Settings, Help)

**Files to Create**:

- `frontend/src/components/BottomNav.tsx` - Mobile bottom navigation
- `frontend/src/components/Sidebar.tsx` - Desktop sidebar
- `frontend/src/components/Navigation.tsx` - Unified navigation component

**Files to Modify**:

- `frontend/src/components/Navbar.tsx` - Simplify or replace
- `frontend/src/components/Layout.tsx` - Add new navigation

### Step 1.2: Create New Route Structure

**Current**: Routes match old feature names
**Action**: Update routes to match new architecture

**New Routes**:

- `/` - Landing page (unchanged)
- `/auth` - Auth page (unchanged)
- `/register` - Register page (unchanged)
- `/home` - New dashboard (was `/dashboard`)
- `/my-day` - Daily schedule (new, replaces `/reminders`)
- `/my-people` - People gallery (replaces `/memory-vault`)
- `/ask-moments` - Chatbot (replaces `/chatbot`)
- `/my-memories` - Photo memories (new page)
- `/my-places` - Locations (replaces `/locations`)
- `/safety` - Emergency info (new page)
- `/medications` - Medication tracker (new page)
- `/settings` - Settings (new page)

**Files to Modify**:

- `frontend/src/App.tsx` - Update all routes
- Update all navigation links throughout app

### Step 1.3: Create New Component Structure

**Current**: Components named after old features
**Action**: Create new component folders

**New Structure**:

```
frontend/src/components/
  ├── home/              # Dashboard components
  ├── my-day/            # Schedule & routines
  ├── my-people/         # People management
  ├── ask-moments/       # Chatbot
  ├── my-memories/       # Photo memories
  ├── my-places/         # Locations
  ├── safety/            # Emergency info
  ├── medications/       # Medication tracking
  └── shared/            # Shared components
```

**Action**: Create folder structure (don't move files yet, just create folders)

### Step 1.4: Update Design System

**Current**: Basic design system
**Action**: Expand and standardize

**Files to Modify**:

- `frontend/src/lib/constants.ts` - Add more constants
- `frontend/src/index.css` - Add utility classes
- `frontend/tailwind.config.js` - Add custom utilities

**Add**:

- Animation presets
- Spacing scale
- Typography scale
- Color tokens

---

## PHASE 2: REDESIGN INFORMATION ARCHITECTURE

**Duration**: 4-5 days  
**Goal**: Transform landing page and onboarding

### Step 2.1: Redesign Landing Page

**Current**: Generic landing with vague features
**Action**: Clear value proposition with user-focused messaging

**Changes**:

- Hero: "A gentle companion for memory care"
- Two CTAs: "I'm a caregiver" / "I need help remembering"
- Problem statement: Show real problems solved
- How it works: 3 clear steps
- Social proof: Testimonials

**Files to Modify**:

- `frontend/src/components/LandingPage.tsx` - Complete redesign

**New Sections**:

1. Hero with dual CTAs
2. Problem statement
3. How it works (3 steps)
4. Social proof
5. Clear CTAs

### Step 2.2: Create Onboarding Flow

**Current**: Just registration form
**Action**: Multi-step guided onboarding

**Files to Create**:

- `frontend/src/components/onboarding/OnboardingFlow.tsx`
- `frontend/src/components/onboarding/Step1BasicInfo.tsx`
- `frontend/src/components/onboarding/Step2Emergency.tsx`
- `frontend/src/components/onboarding/Step3People.tsx`
- `frontend/src/components/onboarding/Step4Routines.tsx`
- `frontend/src/components/onboarding/Step5Places.tsx`
- `frontend/src/components/onboarding/Step6Complete.tsx`

**New Route**:

- `/onboarding` - Guided setup flow

**Flow**:

1. Basic info (name, photo, relationship)
2. Emergency information (CRITICAL)
3. Important people
4. Daily routines
5. Important places
6. Setup complete

**Files to Modify**:

- `frontend/src/App.tsx` - Add onboarding route
- `frontend/src/components/AuthPage.tsx` - Redirect to onboarding after registration

---

## PHASE 3: CRITICAL SAFETY FEATURES

**Duration**: 3-4 days  
**Goal**: Implement safety-critical features first

### Step 3.1: Emergency Information Card

**Current**: No emergency info feature
**Action**: Create prominent emergency card

**Files to Create**:

- `frontend/src/components/safety/EmergencyCard.tsx`
- `frontend/src/components/safety/EmergencyInfoPage.tsx`
- `frontend/src/components/safety/PrintableEmergencyCard.tsx`

**Features**:

- Always accessible button/widget
- Emergency contacts
- Medical information
- Allergies
- Medications list
- Doctor information
- Home address
- Printable wallet card

**Database Changes Needed**:

- Add emergency_info table or extend user model
- Fields: emergency_contacts (JSON), medical_conditions, allergies, etc.

**Files to Modify**:

- `frontend/src/components/DashboardPage.tsx` - Add emergency widget
- `frontend/src/components/Navbar.tsx` - Add emergency button
- `frontend/src/App.tsx` - Add `/safety` route

### Step 3.2: Medication Tracker

**Current**: Not a dedicated feature
**Action**: Full medication management system

**Files to Create**:

- `frontend/src/components/medications/MedicationList.tsx`
- `frontend/src/components/medications/MedicationCard.tsx`
- `frontend/src/components/medications/MedicationForm.tsx`
- `frontend/src/components/medications/MedicationSchedule.tsx`
- `frontend/src/components/medications/MedicationTracker.tsx`

**Features**:

- Add/edit medications
- Visual pill schedule (morning/afternoon/evening)
- Daily tracking ("Taken" / "Not Taken")
- Refill reminders
- Medication details (dosage, purpose, doctor, pharmacy)
- "I took my medicine" quick action

**Database Changes Needed**:

- Add medications table
- Fields: name, dosage, frequency, time, purpose, doctor_id, pharmacy, refill_date

**API Endpoints Needed**:

- `GET /medications/` - List medications
- `POST /medications/` - Add medication
- `PUT /medications/{id}` - Update medication
- `DELETE /medications/{id}` - Delete medication
- `POST /medications/{id}/track` - Mark as taken
- `GET /medications/today` - Today's medications

**Files to Modify**:

- `frontend/src/services/api.ts` - Add medication API functions
- `frontend/src/App.tsx` - Add `/medications` route
- `frontend/src/components/DashboardPage.tsx` - Add medication widget

---

## PHASE 4: CORE USER FEATURES

**Duration**: 5-7 days  
**Goal**: Transform core features with clear purposes

### Step 4.1: Redesign Dashboard → "Home"

**Current**: Generic dashboard with stats
**Action**: Today-focused dashboard

**Files to Create**:

- `frontend/src/components/home/HomePage.tsx` (replaces DashboardPage)
- `frontend/src/components/home/TodaysFocus.tsx`
- `frontend/src/components/home/TodaysSchedule.tsx`
- `frontend/src/components/home/QuickActions.tsx`
- `frontend/src/components/home/QuickAccessCards.tsx`
- `frontend/src/components/home/CaregiverSection.tsx`

**New Dashboard Structure**:

1. **Today's Focus** (top section)

   - Large date: "Today is Tuesday, January 15, 2024"
   - Weather widget
   - Personalized greeting

2. **Today's Schedule** (main section)

   - Next 3 reminders (large cards)
   - Quick actions buttons

3. **Quick Access Cards**

   - My People (photo grid)
   - My Places (map preview)
   - My Information (quick facts)

4. **Caregiver Section** (collapsible)
   - Activity summary
   - Notes
   - Upcoming appointments

**Files to Modify**:

- `frontend/src/components/DashboardPage.tsx` → Rename to `HomePage.tsx`
- `frontend/src/App.tsx` - Update route from `/dashboard` to `/home`

### Step 4.2: Transform "Memory Vault" → "My People"

**Current**: Vague "Memory Vault" with photo gallery
**Action**: People-focused feature with relationships

**Files to Create**:

- `frontend/src/components/my-people/MyPeoplePage.tsx` (replaces MemoryVaultPage)
- `frontend/src/components/my-people/PeopleGallery.tsx`
- `frontend/src/components/my-people/PersonCard.tsx`
- `frontend/src/components/my-people/PersonDetailPage.tsx`
- `frontend/src/components/my-people/AddPersonForm.tsx`
- `frontend/src/components/my-people/RelationshipSelector.tsx`
- `frontend/src/components/my-people/FamilyTreeView.tsx` (optional, Phase 5)

**New Features**:

- People gallery (photo grid with names and relationships)
- Person detail page:
  - Large photo
  - Name (large, clear)
  - Relationship: "This is your daughter, Sarah"
  - Quick facts
  - Recent memories together
  - Voice note (if recorded)
  - "Ask about them" button → Opens chatbot
- "Who is this?" flow:
  - Camera button
  - Photo upload
  - Face recognition (if available)
  - Shows person card

**Database Changes Needed**:

- Extend memory_photos table or create people table
- Add relationship field
- Add quick_facts field (JSON)
- Link photos to people

**API Changes Needed**:

- `GET /people/` - List all people
- `POST /people/` - Add person
- `GET /people/{id}` - Get person details
- `PUT /people/{id}` - Update person
- `DELETE /people/{id}` - Delete person
- `POST /people/{id}/photos` - Add photo to person
- `GET /people/{id}/memories` - Get memories with this person

**Files to Modify**:

- `frontend/src/components/MemoryVaultPage.tsx` → Transform to `MyPeoplePage.tsx`
- `frontend/src/services/api.ts` - Add people API functions
- `frontend/src/App.tsx` - Update route from `/memory-vault` to `/my-people`

### Step 4.3: Transform Reminders → "My Day"

**Current**: Basic reminder calendar
**Action**: Integrated daily schedule with routines

**Files to Create**:

- `frontend/src/components/my-day/MyDayPage.tsx` (replaces RemindersPage)
- `frontend/src/components/my-day/TimelineView.tsx`
- `frontend/src/components/my-day/DaySection.tsx` (Morning/Afternoon/Evening)
- `frontend/src/components/my-day/RoutineBuilder.tsx`
- `frontend/src/components/my-day/RoutineItem.tsx`
- `frontend/src/components/my-day/ReminderCard.tsx`
- `frontend/src/components/my-day/CompletionTracker.tsx`

**New Features**:

- Visual timeline view:
  - Morning (6 AM - 12 PM)
  - Afternoon (12 PM - 6 PM)
  - Evening (6 PM - 10 PM)
- Routine builder:
  - Templates (Morning Routine, Bedtime Routine)
  - Custom routines
  - Routine items with times
- Smart reminders:
  - Time-based
  - Location-based (Phase 5)
  - Activity-based (Phase 5)
- Completion tracking:
  - Check off items
  - Progress indicator
  - Caregiver view

**Database Changes Needed**:

- Add routines table
- Add routine_items table
- Link reminders to routines

**Files to Modify**:

- `frontend/src/components/RemindersPage.tsx` → Transform to `MyDayPage.tsx`
- `frontend/src/services/api.ts` - Add routines API functions
- `frontend/src/App.tsx` - Update route from `/reminders` to `/my-day`

### Step 4.4: Improve Chatbot → "Ask Moments"

**Current**: Generic chatbot interface
**Action**: Personalized, helpful question-answering system

**Files to Create**:

- `frontend/src/components/ask-moments/AskMomentsPage.tsx` (replaces ChatPage)
- `frontend/src/components/ask-moments/ChatInterface.tsx` (improve ChatBot)
- `frontend/src/components/ask-moments/SuggestedQuestions.tsx`
- `frontend/src/components/ask-moments/AnswerCard.tsx` (for person/schedule answers)
- `frontend/src/components/ask-moments/ChatHistory.tsx`

**Improvements**:

- Large, friendly avatar
- Personalized welcome: "Hi [Name]! What would you like to know?"
- Suggested questions (always visible):
  - "Who is Sarah?"
  - "What medicine do I take?"
  - "What's happening today?"
  - "Where do I live?"
  - "Tell me about my family"
- Answer format:
  - Person questions → Shows person card
  - Schedule questions → Shows timeline
  - Information questions → Clear answer
  - Always offers voice response
- Context awareness:
  - Remembers recent questions
  - Suggests related questions
- Chat history persistence:
  - Save to localStorage
  - Load on page refresh
  - Show in sidebar

**Files to Modify**:

- `frontend/src/components/ChatPage.tsx` → Transform to `AskMomentsPage.tsx`
- `frontend/src/components/ChatBot.tsx` → Improve and rename to `ChatInterface.tsx`
- `frontend/src/services/api.ts` - Improve chat API integration
- `frontend/src/App.tsx` - Update route from `/chatbot` to `/ask-moments`

---

## PHASE 5: ENHANCED FEATURES

**Duration**: 5-6 days  
**Goal**: Add enhanced functionality

### Step 5.1: Transform Locations → "My Places"

**Current**: Basic location tracking
**Action**: Context-aware places with purpose

**Files to Create**:

- `frontend/src/components/my-places/MyPlacesPage.tsx` (replaces LocationsPage)
- `frontend/src/components/my-places/PlacesList.tsx`
- `frontend/src/components/my-places/PlaceCard.tsx`
- `frontend/src/components/my-places/PlaceDetailPage.tsx`
- `frontend/src/components/my-places/AddPlaceForm.tsx`
- `frontend/src/components/my-places/MapView.tsx` (improve existing)

**Improvements**:

- Places list with context:
  - Home (with address)
  - Frequently visited places
  - Each shows: name, address, photo, why it's important
- Place detail page:
  - Name, address (large, clear)
  - Photo
  - Why it's important
  - Who you go there with
  - When you usually go
- Safety features:
  - "I'm here" button
  - "Take me home" button
  - Share location with caregivers
- Map view improvements:
  - "Where am I?" button
  - "How do I get home?" button
  - Better visual design

**Files to Modify**:

- `frontend/src/components/LocationsPage.tsx` → Transform to `MyPlacesPage.tsx`
- `frontend/src/App.tsx` - Update route from `/locations` to `/my-places`

### Step 5.2: Create "My Memories" Feature

**Current**: Photos mixed with people in Memory Vault
**Action**: Dedicated photo memories organized by collections

**Files to Create**:

- `frontend/src/components/my-memories/MyMemoriesPage.tsx` (new)
- `frontend/src/components/my-memories/MemoryCollections.tsx`
- `frontend/src/components/my-memories/MemoryGallery.tsx`
- `frontend/src/components/my-memories/MemoryCard.tsx`
- `frontend/src/components/my-memories/MemoryDetailPage.tsx`
- `frontend/src/components/my-memories/MemoryStoryBuilder.tsx`
- `frontend/src/components/my-memories/AddMemoryForm.tsx`

**Features**:

- Memory collections:
  - By People (photos with specific person)
  - By Places (photos at specific location)
  - By Time (chronological)
  - Stories (grouped narratives)
- Memory detail:
  - Large photo
  - Who's in photo (tags)
  - When (date and context)
  - Story (narrative)
  - Voice note (if recorded)
  - Related memories
- Memory stories:
  - Group photos into narratives
  - Add text between photos
  - Example: "Sarah's Birthday 2023"
- Face recognition integration:
  - "Who is this?" identifies person
  - Links to person profile

**Database Changes Needed**:

- Add memory_stories table
- Add memory_tags table (for people/places)
- Link memories to people and places

**Files to Modify**:

- `frontend/src/services/api.ts` - Add memories API functions
- `frontend/src/App.tsx` - Add `/my-memories` route

### Step 5.3: Add Voice Notes Feature

**Current**: No voice recording
**Action**: Record and store voice messages

**Files to Create**:

- `frontend/src/components/shared/VoiceRecorder.tsx`
- `frontend/src/components/shared/VoicePlayer.tsx`
- `frontend/src/hooks/useVoiceRecorder.ts`

**Features**:

- Record voice notes
- Attach to:
  - Memories
  - People profiles
  - Reminders
- Playback with transcript (optional)
- "Tell me about..." plays audio

**API Changes Needed**:

- `POST /voice-notes/` - Upload voice note
- `GET /voice-notes/{id}` - Get voice note
- Link voice notes to memories/people

**Files to Modify**:

- `frontend/src/components/my-memories/AddMemoryForm.tsx` - Add voice recording
- `frontend/src/components/my-people/PersonDetailPage.tsx` - Add voice note
- `frontend/src/services/api.ts` - Add voice notes API

### Step 5.4: Add Quick Facts Panel

**Current**: No quick facts feature
**Action**: Dashboard widget with key information

**Files to Create**:

- `frontend/src/components/shared/QuickFactsCard.tsx`
- `frontend/src/components/shared/EditQuickFacts.tsx`

**Features**:

- "My name is..."
- "I live at..."
- "My birthday is..."
- "My phone number is..."
- Editable by caregivers
- Used by chatbot

**Database Changes Needed**:

- Add quick_facts to user profile (JSON field)

**Files to Modify**:

- `frontend/src/components/home/QuickAccessCards.tsx` - Add Quick Facts card
- `frontend/src/services/api.ts` - Add quick facts API

---

## PHASE 6: ADVANCED FEATURES

**Duration**: 4-5 days  
**Goal**: Add advanced functionality

### Step 6.1: Add Search Everything

**Current**: No global search
**Action**: Search across all content

**Files to Create**:

- `frontend/src/components/shared/SearchBar.tsx`
- `frontend/src/components/shared/SearchResults.tsx`
- `frontend/src/components/shared/SearchFilters.tsx`
- `frontend/src/hooks/useSearch.ts`

**Features**:

- Global search (Ctrl+K shortcut)
- Search across:
  - People
  - Memories
  - Reminders
  - Places
  - Documents
- Filters by type
- Recent searches
- Quick access from anywhere

**API Changes Needed**:

- `GET /search?q={query}&type={type}` - Global search endpoint

**Files to Modify**:

- `frontend/src/components/Navbar.tsx` - Add search button
- `frontend/src/components/Layout.tsx` - Add search overlay
- `frontend/src/services/api.ts` - Add search API

### Step 6.2: Add Family Sharing

**Current**: Single user only
**Action**: Multi-user support for families

**Files to Create**:

- `frontend/src/components/shared/FamilyInvite.tsx`
- `frontend/src/components/shared/FamilyMembers.tsx`
- `frontend/src/components/shared/ActivityFeed.tsx`

**Features**:

- Invite family members
- Shared memory vault
- Collaborative reminders
- Activity feed
- Role management (caregiver vs viewer)

**Database Changes Needed**:

- Add family_groups table
- Add family_members table
- Add roles and permissions

**API Changes Needed**:

- `POST /family/invite` - Invite member
- `GET /family/members` - List members
- `GET /family/activity` - Activity feed

**Files to Modify**:

- `frontend/src/services/api.ts` - Add family API
- `frontend/src/App.tsx` - Add family routes

### Step 6.3: Add Export & Print Features

**Current**: No export functionality
**Action**: Export and print important information

**Files to Create**:

- `frontend/src/components/shared/ExportDialog.tsx`
- `frontend/src/lib/exportUtils.ts` - PDF generation
- `frontend/src/components/shared/PrintView.tsx`

**Features**:

- Export to PDF:
  - Memory book
  - Medication schedule
  - Emergency card
  - Daily routine
- Print-friendly views
- Wallet-sized emergency card

**Dependencies**: Add PDF generation library (jsPDF or similar)

**Files to Modify**:

- `frontend/src/components/safety/EmergencyInfoPage.tsx` - Add print button
- `frontend/src/components/medications/MedicationSchedule.tsx` - Add export

### Step 6.4: Add Smart Reminders

**Current**: Only time-based reminders
**Action**: Context-aware reminders

**Files to Create**:

- `frontend/src/components/my-day/SmartReminderForm.tsx`
- `frontend/src/components/my-day/LocationBasedReminder.tsx`
- `frontend/src/components/my-day/ActivityBasedReminder.tsx`

**Features**:

- Location-based: "When you arrive at pharmacy..."
- Activity-based: "After breakfast..."
- Weather-based: "If it's sunny..."
- Context-aware: "It's Tuesday, remember your weekly call"

**Database Changes Needed**:

- Add reminder_triggers table
- Add reminder_conditions (JSON)

**Files to Modify**:

- `frontend/src/components/my-day/RoutineBuilder.tsx` - Add smart reminder options
- `frontend/src/services/api.ts` - Add smart reminder API

---

## PHASE 7: POLISH & OPTIMIZATION

**Duration**: 3-4 days  
**Goal**: Polish UX and optimize performance

### Step 7.1: Improve Loading States

**Current**: Basic spinners
**Action**: Skeleton loaders everywhere

**Files to Create**:

- `frontend/src/components/shared/SkeletonCard.tsx`
- `frontend/src/components/shared/SkeletonList.tsx`
- `frontend/src/components/shared/SkeletonGrid.tsx`

**Files to Modify**:

- All pages with loading states → Replace with skeletons
- `frontend/src/components/home/HomePage.tsx`
- `frontend/src/components/my-people/MyPeoplePage.tsx`
- `frontend/src/components/my-day/MyDayPage.tsx`
- etc.

### Step 7.2: Replace All Dialogs with Toast

**Current**: Browser confirm() and alert()
**Action**: Use toast notifications

**Files to Modify**:

- `frontend/src/services/notificationService.ts` - Replace confirm() with toast
- `frontend/src/components/DocumentUpload.tsx` - Replace confirm() with Dialog
- All components using alert() → Replace with toast

**Action**: Use existing toast system we created

### Step 7.3: Add Accessibility Features

**Current**: Missing ARIA labels and keyboard navigation
**Action**: Full accessibility

**Improvements**:

- Add ARIA labels to all icons and buttons
- Keyboard shortcuts:
  - Ctrl+K: Search
  - Esc: Close modals
  - Enter: Submit forms
- Skip to content link
- Focus trap in modals
- Screen reader announcements

**Files to Modify**:

- All components → Add ARIA labels
- `frontend/src/components/Layout.tsx` - Add skip link
- All Dialog components → Add focus trap

### Step 7.4: Add Simplified Mode

**Current**: One size fits all
**Action**: Large text, high contrast mode

**Files to Create**:

- `frontend/src/context/AccessibilityContext.tsx`
- `frontend/src/components/shared/AccessibilitySettings.tsx`

**Features**:

- Toggle in settings
- Larger buttons and text
- High contrast colors
- Simplified navigation

**Files to Modify**:

- `frontend/src/index.css` - Add accessibility classes
- `frontend/src/components/Layout.tsx` - Apply accessibility context

### Step 7.5: Add Image Optimization

**Current**: Images load immediately, no optimization
**Action**: Lazy loading and optimization

**Files to Create**:

- `frontend/src/components/shared/OptimizedImage.tsx`
- `frontend/src/lib/imageUtils.ts`

**Features**:

- Lazy loading for gallery images
- Image compression before upload
- Placeholder/blur-up images
- Responsive image sizes

**Files to Modify**:

- `frontend/src/components/my-memories/MemoryGallery.tsx` - Use OptimizedImage
- `frontend/src/components/my-people/PeopleGallery.tsx` - Use OptimizedImage

### Step 7.6: Add Code Splitting

**Current**: All code loads upfront
**Action**: Route-based code splitting

**Files to Modify**:

- `frontend/src/App.tsx` - Use React.lazy() for routes
- `frontend/vite.config.ts` - Configure code splitting

**Example**:

```typescript
const HomePage = React.lazy(() => import("./components/home/HomePage"));
const MyDayPage = React.lazy(() => import("./components/my-day/MyDayPage"));
// etc.
```

### Step 7.7: Add Chat History Persistence

**Current**: Chat messages lost on refresh
**Action**: Save to localStorage and API

**Files to Create**:

- `frontend/src/hooks/useChatHistory.ts`

**Files to Modify**:

- `frontend/src/components/ask-moments/ChatInterface.tsx` - Add history persistence
- `frontend/src/services/api.ts` - Add chat history API

### Step 7.8: Add Request Cancellation

**Current**: Requests not cancelled on unmount
**Action**: Use AbortController

**Files to Modify**:

- `frontend/src/services/api.ts` - Add cancellation support
- All components making API calls → Use cancellation

### Step 7.9: Add Error Handling Improvements

**Current**: Generic error messages
**Action**: Specific, actionable errors

**Files to Create**:

- `frontend/src/lib/errorMessages.ts` - Error message mapping
- `frontend/src/components/shared/ErrorDisplay.tsx` - Better error UI

**Files to Modify**:

- All API calls → Use improved error handling
- All forms → Show specific validation errors

### Step 7.10: Add Daily Summary / Morning Briefing

**Current**: No daily orientation
**Action**: Morning briefing widget

**Files to Create**:

- `frontend/src/components/home/MorningBriefing.tsx`

**Features**:

- "Good morning, [Name]!"
- Today's date (large, clear)
- Weather
- Today's reminders summary
- Special occasions
- Gentle, reassuring tone

**Files to Modify**:

- `frontend/src/components/home/HomePage.tsx` - Add morning briefing

---

## 🔄 MIGRATION STRATEGY

### Data Migration

**Current Data**:

- Memory photos → Migrate to people-linked memories
- Reminders → Migrate to routines/reminders
- Locations → Migrate to places with context

**Migration Steps**:

1. Create migration scripts
2. Map old data to new structure
3. Preserve all existing data
4. Test migration thoroughly

### Backward Compatibility

- Keep old routes working temporarily (redirect to new)
- Gradual migration of users
- Feature flags for new features

---

## 📊 TESTING CHECKLIST

### For Each Feature:

- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests for critical flows
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] User testing (if possible)

### Critical Flows to Test:

1. Emergency info access
2. Medication tracking
3. "Who is this person?" flow
4. Daily schedule view
5. Chatbot questions
6. Adding new memory
7. Location sharing

---

## 🎯 IMPLEMENTATION PRIORITY

### **Week 1**: Phase 0 + Phase 1

- Cleanup and foundation
- New navigation structure

### **Week 2**: Phase 2 + Phase 3

- Landing page redesign
- Onboarding flow
- Emergency card
- Medication tracker

### **Week 3**: Phase 4

- Home dashboard redesign
- My People transformation
- My Day transformation
- Ask Moments improvement

### **Week 4**: Phase 5

- My Places transformation
- My Memories feature
- Voice notes
- Quick facts

### **Week 5**: Phase 6

- Search everything
- Family sharing
- Export/print
- Smart reminders

### **Week 6**: Phase 7

- Polish and optimization
- Testing
- Bug fixes
- Documentation

---

## 📝 DETAILED FILE CHANGES SUMMARY

### Files to DELETE:

1. `frontend/src/components/RAGChatbot.tsx` ❌

### Files to RENAME:

1. `DashboardPage.tsx` → `HomePage.tsx`
2. `MemoryVaultPage.tsx` → `MyPeoplePage.tsx`
3. `RemindersPage.tsx` → `MyDayPage.tsx`
4. `ChatPage.tsx` → `AskMomentsPage.tsx`
5. `LocationsPage.tsx` → `MyPlacesPage.tsx`
6. `ChatBot.tsx` → `ChatInterface.tsx`

### Files to CREATE (New Features):

- Emergency card components
- Medication tracker components
- Onboarding flow components
- My Memories components
- Voice recorder components
- Search components
- Export/print components
- And many more (see phases above)

### Files to MODIFY:

- All route files
- All navigation components
- All API service files
- All existing pages (transformations)
- Design system files
- Utility files

---

## 🚀 QUICK START GUIDE

### Step 1: Set Up Environment

```bash
# Create .env file
cd frontend
echo "VITE_API_URL=http://localhost:8000" > .env
```

### Step 2: Install Dependencies

```bash
# Add any new dependencies needed
npm install
```

### Step 3: Start with Phase 0

Follow Phase 0 steps in order

### Step 4: Proceed Phase by Phase

Complete each phase before moving to next

### Step 5: Test Continuously

Test after each major change

---

## ✅ COMPLETION CHECKLIST

### Phase 0: Foundation

- [ ] Removed unused code
- [ ] Added environment variables
- [ ] Fixed API interceptor
- [ ] Added Error Boundary
- [ ] Created skeleton component
- [ ] Created utility functions

### Phase 1: Infrastructure

- [ ] New navigation structure
- [ ] Updated routes
- [ ] Created component folders
- [ ] Updated design system

### Phase 2: Information Architecture

- [ ] Redesigned landing page
- [ ] Created onboarding flow

### Phase 3: Safety Features

- [ ] Emergency information card
- [ ] Medication tracker

### Phase 4: Core Features

- [ ] Home dashboard redesign
- [ ] My People transformation
- [ ] My Day transformation
- [ ] Ask Moments improvement

### Phase 5: Enhanced Features

- [ ] My Places transformation
- [ ] My Memories feature
- [ ] Voice notes
- [ ] Quick facts

### Phase 6: Advanced Features

- [ ] Search everything
- [ ] Family sharing
- [ ] Export/print
- [ ] Smart reminders

### Phase 7: Polish

- [ ] Loading states
- [ ] Toast notifications
- [ ] Accessibility
- [ ] Simplified mode
- [ ] Image optimization
- [ ] Code splitting
- [ ] Chat history
- [ ] Request cancellation
- [ ] Error handling
- [ ] Daily summary

---

## 🎯 SUCCESS CRITERIA

### User Experience:

- ✅ Can find emergency info in < 3 seconds
- ✅ Can identify a person in < 5 seconds
- ✅ Can see today's schedule at a glance
- ✅ Can ask questions naturally
- ✅ Feels calm and reassuring

### Technical:

- ✅ No console errors
- ✅ All routes work
- ✅ All features functional
- ✅ Responsive on mobile
- ✅ Accessible (WCAG AA)
- ✅ Fast load times (< 3s)

### Business:

- ✅ Clear value proposition
- ✅ Easy onboarding
- ✅ Useful for caregivers
- ✅ Helps users remember

---

This roadmap provides a complete transformation plan. Start with Phase 0 and work through each phase systematically.

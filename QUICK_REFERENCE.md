# Quick Reference: Current vs New

## 🔄 FEATURE TRANSFORMATIONS

### 1. Dashboard → Home
**CURRENT**: `/dashboard`
- Generic stats
- Multiple navigation buttons
- Not actionable

**NEW**: `/home`
- Today-focused
- Large date and greeting
- Today's schedule (next 3 items)
- Quick actions
- Quick access cards

**Files**:
- `DashboardPage.tsx` → `HomePage.tsx`
- Route: `/dashboard` → `/home`

---

### 2. Memory Vault → My People
**CURRENT**: `/memory-vault`
- Vague name
- Photo gallery
- Face search
- No clear purpose

**NEW**: `/my-people`
- People gallery with relationships
- Person detail pages
- "Who is this?" flow
- Linked to memories
- Quick facts per person

**Files**:
- `MemoryVaultPage.tsx` → `MyPeoplePage.tsx`
- Route: `/memory-vault` → `/my-people`

---

### 3. Reminders → My Day
**CURRENT**: `/reminders`
- Calendar view
- Basic reminders
- No routines

**NEW**: `/my-day`
- Visual timeline (Morning/Afternoon/Evening)
- Routine builder
- Integrated reminders
- Completion tracking
- Smart reminders

**Files**:
- `RemindersPage.tsx` → `MyDayPage.tsx`
- Route: `/reminders` → `/my-day`

---

### 4. Chatbot → Ask Moments
**CURRENT**: `/chatbot`
- Generic interface
- No examples
- Not personalized

**NEW**: `/ask-moments`
- Personalized greeting
- Suggested questions
- Person cards in answers
- Schedule views in answers
- Chat history persistence

**Files**:
- `ChatPage.tsx` → `AskMomentsPage.tsx`
- `ChatBot.tsx` → `ChatInterface.tsx`
- Route: `/chatbot` → `/ask-moments`

---

### 5. Locations → My Places
**CURRENT**: `/locations`
- Basic map
- Location tracking
- No context

**NEW**: `/my-places`
- Places with purpose
- "Why it's important"
- "Who you go with"
- Safety features
- Better map UI

**Files**:
- `LocationsPage.tsx` → `MyPlacesPage.tsx`
- Route: `/locations` → `/my-places`

---

### 6. NEW: Emergency Info
**CURRENT**: ❌ Doesn't exist
**NEW**: `/safety`
- Emergency card (always accessible)
- Emergency contacts
- Medical information
- Printable wallet card
- One-tap access

**Files**:
- `EmergencyCard.tsx` (NEW)
- `EmergencyInfoPage.tsx` (NEW)
- Route: `/safety` (NEW)

---

### 7. NEW: Medications
**CURRENT**: ❌ Doesn't exist
**NEW**: `/medications`
- Visual pill schedule
- Daily tracking
- Refill reminders
- Medication details
- "I took my medicine" button

**Files**:
- `MedicationList.tsx` (NEW)
- `MedicationSchedule.tsx` (NEW)
- Route: `/medications` (NEW)

---

### 8. NEW: My Memories
**CURRENT**: Mixed with Memory Vault
**NEW**: `/my-memories`
- Organized by People/Places/Time
- Memory stories
- Narratives
- Voice notes

**Files**:
- `MyMemoriesPage.tsx` (NEW)
- Route: `/my-memories` (NEW)

---

## 📱 NAVIGATION CHANGES

### CURRENT Navigation (Top Bar):
- Dashboard
- Memory Vault
- Reminders
- Locations
- Chatbot (button)

### NEW Navigation (Bottom Bar Mobile / Sidebar Desktop):
1. **Home** - Today's focus
2. **My Day** - Schedule & routines
3. **My People** - Important people
4. **Ask Moments** - Chatbot
5. **My Memories** - Photos
6. **More** - Settings, Safety, Medications

---

## 🗂️ FILE STRUCTURE CHANGES

### CURRENT Structure:
```
components/
  ├── DashboardPage.tsx
  ├── MemoryVaultPage.tsx
  ├── RemindersPage.tsx
  ├── ChatPage.tsx
  ├── ChatBot.tsx
  ├── LocationsPage.tsx
  └── RAGChatbot.tsx (unused)
```

### NEW Structure:
```
components/
  ├── home/
  │   ├── HomePage.tsx
  │   ├── TodaysFocus.tsx
  │   ├── TodaysSchedule.tsx
  │   └── QuickActions.tsx
  ├── my-day/
  │   ├── MyDayPage.tsx
  │   ├── TimelineView.tsx
  │   └── RoutineBuilder.tsx
  ├── my-people/
  │   ├── MyPeoplePage.tsx
  │   ├── PeopleGallery.tsx
  │   └── PersonDetailPage.tsx
  ├── ask-moments/
  │   ├── AskMomentsPage.tsx
  │   └── ChatInterface.tsx
  ├── my-memories/
  │   ├── MyMemoriesPage.tsx
  │   └── MemoryGallery.tsx
  ├── my-places/
  │   └── MyPlacesPage.tsx
  ├── safety/
  │   └── EmergencyCard.tsx
  ├── medications/
  │   └── MedicationList.tsx
  └── onboarding/
      └── OnboardingFlow.tsx
```

---

## 🎯 IMPLEMENTATION ORDER

### **Day 1-2**: Cleanup
1. Delete RAGChatbot.tsx
2. Add environment variables
3. Fix API interceptor
4. Add Error Boundary

### **Day 3-4**: Navigation
1. Create new navigation structure
2. Update routes
3. Create component folders

### **Day 5-7**: Landing & Onboarding
1. Redesign landing page
2. Create onboarding flow

### **Day 8-10**: Safety Features
1. Emergency card
2. Medication tracker

### **Day 11-15**: Core Features
1. Home dashboard
2. My People
3. My Day
4. Ask Moments

### **Day 16-20**: Enhanced Features
1. My Places
2. My Memories
3. Voice notes
4. Quick facts

### **Day 21-25**: Advanced Features
1. Search
2. Family sharing
3. Export/print
4. Smart reminders

### **Day 26-30**: Polish
1. Loading states
2. Accessibility
3. Optimization
4. Testing

---

## 🔧 TECHNICAL CHANGES CHECKLIST

### Backend Changes Needed:
- [ ] Add emergency_info table/fields
- [ ] Add medications table
- [ ] Add routines table
- [ ] Add people table (or extend memory_photos)
- [ ] Add memory_stories table
- [ ] Add quick_facts to user
- [ ] Add family_groups table
- [ ] Add voice_notes table
- [ ] Add search endpoint
- [ ] Add chat history endpoint

### Frontend Changes Needed:
- [ ] Update all routes
- [ ] Update all navigation
- [ ] Transform all pages
- [ ] Add new components
- [ ] Update API services
- [ ] Add new hooks
- [ ] Update design system
- [ ] Add utilities

---

## 📋 COMPONENT MAPPING

| Current Component | New Component | Status |
|------------------|---------------|--------|
| DashboardPage | HomePage | Transform |
| MemoryVaultPage | MyPeoplePage | Transform |
| RemindersPage | MyDayPage | Transform |
| ChatPage | AskMomentsPage | Transform |
| ChatBot | ChatInterface | Improve |
| LocationsPage | MyPlacesPage | Transform |
| RAGChatbot | ❌ | Delete |
| ❌ | EmergencyCard | Create |
| ❌ | MedicationList | Create |
| ❌ | MyMemoriesPage | Create |
| ❌ | OnboardingFlow | Create |

---

## 🎨 DESIGN CHANGES

### Typography:
- **Current**: Various sizes
- **New**: Consistent scale (18px+ body, 24px+ headings)

### Colors:
- **Current**: Good (keep)
- **New**: Add accessibility variants

### Spacing:
- **Current**: Inconsistent
- **New**: 4px base unit system

### Components:
- **Current**: Mixed styles
- **New**: Consistent Shadcn UI patterns

---

## 🚀 START HERE

1. **Read** `IMPLEMENTATION_ROADMAP.md` completely
2. **Set up** environment variables
3. **Delete** unused code
4. **Fix** critical issues (Phase 0)
5. **Build** new navigation (Phase 1)
6. **Transform** features one by one (Phase 4)
7. **Add** new features (Phase 3, 5, 6)
8. **Polish** everything (Phase 7)

**Remember**: Work phase by phase, test continuously, and keep the user's needs in mind at every step.


# Moments - Memory Care Companion Platform

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Setup Instructions](#setup-instructions)
5. [Complete User Flows](#complete-user-flows)
6. [Testing Guide](#testing-guide)
7. [API Documentation](#api-documentation)
8. [Architecture](#architecture)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Moments** is a compassionate memory care companion platform designed to help people with dementia and their caregivers navigate daily life with dignity, safety, and connection.

### Vision

To create a gentle, user-centered platform that:
- Helps people remember what matters most
- Provides safety-critical information instantly
- Connects families and caregivers
- Reduces stress and worry for everyone involved

### Target Users

**Primary User:** Person with dementia (age 65+)
- Needs help remembering people, places, routines
- Requires gentle guidance and reminders
- Values simplicity and clarity

**Secondary User:** Caregiver (family member, professional)
- Sets up and manages the account
- Monitors wellbeing and safety
- Coordinates care with family

---

## ✨ Features

### 🏠 Core Features

#### 1. **Home Dashboard** (`/home`)
- Personalized greeting with current date
- Today's schedule overview (next 3 items)
- Quick access to all features
- Emergency card widget (always visible)
- Medication tracking widget
- Quick actions for common tasks

#### 2. **My Day** (`/my-day`)
- Visual timeline view (Morning/Afternoon/Evening)
- Daily reminders and routines
- Completion tracking
- Smart reminders (location-based, activity-based, weather-based, context-aware)
- Regular time-based reminders
- Export daily routine to PDF

#### 3. **My People** (`/my-people`)
- People gallery with photos and relationships
- Person detail pages with memories
- "Who is this?" photo search flow
- Face recognition for person identification
- Quick facts per person
- Voice notes about people
- Add/edit/delete people

#### 4. **Ask Moments** (`/ask-moments`)
- Personalized AI assistant
- Natural language questions
- Context-aware responses using uploaded documents
- Suggested questions
- Voice input/output (speech recognition & synthesis)
- Chat history persistence (localStorage + API sync)
- Document upload and management

#### 5. **My Memories** (`/my-memories`)
- Photo gallery with collections
- Organize by: All, People, Places, Time, Stories
- Add memories with photos and descriptions
- Voice notes attached to memories
- Memory detail pages
- Export memory book to PDF
- Search memories

#### 6. **My Places** (`/my-places`)
- List of important places (Home, Doctor, Pharmacy, etc.)
- Interactive map view
- Place detail pages
- Safety features ("I'm here", "Take me home")
- Current location tracking
- Add/edit/delete places

#### 7. **Safety & Emergency** (`/safety`)
- Emergency information card
- Emergency contacts with direct call links
- Medical conditions and allergies
- Current medications list
- Doctor information
- Home address
- Print/export emergency card (wallet-sized PDF)
- Always accessible from navbar

#### 8. **Medications** (`/medications`)
- Medication list with details
- Dosage and frequency tracking
- Medication intake tracking (taken/not taken)
- Refill date reminders
- Doctor and pharmacy information
- Export medication schedule to PDF
- Visual feedback for taken medications

#### 9. **Family Sharing** (`/family`)
- Create family groups
- Invite family members
- Role-based access (Owner, Caregiver, Viewer)
- Activity feed
- Accept/reject invitations
- Remove members

#### 10. **Quick Facts** (Profile)
- Name, address, birthday, phone
- Editable from dashboard
- Quick access to key information

#### 11. **Voice Notes**
- Record voice notes about people, memories, or reminders
- Playback functionality
- Attach to memories or people
- Delete voice notes

#### 12. **Global Search** (`Ctrl+K` or `Cmd+K`)
- Search across all content types
- Filter by type (People, Memories, Reminders, Places, Documents)
- Recent searches
- Quick navigation to results

### 🎨 UI/UX Features

- **Responsive Design:** Mobile-first, works on all devices
- **Accessibility:** ARIA labels, keyboard navigation, focus management
- **Loading States:** Skeleton loaders for better perceived performance
- **Error Handling:** User-friendly error messages with recovery options
- **Toast Notifications:** Non-blocking feedback for all actions
- **Confirmation Dialogs:** Custom dialogs instead of browser alerts
- **Code Splitting:** Route-based lazy loading for faster initial load
- **Image Optimization:** Lazy loading, compression, blur placeholders
- **Caching:** In-memory cache for API responses
- **Request Cancellation:** Automatic cleanup on component unmount

### 🔔 Notification Features

- **Reminder Notifications:** Browser notifications with sounds
- **Interactive Notifications:** Mark done or snooze from notification
- **Custom Sounds:** Different notification sounds (gentle chime, soft bell, piano)
- **Continuous Alerts:** Reminders play until acknowledged

### 📱 Export & Print Features

- **Emergency Card PDF:** Wallet-sized emergency information
- **Medication Schedule PDF:** A4 format medication list
- **Daily Routine PDF:** Print-friendly daily schedule
- **Memory Book PDF:** Export memory collections
- **Print Views:** Print-friendly layouts for all major pages

---

## 🛠 Tech Stack

### Frontend

- **Framework:** React 18.3+ with TypeScript
- **Build Tool:** Vite 5.4+
- **Routing:** React Router DOM 7.9+
- **UI Components:** Shadcn UI (Radix UI primitives)
- **Styling:** Tailwind CSS 3.4+
- **Animations:** Framer Motion 12.23+
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Maps:** Leaflet & React Leaflet
- **PDF Generation:** jsPDF & html2canvas
- **Voice:** Web Speech API (Speech Recognition & Synthesis)

### Backend

- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Authentication:** JWT (JSON Web Tokens)
- **AI/ML:** 
  - Google Gemini API (for RAG/chat)
  - FAISS (vector similarity search)
  - Face Recognition (face_recognition library)
- **File Storage:** Local filesystem (`uploads/` directory)
- **Password Hashing:** bcrypt

### Development Tools

- **Package Manager:** npm (frontend), pip (backend)
- **Linting:** ESLint (frontend)
- **Type Checking:** TypeScript (frontend)
- **Version Control:** Git

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** and **npm** (for frontend)
- **PostgreSQL** database (or SQLite for development)
- **Google Gemini API Key** (for AI features)
- **Git** (optional)

### Backend Setup

#### Step 1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/moments_db
# Or for SQLite: sqlite:///./moments.db

# Security
SECRET_KEY=your-secret-key-here-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# FAISS Configuration
FAISS_INDEX_PATH=./faiss_indexes
CHUNK_SIZE=1000
MAX_CONTEXT_LENGTH=3000
SIMILARITY_THRESHOLD=0.7
```

#### Step 5: Initialize Database

The database tables will be created automatically when you start the server.

#### Step 6: Start Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

**Verify:** Visit `http://localhost:8000` - you should see `{"status": "ok", "message": "Welcome to the Moments Life Assistant API!"}`

### Frontend Setup

#### Step 1: Navigate to Frontend Directory

Open a **new terminal window** and navigate to:

```bash
cd frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

#### Step 4: Start Development Server

```bash
npm run dev
```

The frontend application will be available at `http://localhost:5173`

**Verify:** Visit `http://localhost:5173` - you should see the landing page

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 🔄 Complete User Flows

### Flow 1: New User Registration & Onboarding

**Purpose:** Complete account setup for a new user

#### Step 1.1: Landing Page

1. Navigate to `http://localhost:5173`
2. **Expected:** Landing page displays with:
   - Hero section: "Help your loved one remember what matters most"
   - Single CTA button: "Get started for free"
   - Note: "Caregivers can set this up in just a few minutes"
3. Click "Get started for free"
4. **Expected:** Navigated to `/register`

#### Step 1.2: Registration

1. On `/register` page
2. Fill in registration form:
   - **Username:** `testuser` (min 3 characters)
   - **Password:** `testpass123` (min 6 characters)
   - **Confirm Password:** `testpass123`
3. Click "Register" button
4. **Expected:**
   - Success toast notification appears
   - Redirected to `/onboarding`
   - User is logged in automatically

**Edge Cases to Test:**
- ❌ Username too short (< 3 chars) → Error message
- ❌ Password too short (< 6 chars) → Error message
- ❌ Passwords don't match → Error message
- ❌ Username already exists → Error message
- ❌ Network error → Error toast

#### Step 1.3: Onboarding - Step 1: Basic Information

1. On `/onboarding` page
2. **Expected:** Progress bar shows "Step 1 of 6"
3. Fill in:
   - **Person's Name:** `Sarah Johnson`
   - **Your Relationship:** `Daughter` (or select from dropdown)
   - **Photo:** (Optional) Click to upload a photo
4. Click "Next" button
5. **Expected:**
   - Progress bar updates to "Step 2 of 6"
   - Form data saved (check localStorage or network tab)
   - Moves to Step 2

**Edge Cases:**
- ❌ Missing name → "Name is required" error
- ❌ Missing relationship → "Relationship is required" error
- ✅ Photo upload works (JPG, PNG, WebP)
- ❌ Photo too large (> 5MB) → Error message

#### Step 1.4: Onboarding - Step 2: Emergency Information

1. **Expected:** Emergency info form displays
2. Fill in:
   - **Emergency Contact 1:**
     - Name: `David Johnson`
     - Phone: `555-1234`
     - Relationship: `Son`
   - Click "Add another contact"
   - **Emergency Contact 2:**
     - Name: `Dr. Smith`
     - Phone: `555-5678`
     - Relationship: `Doctor`
   - **Medical Conditions:** `Diabetes, High Blood Pressure`
   - **Allergies:** `Penicillin`
   - **Current Medications:** `Metformin 500mg, Lisinopril 10mg`
   - **Doctor's Name:** `Dr. Smith`
   - **Doctor's Phone:** `555-5678`
   - **Home Address:** `123 Main St, Portland, OR 97201`
3. Click "Next"
4. **Expected:**
   - Data saves to backend (check network tab for POST to `/emergency/`)
   - Success toast appears
   - Moves to Step 3

**Edge Cases:**
- ❌ Missing emergency contact → Error message
- ❌ Invalid phone number → Validation error
- ✅ Can add multiple contacts
- ✅ Can remove contacts
- ✅ Optional fields can be empty

#### Step 1.5: Onboarding - Step 3: Important People

1. **Expected:** People form displays
2. Click "Add person" button
3. Fill in:
   - **Name:** `Emma Johnson`
   - **Relationship:** `Granddaughter`
   - **Photo:** (Optional) Upload photo
4. Click "Add person" again
5. Fill in:
   - **Name:** `John Johnson`
   - **Relationship:** `Son`
6. **Expected:** Both people appear in list
7. Click "Next"
8. **Expected:** Moves to Step 4

**Edge Cases:**
- ✅ Can add multiple people
- ✅ Can remove people from list
- ✅ Photo upload works
- ❌ Missing name → Error message
- ❌ Missing relationship → Error message

#### Step 1.6: Onboarding - Step 4: Daily Routines

1. **Expected:** Routines placeholder page
2. Read information about routines
3. Click "Next"
4. **Expected:** Moves to Step 5

#### Step 1.7: Onboarding - Step 5: Important Places

1. **Expected:** Places placeholder page
2. Read information about places
3. Click "Next"
4. **Expected:** Moves to Step 6

#### Step 1.8: Onboarding - Step 6: Complete

1. **Expected:** Completion page with summary
2. Review all entered information
3. Click "Complete Setup" button
4. **Expected:**
   - Success toast appears
   - Redirected to `/home` (dashboard)
   - All data persists in backend

**Verification:**
- ✅ Emergency info accessible at `/safety`
- ✅ People visible at `/my-people`
- ✅ User can navigate freely

---

### Flow 2: Authentication & Session Management

**Purpose:** Test login, logout, and session handling

#### Step 2.1: Login with Existing Account

1. Navigate to `/auth` or click "Sign in" from landing page
2. Fill in:
   - **Username:** `testuser`
   - **Password:** `testpass123`
3. Click "Sign in"
4. **Expected:**
   - Success toast appears
   - Redirected to `/home`
   - Token saved in localStorage
   - User info loaded

**Edge Cases:**
- ❌ Wrong password → Error message
- ❌ Wrong username → Error message
- ❌ Empty fields → Validation errors
- ✅ "Remember me" functionality (if implemented)

#### Step 2.2: Session Persistence

1. After logging in, refresh the page (`F5`)
2. **Expected:**
   - Still logged in
   - Token persists
   - User data loads automatically
   - No redirect to login

#### Step 2.3: Token Expiration Handling

1. Manually expire token (set `ACCESS_TOKEN_EXPIRE_MINUTES=1` in backend, wait 1 minute)
2. Try to make an API call (e.g., navigate to `/medications`)
3. **Expected:**
   - 401 error detected
   - Token removed from localStorage
   - Redirected to `/auth`
   - Error toast appears

#### Step 2.4: Logout

1. Click user menu/logout button (if available) or manually clear token
2. Navigate to any protected route
3. **Expected:** Redirected to `/auth`

---

### Flow 3: Home Dashboard

**Purpose:** Test dashboard functionality and navigation

#### Step 3.1: Dashboard Initial Load

1. Navigate to `/home` (or `/dashboard` should redirect)
2. **Expected:** Dashboard displays with:
   - **Today's Focus:**
     - Current date (e.g., "Today is Tuesday, January 15, 2024")
     - Personalized greeting (Good morning/afternoon/evening)
   - **Today's Schedule:**
     - Next 3 reminders (if any)
     - "View full schedule" button
   - **Quick Actions:** 6 action buttons
   - **Quick Access Cards:** 3 cards
   - **Emergency Card Widget:** Compact version
   - **Medications Widget:** Count of medications

**Edge Cases:**
- ✅ Empty state: No reminders → Shows "No reminders scheduled for today"
- ✅ Empty state: No medications → Shows "0 medications"
- ✅ Loading state: Shows skeleton loaders

#### Step 3.2: Dashboard Navigation

Test each navigation element:

1. **Click Emergency Card Widget**
   - **Expected:** Navigates to `/safety`

2. **Click Medications Widget**
   - **Expected:** Navigates to `/medications`

3. **Click "View full schedule"**
   - **Expected:** Navigates to `/my-day`

4. **Click Quick Action: "Ask Moments"**
   - **Expected:** Navigates to `/ask-moments`

5. **Click Quick Action: "Add Document"**
   - **Expected:** Navigates to `/ask-moments` with documents tab active

6. **Click Quick Action: "My People"**
   - **Expected:** Navigates to `/my-people`

7. **Click Quick Action: "Medications"**
   - **Expected:** Navigates to `/medications`

8. **Click Quick Action: "My Places"**
   - **Expected:** Navigates to `/my-places`

9. **Click Quick Action: "My Day"**
   - **Expected:** Navigates to `/my-day`

10. **Click Quick Access Card: "My People"**
    - **Expected:** Navigates to `/my-people`

11. **Click Quick Access Card: "My Places"**
    - **Expected:** Navigates to `/my-places`

12. **Click Quick Access Card: "My Information"**
    - **Expected:** Opens Quick Facts dialog or navigates to profile

**Expected Results:**
- ✅ All navigation works correctly
- ✅ No broken links
- ✅ Active states highlight correctly

#### Step 3.3: Dashboard Data Updates

1. Add a medication via `/medications`
2. Return to `/home`
3. **Expected:** Medications widget shows updated count
4. Add a reminder via `/my-day`
5. Return to `/home`
6. **Expected:** Today's Schedule shows the new reminder

---

### Flow 4: Emergency Information Management

**Purpose:** Test emergency info CRUD operations

#### Step 4.1: View Emergency Card from Dashboard

1. Navigate to `/home`
2. **Expected:** Emergency Card widget visible (red border, prominent)
3. Click the Emergency Card widget
4. **Expected:** Navigated to `/safety`

#### Step 4.2: View Full Emergency Info Page

1. On `/safety` page
2. **Expected:** Full emergency card displays:
   - Person's name
   - All emergency contacts with phone numbers (clickable)
   - Medical conditions
   - Allergies
   - Current medications
   - Doctor information
   - Home address
   - "Edit" button
   - "Print" button
   - "Export PDF" button

#### Step 4.3: Edit Emergency Information

1. Click "Edit" button
2. **Expected:** Dialog opens with pre-filled form
3. Modify fields:
   - Change allergies to: `Penicillin, Peanuts`
   - Add new emergency contact:
     - Name: `Neighbor Jane`
     - Phone: `555-9999`
     - Relationship: `Neighbor`
   - Update medical conditions: `Diabetes, High Blood Pressure, Arthritis`
4. Click "Save Changes"
5. **Expected:**
   - Success toast: "Emergency information updated"
   - Dialog closes
   - Information updates immediately
   - Changes persist after page refresh
   - API call: PUT `/emergency/` with updated data

**Edge Cases:**
- ❌ Remove all emergency contacts → Error: "At least one emergency contact required"
- ❌ Invalid phone number format → Validation error
- ✅ Can add up to 5+ contacts
- ✅ Can remove contacts
- ✅ Optional fields can be cleared

#### Step 4.4: Print Emergency Card

1. Click "Print" button
2. **Expected:**
   - Print preview opens
   - Formatted emergency card displays
   - All information visible
   - Print dialog appears

#### Step 4.5: Export Emergency Card PDF

1. Click "Export PDF" button (or Export dialog)
2. **Expected:**
   - Loading state shows
   - PDF downloads automatically
   - File name: `emergency_card.pdf`
   - Wallet-sized format
   - All information included
   - Success toast appears

#### Step 4.6: Access from Navbar

1. Look for red "Emergency" button in navbar (desktop) or menu (mobile)
2. Click button
3. **Expected:** Navigated to `/safety`

#### Step 4.7: Emergency Card Widget on Dashboard

1. Return to `/home`
2. **Expected:** Emergency card widget shows:
   - Person's name
   - "View Emergency Info" button or clickable area
3. Click widget
4. **Expected:** Navigates to `/safety`

---

### Flow 5: Medication Management

**Purpose:** Test complete medication lifecycle

#### Step 5.1: Navigate to Medications

1. From `/home`, click Medications widget OR
2. Navigate to `/medications` directly OR
3. Click "Medications" in sidebar/bottom nav
4. **Expected:** Medications page loads

#### Step 5.2: View Empty State

1. If no medications exist
2. **Expected:**
   - Empty state message: "No medications added yet"
   - "Add Medication" button visible
   - Helpful text about adding medications

#### Step 5.3: Add First Medication

1. Click "Add Medication" button
2. **Expected:** Dialog opens with medication form
3. Fill in form:
   - **Medication Name:** `Metformin` *
   - **Dosage:** `500mg tablet` *
   - **Frequency:** Select "Twice daily" *
   - **Time:** `08:00` *
   - **What it's for:** `For diabetes`
   - **Prescribed by:** `Dr. Smith`
   - **Pharmacy:** `CVS Pharmacy`
   - **Refill Date:** Select date 30 days from now
4. Click "Save Medication"
5. **Expected:**
   - Success toast: "Medication added"
   - Dialog closes
   - Medication card appears in list
   - Card shows:
     - Name: Metformin
     - Dosage: 500mg tablet
     - Time: 8:00 AM
     - Frequency: Twice daily
     - Track button (circle icon)
     - Edit button
     - Delete button
   - API call: POST `/medications/` with medication data
   - Medication persists after refresh

**Edge Cases:**
- ❌ Missing required fields (*) → Error messages
- ❌ Invalid time format → Validation error
- ✅ Optional fields can be empty
- ✅ Can add multiple medications

#### Step 5.4: Add Second Medication

1. Click "Add Medication"
2. Fill in:
   - **Name:** `Lisinopril`
   - **Dosage:** `10mg tablet`
   - **Frequency:** `Once daily`
   - **Time:** `09:00`
   - **What it's for:** `For blood pressure`
3. Click "Save Medication"
4. **Expected:** Second medication card appears below first

#### Step 5.5: Track Medication Intake

1. Find `Metformin` card
2. **Expected:** Circle icon (not taken) visible
3. Click the circle icon
4. **Expected:**
   - Icon changes to green checkmark
   - Card background updates (green tint)
   - Card shows "Taken" badge
   - Success toast: "Marked as taken"
   - API call: POST `/medications/{id}/track` with `{"taken": true}`
   - Medication text shows strikethrough
5. Click checkmark again
6. **Expected:**
   - Reverts to circle icon
   - Card background returns to normal
   - Success toast: "Marked as not taken"
   - API call: POST `/medications/{id}/track` with `{"taken": false}`

**Edge Cases:**
- ✅ Visual feedback is immediate (optimistic update)
- ✅ API errors revert the UI change
- ✅ Multiple medications can be tracked independently

#### Step 5.6: Edit Medication

1. Click "Edit" button on `Metformin` card
2. **Expected:** Dialog opens with pre-filled form
3. Modify:
   - Change dosage to: `1000mg tablet`
   - Change frequency to: `Once daily`
   - Update time to: `07:00`
4. Click "Save Medication"
5. **Expected:**
   - Success toast: "Medication updated"
   - Dialog closes
   - Card updates immediately
   - Changes persist after refresh
   - API call: PUT `/medications/{id}` with updated data

**Edge Cases:**
- ✅ Only changed fields sent to API
- ✅ No changes → Toast: "No changes were made"
- ❌ Invalid data → Validation errors

#### Step 5.7: Delete Medication

1. Click trash icon on `Lisinopril` card
2. **Expected:** Confirmation dialog appears:
   - Title: "Delete Medication"
   - Description: "Are you sure you want to delete this medication?"
   - "Cancel" and "Delete" buttons
3. Click "Delete"
4. **Expected:**
   - Medication removed from list immediately
   - Success toast: "Medication deleted"
   - API call: DELETE `/medications/{id}`
   - Medication stays deleted after refresh

**Edge Cases:**
- ✅ Click "Cancel" → Dialog closes, medication remains
- ✅ Can delete multiple medications
- ❌ Network error → Error toast, medication remains

#### Step 5.8: Export Medication Schedule

1. Ensure at least one medication exists
2. Click "Export PDF" button (or Export dialog)
3. **Expected:**
   - Loading state shows
   - PDF downloads automatically
   - File name: `medication_schedule.pdf`
   - A4 format table with all medications
   - Includes: Name, Dosage, Frequency, Time, Purpose
   - Success toast appears

#### Step 5.9: Medication Widget on Dashboard

1. Return to `/home`
2. **Expected:** Medications widget shows:
   - Count of medications (e.g., "2 medications")
   - Clickable to navigate to `/medications`
3. Click widget
4. **Expected:** Navigates to `/medications`

---

### Flow 6: My Day (Reminders & Routines)

**Purpose:** Test reminder management and daily schedule

#### Step 6.1: Navigate to My Day

1. Navigate to `/my-day` (or `/reminders` should redirect)
2. **Expected:** My Day page loads with:
   - Page title: "Your day, organized and clear"
   - Timeline view (Morning/Afternoon/Evening sections)
   - "Add Reminder" button
   - "Export PDF" button (if reminders exist)

#### Step 6.2: View Empty State

1. If no reminders exist
2. **Expected:**
   - Empty timeline view
   - Message: "No reminders scheduled for today"
   - "Add Reminder" button visible

#### Step 6.3: Add Regular Reminder

1. Click "Add Reminder" button
2. **Expected:** Dialog opens with tabs: "Regular" and "Smart"
3. Click "Regular" tab (default)
4. Fill in reminder form:
   - **Title:** `Take morning medication` *
   - **Description:** `Remember to take Metformin`
   - **Date:** Select today's date
   - **Time:** `08:00` *
   - **Notification Sound:** Select "Gentle chime"
5. Click "Create Reminder"
6. **Expected:**
   - Success toast: "Reminder created"
   - Dialog closes
   - Reminder appears in timeline under "Morning" section
   - Shows time, title, description
   - API call: POST `/reminders/` with reminder data
   - Reminder persists after refresh

**Edge Cases:**
- ❌ Missing title → Error message
- ❌ Missing time → Error message
- ✅ Date optional (defaults to today)
- ✅ Description optional
- ✅ Can add multiple reminders

#### Step 6.4: Add Smart Reminder (Location-Based)

1. Click "Add Reminder"
2. Click "Smart" tab
3. Select reminder type: `Location`
4. Fill in:
   - **Title:** `Call doctor when at pharmacy`
   - **Description:** `Pick up prescription and call doctor`
   - **Location:** Select "Pharmacy" (or add new)
   - **Radius:** `100` meters
5. Click "Create Reminder"
6. **Expected:**
   - Success toast appears
   - Reminder created with `reminder_type: "location"`
   - `trigger_conditions` includes location data
   - API call includes `reminder_type` and `trigger_conditions`

#### Step 6.5: Add Smart Reminder (Activity-Based)

1. Click "Add Reminder" → "Smart" tab
2. Select type: `Activity`
3. Fill in:
   - **Title:** `Take medication after breakfast`
   - **Activity:** `After breakfast`
4. Click "Create Reminder"
5. **Expected:** Reminder created with activity trigger

#### Step 6.6: Add Smart Reminder (Weather-Based)

1. Click "Add Reminder" → "Smart" tab
2. Select type: `Weather`
3. Fill in:
   - **Title:** `Wear jacket if raining`
   - **Weather Condition:** `Rainy`
4. Click "Create Reminder"
5. **Expected:** Reminder created with weather trigger

#### Step 6.7: Add Smart Reminder (Context-Based)

1. Click "Add Reminder" → "Smart" tab
2. Select type: `Context`
3. Fill in:
   - **Title:** `Weekly doctor appointment`
   - **Day:** `Monday`
   - **Time:** `10:00`
4. Click "Create Reminder"
5. **Expected:** Reminder created with context trigger

#### Step 6.8: View Timeline

1. **Expected:** Timeline displays reminders grouped by:
   - **Morning:** 6:00 AM - 12:00 PM
   - **Afternoon:** 12:00 PM - 6:00 PM
   - **Evening:** 6:00 PM - 12:00 AM
2. Each reminder shows:
   - Time (formatted: "8:00 AM")
   - Title
   - Description (if available)
   - Status badge (Pending/Completed)
   - Action buttons (Complete, Delete)

#### Step 6.9: Complete Reminder

1. Find a reminder in timeline
2. Click "Complete" button or checkbox
3. **Expected:**
   - Reminder status changes to "Completed"
   - Visual indicator (checkmark, strikethrough)
   - Success toast: "Reminder marked as complete"
   - API call: POST `/reminders/{id}/complete`
   - Optimistic update (immediate UI change)

**Edge Cases:**
- ✅ Can uncomplete (if API supports)
- ✅ Multiple reminders can be completed
- ❌ Network error → Reverts to pending state

#### Step 6.10: Delete Reminder

1. Click "Delete" button on a reminder
2. **Expected:** Confirmation dialog appears
3. Click "Delete" in dialog
4. **Expected:**
   - Reminder removed from timeline
   - Success toast: "Reminder removed"
   - API call: DELETE `/reminders/{id}`
   - Reminder stays deleted after refresh

#### Step 6.11: Edit Reminder

1. Click "Edit" button on a reminder (if available)
2. **Expected:** Dialog opens with pre-filled form
3. Modify fields
4. Click "Save"
5. **Expected:** Reminder updates in timeline

#### Step 6.12: Export Daily Routine PDF

1. Ensure at least one reminder exists
2. Click "Export PDF" button
3. **Expected:**
   - PDF downloads
   - File name: `daily_routine.pdf`
   - Print-friendly format
   - All reminders listed
   - Success toast appears

#### Step 6.13: Reminder Notifications

1. Create a reminder for current time + 1 minute
2. Wait for notification time
3. **Expected:**
   - Browser notification appears
   - Notification sound plays (if enabled)
   - Notification shows reminder title and description
   - Dialog appears: "Mark Done" or "Snooze"
4. Click "Mark Done"
5. **Expected:**
   - Reminder marked as complete
   - Notification closes
   - Sound stops

**Edge Cases:**
- ✅ Notification permission requested on first use
- ✅ Snooze works (reminder reappears after 5 minutes)
- ✅ Multiple notifications handled correctly

---

### Flow 7: My People

**Purpose:** Test people management and identification

#### Step 7.1: Navigate to My People

1. Navigate to `/my-people` (or `/memory-vault` should redirect)
2. **Expected:** My People page loads with:
   - Three tabs: "Gallery", "Add Person", "Who is this?"
   - Gallery tab active by default
   - Empty state if no people exist

#### Step 7.2: View Empty State

1. If no people exist
2. **Expected:**
   - Empty state message: "No people added yet"
   - "Add Person" tab available
   - Helpful text about adding people

#### Step 7.3: Add Person via Gallery Tab

1. Click "Add Person" tab
2. **Expected:** Add person form displays
3. Fill in:
   - **Name:** `Emma Johnson` *
   - **Relationship:** `Granddaughter` *
   - **Photo:** Upload photo (optional but recommended)
4. Click "Add Person"
5. **Expected:**
   - Success toast: "Person added"
   - Person appears in Gallery tab
   - Person card shows:
     - Photo (or placeholder icon)
     - Name: Emma Johnson
     - Relationship: Granddaughter
     - Clickable to view details
   - API call: POST `/memories/photos` (if photo uploaded)
   - Person persists after refresh

**Edge Cases:**
- ❌ Missing name → Error message
- ❌ Missing relationship → Error message
- ✅ Photo optional
- ✅ Can add multiple people
- ❌ Duplicate names → Allowed (but may cause confusion)

#### Step 7.4: Add Person via Add Person Tab

1. Ensure "Add Person" tab is active
2. Fill in form and submit
3. **Expected:** Same as Step 7.3

#### Step 7.5: View Person Detail Page

1. Click on a person card in Gallery
2. **Expected:** Navigated to `/my-people/Emma%20Johnson`
3. **Expected:** Person detail page shows:
   - Large photo (or placeholder)
   - Name: Emma Johnson
   - Relationship: Granddaughter
   - "Memories" section (photos with this person)
   - "Voice Notes" section
   - "Back" button
   - "Edit" button (if available)

#### Step 7.6: Add Memory to Person

1. On person detail page
2. Click "Add Memory" or navigate to `/my-memories`
3. Upload photo and add description mentioning person's name
4. **Expected:** Memory appears in person's memories section

#### Step 7.7: Add Voice Note to Person

1. On person detail page
2. Scroll to "Voice Notes" section
3. Click "Record" button
4. **Expected:** Voice recorder appears
5. Click "Start Recording"
6. **Expected:**
   - Recording indicator shows
   - Timer counts up
   - Microphone permission requested (if first time)
7. Speak: "Emma is my granddaughter. She loves to visit on weekends."
8. Click "Stop Recording"
9. **Expected:**
   - Recording stops
   - Playback controls appear
   - "Save" button available
10. Click "Save"
11. **Expected:**
    - Success toast: "Voice note saved"
    - Voice note appears in list
    - Can play back immediately
    - API call: POST `/voice-notes/` with person_id

**Edge Cases:**
- ❌ Microphone permission denied → Error toast
- ✅ Can record multiple voice notes
- ✅ Can delete voice notes
- ✅ Playback works correctly

#### Step 7.8: Who Is This? Flow

1. Click "Who is this?" tab
2. **Expected:** Photo upload interface
3. Click "Upload Photo" or drag & drop
4. Select a photo with a person's face
5. **Expected:**
   - Photo uploads
   - Face recognition processes image
   - Results show:
     - Matched person (if found)
     - Confidence score
     - Person card with details
   - Or: "No match found" message

**Edge Cases:**
- ✅ Multiple faces in photo → Shows all matches
- ✅ No face detected → Error message
- ✅ Person not in database → "No match found"
- ✅ Low confidence match → Shows confidence score

#### Step 7.9: Search People

1. Use global search (`Ctrl+K` or `Cmd+K`)
2. Type person's name: `Emma`
3. **Expected:**
   - Person appears in search results
   - Can click to navigate to person detail page

#### Step 7.10: Edit Person

1. On person detail page, click "Edit" (if available)
2. **Expected:** Edit form opens
3. Modify:
   - Change relationship to: `Granddaughter & Caregiver`
   - Update photo
4. Click "Save"
5. **Expected:** Changes reflect immediately

#### Step 7.11: Delete Person

1. On person detail page or gallery
2. Click "Delete" button
3. **Expected:** Confirmation dialog appears
4. Click "Delete"
5. **Expected:**
   - Person removed from gallery
   - Success toast appears
   - Related memories remain (but person link removed)

---

### Flow 8: Ask Moments (AI Chat Assistant)

**Purpose:** Test AI chat functionality and document management

#### Step 8.1: Navigate to Ask Moments

1. Navigate to `/ask-moments` (or `/chatbot` should redirect)
2. **Expected:** Ask Moments page loads with:
   - Two tabs: "Conversation" and "Documents"
   - Conversation tab active
   - Welcome message from Moments
   - Suggested questions visible
   - Chat input at bottom

#### Step 8.2: View Empty State (No Documents)

1. If no documents uploaded
2. **Expected:**
   - Yellow banner: "Add a document to begin chatting"
   - Welcome message explains need for documents
   - "Upload a PDF" button visible

#### Step 8.3: Upload Document

1. Click "Documents" tab
2. **Expected:** Document upload interface
3. **Option A: Drag & Drop**
   - Drag a PDF file onto the drop zone
4. **Option B: Browse**
   - Click "browse your files"
   - Select a PDF file
5. **Expected:**
   - File uploads
   - Loading indicator shows
   - Success toast: "Document uploaded successfully"
   - Document appears in library list
   - Shows filename and upload date
   - API call: POST `/rag/documents/upload`
   - Document processing happens in background

**Edge Cases:**
- ❌ Non-PDF file → Error: "Please upload a PDF file"
- ❌ File too large (> 10MB) → Error message
- ✅ Multiple documents can be uploaded
- ✅ Document processing may take time

#### Step 8.4: Initialize Demo Library

1. Click "Load demo library" button
2. **Expected:**
   - Loading state shows
   - Demo documents uploaded
   - Success toast appears
   - Multiple documents appear in library

#### Step 8.5: Ask First Question

1. Return to "Conversation" tab
2. **Expected:** Banner disappears (has knowledge base)
3. Type question: `Who is Emma?`
4. Click "Send" or press Enter
5. **Expected:**
   - User message appears in chat
   - Bot typing indicator shows
   - Response appears after processing
   - Response mentions Emma if found in documents
   - Confidence score displayed (if available)
   - Sources used count shown
   - API call: POST `/rag/chat/query`

**Edge Cases:**
- ✅ Empty question → Cannot send
- ✅ Long question → Handles correctly
- ❌ Network error → Error message in chat
- ✅ Response includes relevant information

#### Step 8.6: Use Suggested Questions

1. Click a suggested question (e.g., "What should I do today?")
2. **Expected:**
   - Question auto-fills in input
   - Can edit before sending
   - Or auto-sends (depending on implementation)

#### Step 8.7: Voice Input

1. Click microphone icon
2. **Expected:**
   - Microphone permission requested (if first time)
   - Recording starts
   - Visual indicator shows
3. Speak: "What medications do I take?"
4. **Expected:**
   - Speech recognition processes
   - Text appears in input field
   - Can edit before sending

**Edge Cases:**
- ❌ Microphone permission denied → Error toast
- ❌ Browser doesn't support → Error toast
- ✅ Can stop recording early
- ✅ Can cancel recording

#### Step 8.8: Voice Output (Text-to-Speech)

1. After receiving a bot response
2. Click speaker icon on bot message
3. **Expected:**
   - Bot message reads aloud
   - Words highlight as spoken
   - Can pause/stop playback
   - Speaker icon changes to pause icon

**Edge Cases:**
- ❌ Browser doesn't support → Error toast
- ✅ Can stop playback
- ✅ Multiple messages can be played sequentially

#### Step 8.9: Chat History Persistence

1. Ask several questions
2. Refresh the page (`F5`)
3. **Expected:**
   - All chat messages persist
   - History loads from localStorage immediately
   - Then syncs with API
   - No messages lost

#### Step 8.10: Delete Document

1. Go to "Documents" tab
2. Find a document in the list
3. Click trash icon
4. **Expected:** Confirmation dialog appears
5. Click "Delete"
6. **Expected:**
   - Document removed from list
   - Success toast appears
   - API call: DELETE `/rag/documents/{id}`
   - Document stays deleted after refresh

#### Step 8.11: Reset Knowledge Base

1. In Documents tab
2. Click "Reset Knowledge Base" (if available)
3. **Expected:** Confirmation dialog
4. Confirm
5. **Expected:**
   - All documents deleted
   - Chat history cleared (or preserved, depending on implementation)
   - Success toast appears

---

### Flow 9: My Memories

**Purpose:** Test memory management and collections

#### Step 9.1: Navigate to My Memories

1. Navigate to `/my-memories`
2. **Expected:** My Memories page loads with:
   - Tabs: "All Memories", "By People", "By Places", "By Time", "Stories"
   - "All Memories" tab active
   - Search bar at top
   - "Add Memory" button
   - "Export PDF" button (if memories exist)

#### Step 9.2: View Empty State

1. If no memories exist
2. **Expected:**
   - Empty state message: "No memories yet"
   - "Add Memory" button visible
   - Helpful text about adding memories

#### Step 9.3: Add Memory

1. Click "Add Memory" button
2. **Expected:** Dialog opens with memory form
3. Fill in:
   - **Photo:** Upload photo (required)
   - **Description:** `Family dinner with Emma and John. We had pizza and watched a movie.`
   - **Voice Note:** (Optional) Click "Record" to add voice note
4. Click "Save Memory"
5. **Expected:**
   - Success toast: "Memory added"
   - Dialog closes
   - Memory appears in gallery
   - Memory card shows:
     - Photo thumbnail
     - Description preview
     - Date
     - Clickable to view details
   - API call: POST `/memories/photos`
   - Memory persists after refresh

**Edge Cases:**
- ❌ No photo uploaded → Error: "Photo is required"
- ✅ Description optional
- ✅ Can add voice note
- ✅ Multiple photos can be uploaded (one at a time)

#### Step 9.4: View Memory Detail

1. Click on a memory card
2. **Expected:** Navigated to `/my-memories/{memoryId}`
3. **Expected:** Memory detail page shows:
   - Large photo
   - Full description
   - Date and time
   - "Share" button
   - "Delete" button
   - Voice note player (if attached)
   - "Back" button

#### Step 9.5: View Memories by People

1. Click "By People" tab
2. **Expected:**
   - Memories grouped by people mentioned
   - Each group shows person name and count
   - Memories displayed in grid

#### Step 9.6: View Memories by Places

1. Click "By Places" tab
2. **Expected:**
   - Memories grouped by places mentioned
   - Groups like "Home", "Park", "Restaurant"
   - Memories displayed in grid

#### Step 9.7: View Memories by Time

1. Click "By Time" tab
2. **Expected:**
   - Memories grouped by time periods:
     - "This Week"
     - "This Month"
     - "This Year"
     - "Older"
   - Each group shows count
   - Memories displayed in grid

#### Step 9.8: Search Memories

1. Use search bar at top
2. Type: `Emma`
3. **Expected:**
   - Memories filtered to show only those mentioning "Emma"
   - Results update in real-time
   - Can clear search to show all

#### Step 9.9: Share Memory

1. On memory detail page
2. Click "Share" button
3. **Expected:**
   - Share dialog opens (if browser supports)
   - Or: Link copied to clipboard
   - Success toast: "Memory link copied to clipboard"

#### Step 9.10: Delete Memory

1. On memory detail page
2. Click "Delete" button
3. **Expected:** Confirmation dialog appears
4. Click "Delete"
5. **Expected:**
   - Memory removed from gallery
   - Success toast appears
   - Navigated back to gallery
   - Memory stays deleted after refresh

#### Step 9.11: Export Memory Book PDF

1. Ensure at least one memory exists
2. Click "Export PDF" button
3. **Expected:**
   - PDF downloads
   - File name: `memory_book.pdf`
   - Print-friendly format
   - All memories included
   - Success toast appears

---

### Flow 10: My Places

**Purpose:** Test location management and map features

#### Step 10.1: Navigate to My Places

1. Navigate to `/my-places` (or `/locations` should redirect)
2. **Expected:** My Places page loads with:
   - Two tabs: "List" and "Map"
   - "List" tab active by default
   - "Add Place" button
   - Empty state if no places exist

#### Step 10.2: View Empty State

1. If no places exist
2. **Expected:**
   - Empty state message
   - "Add Place" button visible
   - Map view shows empty map

#### Step 10.3: Add Place - Manual Entry

1. Click "Add Place" button
2. **Expected:** Dialog opens with place form
3. Fill in:
   - **Name:** `Home` *
   - **Description:** `This is where I live`
   - **Latitude:** `45.5152` (or use "Get Current Location")
   - **Longitude:** `-122.6784`
4. Click "Save Place"
5. **Expected:**
   - Success toast: "Place added"
   - Dialog closes
   - Place appears in list
   - Place card shows:
     - Name: Home
     - Description
     - "View Details" button
     - "Delete" button
   - API call: POST `/locations/`
   - Place persists after refresh

**Edge Cases:**
- ❌ Missing name → Error message
- ❌ Invalid coordinates → Validation error
- ✅ Description optional
- ✅ Can add multiple places

#### Step 10.4: Add Place - Get Current Location

1. Click "Add Place"
2. Click "Get Current Location" button
3. **Expected:**
   - Browser requests location permission
   - Coordinates auto-fill
   - Accuracy shown (if available)
4. Fill in name and description
5. Click "Save Place"
6. **Expected:** Place saved with current location

**Edge Cases:**
- ❌ Location permission denied → Error toast
- ❌ Location unavailable → Error message
- ✅ Can manually override coordinates

#### Step 10.5: View Map

1. Click "Map" tab
2. **Expected:**
   - Interactive map displays
   - All saved places shown as markers
   - Current location shown (if available)
   - Map controls (zoom, pan)
   - "Where am I?" button
   - "Take me home" button (if Home place exists)

#### Step 10.6: View Place Detail

1. Click "View Details" on a place card
2. **Expected:** Navigated to `/my-places/{placeId}`
3. **Expected:** Place detail page shows:
   - Place name
   - Description
   - Coordinates
   - Map preview
   - Safety buttons:
     - "I'm here" button
     - "Take me home" button
     - "Share location" button
   - "Back" button

#### Step 10.7: Use Safety Features

1. On place detail page
2. Click "I'm here" button
3. **Expected:**
   - Current location updates
   - Success toast appears
   - Location shared (if family sharing enabled)

4. Click "Take me home" button
5. **Expected:**
   - Opens Google Maps (or default map app)
   - Directions to home address
   - Or: Shows route on map

6. Click "Share location" button
7. **Expected:**
   - Share dialog opens
   - Or: Location link copied to clipboard

#### Step 10.8: Edit Place

1. On place detail page or list
2. Click "Edit" button (if available)
3. **Expected:** Edit form opens
4. Modify:
   - Change description to: `My home address`
   - Update coordinates
5. Click "Save"
6. **Expected:** Changes reflect immediately

#### Step 10.9: Delete Place

1. Click "Delete" button on place card
2. **Expected:** Confirmation dialog appears
3. Click "Delete"
4. **Expected:**
   - Place removed from list
   - Success toast appears
   - API call: DELETE `/locations/{id}`
   - Place stays deleted after refresh

#### Step 10.10: Map Interactions

1. On Map tab
2. Click on a place marker
3. **Expected:** Popup shows place name and details
4. Click "Where am I?" button
5. **Expected:**
   - Current location marker updates
   - Map centers on current location
   - Accuracy circle shown

---

### Flow 11: Family Sharing

**Purpose:** Test family group management and sharing

#### Step 11.1: Navigate to Family Sharing

1. Navigate to `/family`
2. **Expected:** Family Sharing page loads with:
   - Family group information
   - Members list
   - "Invite Member" button
   - Activity feed

#### Step 11.2: View Empty State (No Family Group)

1. If user has no family group
2. **Expected:**
   - Message: "Create a family group" or auto-created
   - Invite functionality available

#### Step 11.3: Invite Family Member

1. Click "Invite Member" button
2. **Expected:** Dialog opens with invite form
3. Fill in:
   - **Email or Username:** `family.member@example.com`
   - **Role:** Select "Caregiver" (or "Viewer")
4. Click "Send Invitation"
5. **Expected:**
   - Success toast: "Invitation sent"
   - Member appears in list with status "Pending"
   - API call: POST `/family/invite`
   - Invitation email sent (if email provided)

**Edge Cases:**
- ❌ Invalid email → Validation error
- ❌ Username doesn't exist → Error message
- ✅ Can invite multiple members
- ✅ Can set different roles

#### Step 11.4: View Family Members

1. **Expected:** Members list shows:
   - Owner (you)
   - Pending invitations
   - Accepted members
   - Each shows:
     - Name/Username
     - Role badge (Owner/Caregiver/Viewer)
     - Status (Pending/Accepted)
     - Actions (Accept/Remove)

#### Step 11.5: Accept Invitation

1. Log in as invited user
2. Navigate to `/family`
3. **Expected:** Pending invitation visible
4. Click "Accept" button
5. **Expected:**
   - Status changes to "Accepted"
   - Success toast appears
   - API call: POST `/family/accept-invite/{memberId}`
   - User can now access shared content

#### Step 11.6: View Activity Feed

1. Scroll to Activity Feed section
2. **Expected:** Recent activities listed:
   - Memory added
   - Reminder created
   - Medication tracked
   - Place added
   - Each shows:
     - Activity type
     - User who performed action
     - Timestamp
     - Details

#### Step 11.7: Remove Family Member

1. As owner, find a member in list
2. Click "Remove" button
3. **Expected:** Confirmation dialog appears
4. Click "Remove"
5. **Expected:**
   - Member removed from list
   - Success toast appears
   - API call: DELETE `/family/members/{memberId}`
   - Member loses access

**Edge Cases:**
- ❌ Cannot remove owner → Error message
- ✅ Can remove pending invitations
- ✅ Can remove accepted members

---

### Flow 12: Quick Facts

**Purpose:** Test profile quick facts management

#### Step 12.1: View Quick Facts on Dashboard

1. Navigate to `/home`
2. **Expected:** Quick Facts card visible (compact version)
3. Shows:
   - Name (if set)
   - Address (if set)
   - Birthday (if set)
   - Phone (if set)
   - Edit button

#### Step 12.2: Edit Quick Facts

1. Click edit icon on Quick Facts card
2. **Expected:** Dialog opens with form
3. Fill in:
   - **Name:** `Sarah Johnson`
   - **Address:** `123 Main St, Portland, OR 97201`
   - **Birthday:** `1948-05-15`
   - **Phone:** `555-1234`
4. Click "Save"
5. **Expected:**
   - Success toast: "Quick facts updated"
   - Dialog closes
   - Card updates immediately
   - API call: PUT `/users/me/quick-facts`
   - Changes persist after refresh

**Edge Cases:**
- ✅ All fields optional
- ✅ Can clear fields (set to empty string)
- ✅ Date format: YYYY-MM-DD
- ✅ Phone format flexible

---

### Flow 13: Global Search

**Purpose:** Test global search functionality

#### Step 13.1: Open Search

1. Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
2. **Expected:** Search overlay opens
3. **Or:** Click search icon in navbar
4. **Expected:** Same search overlay

#### Step 13.2: Search All Content

1. Type search query: `Emma`
2. **Expected:**
   - Results appear grouped by type:
     - People (if name matches)
     - Memories (if mentioned)
     - Reminders (if in title/description)
     - Places (if mentioned)
   - Each result shows:
     - Icon
     - Title
     - Description/preview
     - Clickable to navigate

#### Step 13.3: Filter Search Results

1. Type query: `medication`
2. Click filter: "Reminders"
3. **Expected:** Only reminder results shown
4. Click filter: "All"
5. **Expected:** All results shown again

#### Step 13.4: Navigate from Search

1. Click on a search result
2. **Expected:**
   - Search overlay closes
   - Navigated to relevant page
   - Item highlighted/selected

#### Step 13.5: Recent Searches

1. Perform multiple searches
2. Open search again
3. **Expected:** Recent searches shown at top
4. Click recent search
5. **Expected:** Search executes again

**Edge Cases:**
- ✅ Empty query → Shows recent searches or suggestions
- ✅ No results → Shows "No results found"
- ✅ Special characters handled correctly
- ✅ Case-insensitive search

---

### Flow 14: Voice Notes

**Purpose:** Test voice note recording and playback

#### Step 14.1: Record Voice Note (From Person Detail)

1. Navigate to `/my-people/Emma%20Johnson`
2. Scroll to "Voice Notes" section
3. Click "Record" button
4. **Expected:** Voice recorder interface appears
5. Click "Start Recording"
6. **Expected:**
   - Recording indicator shows
   - Timer counts up
   - Microphone permission requested
7. Speak: "Emma loves visiting on weekends. She brings her dog Max."
8. Click "Stop Recording"
9. **Expected:**
   - Recording stops
   - Playback controls appear
   - Can preview recording
10. Click "Save"
11. **Expected:**
    - Success toast: "Voice note saved"
    - Voice note appears in list
    - API call: POST `/voice-notes/` with person_id

#### Step 14.2: Play Voice Note

1. Find saved voice note in list
2. Click "Play" button
3. **Expected:**
   - Audio plays
   - Progress bar shows playback progress
   - Can pause/resume
   - Can seek
   - Time display updates

#### Step 14.3: Delete Voice Note

1. Click "Delete" button on voice note
2. **Expected:** Confirmation dialog appears
3. Click "Delete"
4. **Expected:**
   - Voice note removed
   - Success toast appears
   - API call: DELETE `/voice-notes/{id}`

#### Step 14.4: Record Voice Note (From Memory)

1. Navigate to `/my-memories`
2. Add a memory with voice note option
3. Record voice note
4. **Expected:** Voice note attached to memory

**Edge Cases:**
- ❌ Microphone permission denied → Error toast
- ❌ Browser doesn't support → Error toast
- ✅ Can record multiple voice notes
- ✅ Can delete voice notes
- ✅ Playback works across browsers

---

### Flow 15: Export & Print Features

**Purpose:** Test all export and print functionality

#### Step 15.1: Export Emergency Card PDF

1. Navigate to `/safety`
2. Click "Export PDF" button
3. **Expected:**
   - Loading state shows
   - PDF downloads automatically
   - File name: `emergency_card.pdf`
   - Wallet-sized format (fits in wallet)
   - All emergency information included
   - Success toast appears

#### Step 15.2: Print Emergency Card

1. On `/safety` page
2. Click "Print" button
3. **Expected:**
   - Print preview opens
   - Formatted emergency card
   - Print dialog appears
   - Can cancel or print

#### Step 15.3: Export Medication Schedule PDF

1. Navigate to `/medications`
2. Ensure at least one medication exists
3. Click "Export PDF" button
4. **Expected:**
   - PDF downloads
   - File name: `medication_schedule.pdf`
   - A4 format table
   - All medications listed
   - Success toast appears

#### Step 15.4: Export Daily Routine PDF

1. Navigate to `/my-day`
2. Ensure at least one reminder exists
3. Click "Export PDF" button
4. **Expected:**
   - PDF downloads
   - File name: `daily_routine.pdf`
   - Print-friendly format
   - All reminders listed
   - Success toast appears

#### Step 15.5: Export Memory Book PDF

1. Navigate to `/my-memories`
2. Ensure at least one memory exists
3. Click "Export PDF" button
4. **Expected:**
   - PDF downloads
   - File name: `memory_book.pdf`
   - Multi-page PDF with all memories
   - Photos included
   - Success toast appears

**Edge Cases:**
- ✅ Empty data → Shows appropriate message or disables export
- ✅ Large datasets → Handles correctly (multi-page PDF)
- ❌ Export fails → Error toast with helpful message

---

### Flow 16: Navigation & Responsive Design

**Purpose:** Test navigation and responsive behavior

#### Step 16.1: Desktop Navigation (Sidebar)

1. On desktop viewport (width > 1024px)
2. **Expected:** Sidebar visible on left
3. Test all navigation items:
   - Home → `/home` ✓
   - My Day → `/my-day` ✓
   - My People → `/my-people` ✓
   - Ask Moments → `/ask-moments` ✓
   - My Memories → `/my-memories` ✓
   - My Places → `/my-places` ✓
   - Safety → `/safety` ✓
   - Medications → `/medications` ✓
   - Settings → `/settings` ✓
   - Help → `/help` ✓
4. **Expected:** Active route highlighted

#### Step 16.2: Mobile Navigation (Bottom Nav)

1. Resize to mobile viewport (width < 768px)
2. **Expected:** Bottom navigation bar visible
3. Test all tabs:
   - Home
   - My Day
   - My People
   - Ask Moments
   - More (menu)
4. **Expected:** Active tab highlighted with pink indicator

#### Step 16.3: Navbar Features

1. Check navbar (top bar)
2. **Expected:** Shows:
   - Logo/Brand name
   - Search button (if authenticated)
   - Emergency button (red, if authenticated)
   - User menu (if authenticated)
   - Login/Sign up (if not authenticated)

#### Step 16.4: Keyboard Shortcuts

1. Press `Ctrl+K` (or `Cmd+K` on Mac)
2. **Expected:** Search overlay opens
3. Press `Esc`
4. **Expected:** Search overlay closes

#### Step 16.5: Responsive Breakpoints

1. Test at different viewport sizes:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1024px
   - Large: 1440px
2. **Expected:**
   - Layout adapts correctly
   - Navigation changes (sidebar ↔ bottom nav)
   - Content remains readable
   - No horizontal scrolling

---

### Flow 17: Error Handling & Edge Cases

**Purpose:** Test error scenarios and edge cases

#### Step 17.1: Network Errors

1. Disconnect internet
2. Try to add a medication
3. **Expected:**
   - Error toast appears
   - Helpful error message
   - UI doesn't crash
   - Can retry when online

#### Step 17.2: Invalid Data

1. Try to submit forms with invalid data:
   - Medication with empty name
   - Reminder with invalid time
   - Person with missing relationship
2. **Expected:**
   - Validation errors shown
   - Form doesn't submit
   - Error messages are clear

#### Step 17.3: Large Datasets

1. Add 50+ memories
2. **Expected:**
   - Page loads correctly
   - Performance acceptable
   - Pagination or virtual scrolling (if implemented)

#### Step 17.4: Concurrent Actions

1. Open multiple tabs
2. Add data in one tab
3. Refresh other tab
4. **Expected:** Data syncs correctly

#### Step 17.5: Browser Compatibility

1. Test in different browsers:
   - Chrome
   - Firefox
   - Safari
   - Edge
2. **Expected:** Core functionality works in all

---

## 🧪 Testing Guide

### Pre-Testing Checklist

Before starting tests, ensure:

- [ ] Backend server running on `http://localhost:8000`
- [ ] Frontend server running on `http://localhost:5173`
- [ ] Database initialized and accessible
- [ ] Environment variables configured
- [ ] Browser console open (F12) to monitor errors
- [ ] Network tab open to monitor API calls

### Testing Methodology

1. **Start Fresh:** Clear browser cache and localStorage before each major flow
2. **Test Sequentially:** Follow flows in order (they build on each other)
3. **Verify API Calls:** Check network tab for correct endpoints and data
4. **Check Persistence:** Refresh page after each action to verify data persists
5. **Test Edge Cases:** Try invalid inputs, empty states, errors
6. **Cross-Browser:** Test in multiple browsers
7. **Responsive:** Test on different screen sizes

### Test Data Setup

For comprehensive testing, create test data:

**User Account:**
- Username: `testuser`
- Password: `testpass123`

**Emergency Info:**
- Name: `Sarah Johnson`
- 2-3 emergency contacts
- Medical conditions, allergies, medications
- Doctor information
- Home address

**Medications:**
- Metformin (twice daily, 8:00 AM)
- Lisinopril (once daily, 9:00 AM)
- Aspirin (once daily, 7:00 AM)

**People:**
- Emma Johnson (Granddaughter)
- John Johnson (Son)
- David Johnson (Son)

**Places:**
- Home (current location)
- Doctor's Office
- Pharmacy
- Grocery Store

**Reminders:**
- Morning medication (8:00 AM)
- Doctor appointment (2:00 PM)
- Evening medication (8:00 PM)

**Memories:**
- 5-10 photos with descriptions
- Some mentioning people
- Some mentioning places

**Documents:**
- Upload 1-2 PDF documents for RAG

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/token` - Login
```json
// Request (Form Data)
username: string
password: string

// Response
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

#### POST `/users/` - Register
```json
// Request
{
  "username": "testuser",
  "password": "testpass123"
}

// Response
{
  "id": 1,
  "username": "testuser",
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### GET `/users/me` - Get Current User
```json
// Response
{
  "id": 1,
  "username": "testuser",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Emergency Info Endpoints

#### GET `/emergency/` - Get Emergency Info
```json
// Response
{
  "id": 1,
  "person_name": "Sarah Johnson",
  "emergency_contacts": [
    {
      "name": "David Johnson",
      "phone": "555-1234",
      "relationship": "Son"
    }
  ],
  "medical_conditions": "Diabetes, High Blood Pressure",
  "allergies": "Penicillin",
  "medications": "Metformin, Lisinopril",
  "doctor_name": "Dr. Smith",
  "doctor_phone": "555-5678",
  "home_address": "123 Main St, Portland, OR 97201",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### PUT `/emergency/` - Update Emergency Info
```json
// Request
{
  "person_name": "Sarah Johnson",
  "emergency_contacts": [...],
  "medical_conditions": "Diabetes",
  ...
}
```

### Medication Endpoints

#### GET `/medications/` - List Medications
```json
// Response
[
  {
    "id": 1,
    "name": "Metformin",
    "dosage": "500mg tablet",
    "frequency": "twice",
    "time": "08:00:00",
    "purpose": "For diabetes",
    "doctor_name": "Dr. Smith",
    "pharmacy": "CVS Pharmacy",
    "refill_date": "2024-02-15",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST `/medications/` - Create Medication
```json
// Request
{
  "name": "Metformin",
  "dosage": "500mg tablet",
  "frequency": "twice",
  "time": "08:00:00",
  "purpose": "For diabetes",
  "doctor_name": "Dr. Smith",
  "pharmacy": "CVS Pharmacy",
  "refill_date": "2024-02-15"
}
```

#### POST `/medications/{id}/track` - Track Medication
```json
// Request
{
  "taken": true,
  "date": "2024-01-15"
}
```

### Reminder Endpoints

#### GET `/reminders/` - List Reminders
```json
// Query Params: ?date=2024-01-15 (optional)

// Response
[
  {
    "id": 1,
    "title": "Take morning medication",
    "description": "Remember to take Metformin",
    "date": "2024-01-15",
    "time": "08:00:00",
    "status": "pending",
    "reminder_type": "time",
    "trigger_conditions": null,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST `/reminders/` - Create Reminder
```json
// Request (Regular)
{
  "title": "Take morning medication",
  "description": "Remember to take Metformin",
  "date": "2024-01-15",
  "time": "08:00:00",
  "notification_sound": "gentle-chime",
  "reminder_type": "time"
}

// Request (Smart - Location)
{
  "title": "Call doctor when at pharmacy",
  "description": "Pick up prescription",
  "reminder_type": "location",
  "trigger_conditions": {
    "type": "location",
    "place_id": 1,
    "place_name": "Pharmacy",
    "latitude": 45.5152,
    "longitude": -122.6784,
    "radius": 100
  }
}
```

#### POST `/reminders/{id}/complete` - Complete Reminder
```json
// Response
{
  "id": 1,
  "status": "completed",
  ...
}
```

#### POST `/reminders/{id}/snooze` - Snooze Reminder
```json
// Query Params: ?snooze_minutes=5

// Response
{
  "id": 1,
  "status": "snoozed",
  "snooze_until": "2024-01-15T08:05:00Z",
  ...
}
```

### Memory Endpoints

#### GET `/memories/photos` - List Memories
```json
// Response
[
  {
    "id": 1,
    "image_url": "http://localhost:8000/uploads/memory_1.jpg",
    "description": "Family dinner with Emma",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST `/memories/photos` - Upload Memory
```json
// Request (Form Data)
file: File (image)
description: string (optional)
```

#### POST `/memories/photos/search` - Search by Photo
```json
// Request (Form Data)
file: File (image)

// Response
{
  "matches": [
    {
      "image_url": "...",
      "description": "...",
      "confidence": 0.95
    }
  ]
}
```

### Location Endpoints

#### GET `/locations/` - List Places
```json
// Response
[
  {
    "id": 1,
    "name": "Home",
    "description": "This is where I live",
    "latitude": 45.5152,
    "longitude": -122.6784,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST `/locations/` - Create Place
```json
// Request
{
  "name": "Home",
  "description": "This is where I live",
  "latitude": 45.5152,
  "longitude": -122.6784
}
```

### Chat/RAG Endpoints

#### POST `/rag/chat/query` - Ask Question
```json
// Request
{
  "question": "Who is Emma?"
}

// Response
{
  "question": "Who is Emma?",
  "response": "Emma is your granddaughter...",
  "confidence_score": 0.95,
  "sources_used": 3,
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### GET `/rag/chat/history` - Get Chat History
```json
// Query Params: ?limit=50

// Response
[
  {
    "id": 1,
    "question": "Who is Emma?",
    "response": "Emma is your granddaughter...",
    "confidence_score": 0.95,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST `/rag/documents/upload` - Upload Document
```json
// Request (Form Data)
file: File (PDF)

// Response
{
  "success": true,
  "document_id": 1,
  "filename": "diary.pdf",
  "chunks_processed": 25,
  "message": "Document uploaded successfully"
}
```

### Voice Notes Endpoints

#### POST `/voice-notes/` - Create Voice Note
```json
// Request (Form Data)
audio_file: File (audio blob)
description: string (optional)
memory_id: number (optional)
person_id: string (optional)
reminder_id: number (optional)
```

#### GET `/voice-notes/` - List Voice Notes
```json
// Query Params: ?memory_id=1&person_id=Emma

// Response
[
  {
    "id": 1,
    "audio_url": "http://localhost:8000/voice-notes/1",
    "description": "Voice note about Emma",
    "memory_id": null,
    "person_id": "Emma",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### GET `/voice-notes/{id}` - Get Voice Note Audio
```json
// Response: Audio blob (binary)
```

### Search Endpoints

#### GET `/search` - Global Search
```json
// Query Params: ?q=Emma&type=people,memories

// Response
{
  "results": [
    {
      "type": "people",
      "id": "Emma",
      "title": "Emma Johnson",
      "description": "Granddaughter",
      "url": "/my-people/Emma%20Johnson"
    },
    {
      "type": "memories",
      "id": 1,
      "title": "Family dinner",
      "description": "Dinner with Emma and John",
      "url": "/my-memories/1"
    }
  ]
}
```

### Family Sharing Endpoints

#### POST `/family/invite` - Invite Member
```json
// Request
{
  "email": "member@example.com",
  "username": "member",
  "role": "caregiver"
}

// Response
{
  "id": 1,
  "family_group_id": 1,
  "user_id": 2,
  "role": "caregiver",
  "status": "pending",
  "invited_at": "2024-01-15T10:00:00Z"
}
```

#### GET `/family/members` - List Members
```json
// Response
[
  {
    "id": 1,
    "family_group_id": 1,
    "user_id": 1,
    "role": "owner",
    "status": "accepted",
    "user": {
      "id": 1,
      "username": "testuser"
    }
  }
]
```

#### POST `/family/accept-invite/{member_id}` - Accept Invitation
```json
// Response
{
  "id": 1,
  "status": "accepted",
  "joined_at": "2024-01-15T10:00:00Z"
}
```

#### GET `/family/activity` - Get Activity Feed
```json
// Query Params: ?limit=20

// Response
[
  {
    "id": 1,
    "activity_type": "memory_added",
    "activity_data": {
      "memory_id": 1,
      "description": "Family dinner"
    },
    "user": {
      "id": 1,
      "username": "testuser"
    },
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### Quick Facts Endpoints

#### GET `/users/me/quick-facts` - Get Quick Facts
```json
// Response
{
  "name": "Sarah Johnson",
  "address": "123 Main St, Portland, OR 97201",
  "birthday": "1948-05-15",
  "phone": "555-1234"
}
```

#### PUT `/users/me/quick-facts` - Update Quick Facts
```json
// Request
{
  "name": "Sarah Johnson",
  "address": "123 Main St, Portland, OR 97201",
  "birthday": "1948-05-15",
  "phone": "555-1234"
}
```

---

## 🏗 Architecture

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── home/           # Home page components
│   │   ├── my-day/         # My Day page components
│   │   ├── my-people/      # My People page components
│   │   ├── my-memories/    # My Memories page components
│   │   ├── my-places/      # My Places page components
│   │   ├── ask-moments/    # Chat interface components
│   │   ├── medications/    # Medication components
│   │   ├── safety/         # Emergency info components
│   │   ├── shared/         # Shared/reusable components
│   │   ├── ui/             # Shadcn UI components
│   │   └── lazy/           # Lazy-loaded components
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/              # Custom React hooks
│   │   ├── useChatHistory.ts
│   │   └── useCancelToken.ts
│   ├── lib/                # Utility libraries
│   │   ├── api.ts          # API client
│   │   ├── constants.ts    # Constants
│   │   ├── dateUtils.ts    # Date utilities
│   │   ├── imageUtils.ts   # Image utilities
│   │   ├── cache.ts        # Cache utility
│   │   └── navigation.ts    # Navigation helper
│   ├── services/           # Service layer
│   │   └── notificationService.ts
│   └── App.tsx             # Main app component
```

### Backend Architecture

```
backend/
├── app/
│   ├── main.py             # FastAPI app entry point
│   ├── db/                 # Database configuration
│   │   └── database.py
│   ├── models/             # SQLAlchemy models
│   │   └── models.py
│   ├── schemas/            # Pydantic schemas
│   │   └── schemas.py
│   ├── routers/            # API route handlers
│   │   ├── auth.py
│   │   ├── emergency.py
│   │   ├── medications.py
│   │   ├── reminders.py
│   │   ├── memories.py
│   │   ├── locations.py
│   │   ├── rag.py
│   │   ├── voice_notes.py
│   │   ├── search.py
│   │   └── family.py
│   ├── services/           # Business logic
│   │   ├── rag_service.py
│   │   └── voice_note_service.py
│   └── uploads/            # File uploads directory
```

### Database Schema

**Users Table:**
- id, username, hashed_password, quick_facts (JSON), created_at

**Emergency Info Table:**
- id, user_id (unique), person_name, emergency_contacts (JSON), medical_conditions, allergies, medications, doctor_name, doctor_phone, home_address, created_at, updated_at

**Medications Table:**
- id, user_id, name, dosage, frequency, time, times (JSON), purpose, doctor_name, pharmacy, refill_date, created_at

**Reminders Table:**
- id, user_id, title, description, date, time, notification_sound, status, reminder_type, trigger_conditions (JSON), snooze_until, created_at

**Memory Photos Table:**
- id, user_id, image_path, description, face_encoding, created_at

**Memory Places Table:**
- id, user_id, name, description, latitude, longitude, created_at

**Live Locations Table:**
- id, user_id, latitude, longitude, accuracy, updated_at

**Voice Notes Table:**
- id, user_id, audio_path, description, memory_id, person_id, reminder_id, created_at

**Family Groups Table:**
- id, name, owner_id, created_at

**Family Members Table:**
- id, family_group_id, user_id, role, status, invited_by, invited_at, joined_at

**Activity Logs Table:**
- id, user_id, family_group_id, activity_type, activity_data (JSON), created_at

**Documents Table:**
- id, user_id, filename, content, document_metadata (JSON), created_at

**Chat Messages Table:**
- id, user_id, question, response, confidence_score, created_at

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: Backend won't start

**Symptoms:** `uvicorn` command fails

**Solutions:**
1. Check Python version: `python --version` (needs 3.8+)
2. Verify virtual environment activated
3. Check dependencies installed: `pip list`
4. Verify database connection string in `.env`
5. Check port 8000 not in use: `netstat -an | grep 8000`

#### Issue: Frontend won't start

**Symptoms:** `npm run dev` fails

**Solutions:**
1. Check Node.js version: `node --version` (needs 18+)
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check `.env` file exists with `VITE_API_URL`
4. Verify port 5173 not in use

#### Issue: CORS errors

**Symptoms:** Browser console shows CORS errors

**Solutions:**
1. Verify backend CORS settings include frontend URL
2. Check `VITE_API_URL` matches backend URL exactly
3. Ensure backend is running
4. Clear browser cache

#### Issue: 401 Unauthorized errors

**Symptoms:** API calls return 401

**Solutions:**
1. Check token in localStorage: `localStorage.getItem('access_token')`
2. Verify token not expired
3. Try logging out and back in
4. Check backend `SECRET_KEY` matches

#### Issue: Images not loading

**Symptoms:** Memory photos or person photos don't display

**Solutions:**
1. Check `uploads/` directory exists in backend
2. Verify file permissions
3. Check image URLs in API responses
4. Verify backend static file serving configured

#### Issue: Face recognition not working

**Symptoms:** "Who is this?" doesn't identify people

**Solutions:**
1. Verify `face_recognition` library installed
2. Check photos have clear faces
3. Verify people have photos uploaded
4. Check backend logs for errors

#### Issue: Chat not responding

**Symptoms:** Ask Moments doesn't answer questions

**Solutions:**
1. Verify Google Gemini API key configured
2. Check documents uploaded
3. Verify RAG service initialized
4. Check backend logs for API errors

#### Issue: Notifications not working

**Symptoms:** Reminder notifications don't appear

**Solutions:**
1. Check browser notification permission granted
2. Verify reminder time has passed
3. Check notification service started
4. Verify reminder status is "pending"

#### Issue: PDF export fails

**Symptoms:** Export buttons don't download PDFs

**Solutions:**
1. Check browser console for errors
2. Verify `jspdf` and `html2canvas` installed
3. Check element IDs match export configuration
4. Try different browser

#### Issue: Voice recording not working

**Symptoms:** Can't record voice notes

**Solutions:**
1. Check microphone permission granted
2. Verify browser supports MediaRecorder API
3. Try Chrome or Edge (best support)
4. Check browser console for errors

---

## 📝 Development Notes

### Code Style

- **Frontend:** TypeScript with React functional components
- **Backend:** Python with type hints
- **Formatting:** ESLint (frontend), Black (backend - if configured)

### Git Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit
3. Push and create pull request
4. Review and merge

### Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
```

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/moments_db
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

---

## 📄 License

[Add your license information here]

---

## 👥 Contributors

[Add contributor information]

---

## 🙏 Acknowledgments

- Shadcn UI for component library
- FastAPI for backend framework
- React team for frontend framework
- Google Gemini for AI capabilities

---

**Last Updated:** [Current Date]
**Version:** 1.0.0
**Status:** ✅ Production Ready

# Complete Testing Flows - Phases 0-3 Integration

## 🎯 Overview

This document provides comprehensive testing flows for all features implemented in Phases 0-3, now fully integrated with the backend API.

---

## 📋 Prerequisites

### Backend Setup

1. **Start Backend Server:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```
   - Server should run on `http://localhost:8000`
   - Database tables will be created automatically

### Frontend Setup

1. **Start Frontend Dev Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   - App should run on `http://localhost:5173`

### Environment Variables

- Ensure `frontend/.env.local` has: `VITE_API_URL=http://localhost:8000`
- Backend should have database configured

---

## 🔄 Complete User Journey Testing

### Flow 1: New User Registration & Onboarding

#### Step 1.1: Registration

1. Navigate to `http://localhost:5173`
2. Click "Create account" or go to `/register`
3. Fill in:
   - Username: `testuser`
   - Password: `testpass123`
   - Confirm Password: `testpass123`
4. Click "Register"
5. **Expected:** Redirected to `/onboarding`

#### Step 1.2: Onboarding - Basic Info

1. **Step 1: Basic Information**
   - Enter person's name: `Sarah Johnson`
   - Enter your relationship: `Daughter`
   - (Optional) Upload photo
2. Click "Next"
3. **Expected:** Progress bar updates, moves to Step 2

#### Step 1.3: Onboarding - Emergency Info

1. **Step 2: Emergency Information**
   - Add Emergency Contact 1:
     - Name: `David Johnson`
     - Phone: `555-1234`
     - Relationship: `Son`
   - Click "Add another contact"
   - Add Emergency Contact 2:
     - Name: `Dr. Smith`
     - Phone: `555-5678`
     - Relationship: `Doctor`
   - Medical Conditions: `Diabetes, High Blood Pressure`
   - Allergies: `Penicillin`
   - Medications: `Metformin, Lisinopril`
   - Doctor's Name: `Dr. Smith`
   - Doctor's Phone: `555-5678`
   - Home Address: `123 Main St, Portland, OR 97201`
2. Click "Next"
3. **Expected:** Moves to Step 3

#### Step 1.4: Onboarding - Important People

1. **Step 3: Important People**
   - Click "Add person"
   - Name: `Emma Johnson`
   - Relationship: `Granddaughter`
   - (Optional) Upload photo
   - Click "Add person" again
   - Name: `John Johnson`
   - Relationship: `Son`
2. Click "Next"
3. **Expected:** Moves to Step 4

#### Step 1.5: Onboarding - Routines & Places

1. **Step 4: Daily Routines**
   - Read the placeholder message
   - Click "Next"
2. **Step 5: Important Places**
   - Read the placeholder message
   - Click "Next"
3. **Expected:** Moves to Step 6

#### Step 1.6: Onboarding - Complete

1. **Step 6: Complete**
   - Review summary
   - Click "Complete Setup"
2. **Expected:**
   - Redirected to `/home` (dashboard)
   - Emergency info saved to backend
   - Success message shown

---

### Flow 2: Emergency Information Management

#### Step 2.1: View Emergency Card from Dashboard

1. Navigate to `/home`
2. **Expected:** Emergency Card widget visible in top row (red border)
3. Click the Emergency Card widget
4. **Expected:** Navigated to `/safety`

#### Step 2.2: View Full Emergency Info Page

1. On `/safety` page
2. **Expected:**
   - Emergency card displays all information
   - Name: `Sarah Johnson`
   - Emergency contacts listed with phone links
   - Medical information displayed
   - Home address shown

#### Step 2.3: Edit Emergency Information

1. Click "Edit" button
2. **Expected:** Dialog opens with form
3. Modify:
   - Change allergies to: `Penicillin, Peanuts`
   - Add new emergency contact:
     - Name: `Neighbor Jane`
     - Phone: `555-9999`
     - Relationship: `Neighbor`
4. Click "Save Changes"
5. **Expected:**
   - Success toast appears
   - Dialog closes
   - Information updates immediately
   - Changes persist after page refresh

#### Step 2.4: Print Emergency Card

1. Click "Print" button
2. **Expected:** Print preview opens with formatted emergency card

#### Step 2.5: Access from Navbar

1. Click red "Emergency" button in navbar
2. **Expected:** Navigated to `/safety` page

---

### Flow 3: Medication Management

#### Step 3.1: Navigate to Medications

1. From dashboard (`/home`), click Medications widget
2. **Expected:** Navigated to `/medications`

#### Step 3.2: Add First Medication

1. Click "Add Medication" button
2. Fill in form:
   - Medication Name: `Metformin`
   - Dosage: `500mg tablet`
   - Frequency: Select "Twice daily"
   - Time: `08:00`
   - What it's for: `For diabetes`
   - Prescribed by: `Dr. Smith`
   - Pharmacy: `CVS Pharmacy`
   - Refill Date: Select date 30 days from now
3. Click "Save Medication"
4. **Expected:**
   - Success toast appears
   - Dialog closes
   - Medication card appears in list
   - Medication persists after refresh

#### Step 3.3: Add Second Medication

1. Click "Add Medication"
2. Fill in:
   - Medication Name: `Lisinopril`
   - Dosage: `10mg tablet`
   - Frequency: Select "Once daily"
   - Time: `09:00`
   - What it's for: `For blood pressure`
3. Click "Save Medication"
4. **Expected:** Second medication card appears

#### Step 3.4: Track Medication Intake

1. Find `Metformin` card
2. Click the circle icon (track button)
3. **Expected:**
   - Icon changes to green checkmark
   - Card background updates
   - Success toast appears
4. Click checkmark again
5. **Expected:** Reverts to circle (not taken)

#### Step 3.5: Edit Medication

1. Click "Edit" button on `Metformin` card
2. **Expected:** Dialog opens with pre-filled form
3. Change dosage to: `1000mg tablet`
4. Click "Save Medication"
5. **Expected:**
   - Changes reflect on card
   - Success toast appears
   - Changes persist after refresh

#### Step 3.6: Delete Medication

1. Click trash icon on `Lisinopril` card
2. **Expected:**
   - Medication removed from list
   - Success toast appears
   - Medication stays deleted after refresh

---

### Flow 4: Dashboard Integration

#### Step 4.1: Dashboard Overview

1. Navigate to `/home`
2. **Expected:** All widgets visible:
   - Emergency Card (red, first position)
   - Memory Vault widget
   - Today's Reminders widget
   - Live Location widget
   - Medications widget

#### Step 4.2: Widget Interactions

1. Click Emergency Card widget → Navigates to `/safety` ✓
2. Click Medications widget → Navigates to `/medications` ✓
3. Click Memory Vault widget → Navigates to `/my-people` ✓
4. Click Today widget → Navigates to `/my-day` ✓

#### Step 4.3: Data Persistence

1. Add medication via `/medications`
2. Return to `/home`
3. **Expected:** Medications widget shows updated count
4. Refresh page
5. **Expected:** All data persists, widgets show correct data

---

### Flow 5: Navigation Testing

#### Step 5.1: Desktop Navigation (Sidebar)

1. On desktop viewport
2. **Expected:** Sidebar visible on left
3. Test navigation:
   - Click "Home" → `/home` ✓
   - Click "My Day" → `/my-day` ✓
   - Click "My People" → `/my-people` ✓
   - Click "Ask Moments" → `/ask-moments` ✓
   - Click "My Memories" → `/my-memories` ✓
   - Click "My Places" → `/my-places` ✓
   - Click "Safety" → `/safety` ✓
   - Click "Medications" → `/medications` ✓

#### Step 5.2: Mobile Navigation (Bottom Nav)

1. Resize to mobile viewport
2. **Expected:** Bottom navigation bar visible
3. Test navigation through all tabs
4. **Expected:** Active tab highlighted with pink indicator

#### Step 5.3: Navbar Emergency Button

1. When logged in
2. **Expected:** Red "Emergency" button visible in navbar (desktop)
3. Click button
4. **Expected:** Navigates to `/safety`

---

## 🧪 API Integration Testing

### Test 1: Emergency Info API

```bash
# Get emergency info (after creating)
curl -X GET http://localhost:8000/emergency/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update emergency info
curl -X PUT http://localhost:8000/emergency/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "person_name": "Sarah Johnson",
    "emergency_contacts": [
      {"name": "David", "phone": "555-1234", "relationship": "Son"}
    ],
    "medical_conditions": "Diabetes",
    "allergies": "Penicillin"
  }'
```

### Test 2: Medications API

```bash
# List medications
curl -X GET http://localhost:8000/medications/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create medication
curl -X POST http://localhost:8000/medications/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Metformin",
    "dosage": "500mg",
    "frequency": "twice",
    "time": "08:00:00"
  }'

# Track medication
curl -X POST http://localhost:8000/medications/1/track \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taken": true}'
```

---

## ✅ Success Criteria Checklist

### Phase 0: Foundation

- [x] Environment variables configured
- [x] API interceptor handles auth
- [x] Error boundary catches errors
- [x] Navigation helper works

### Phase 1: Navigation

- [x] Sidebar navigation works (desktop)
- [x] Bottom navigation works (mobile)
- [x] Active states highlight correctly
- [x] All routes accessible

### Phase 2: Landing & Onboarding

- [x] Landing page displays correctly
- [x] Registration redirects to onboarding
- [x] Onboarding flow completes
- [x] Data saves to backend (emergency info)

### Phase 3: Safety Features

- [x] Emergency info saves to backend
- [x] Emergency info loads from backend
- [x] Medications save to backend
- [x] Medications load from backend
- [x] Medication tracking works
- [x] Dashboard widgets display correctly
- [x] Navigation buttons work

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to load emergency information"

**Solution:**

- Check backend is running
- Verify database tables created
- Check authentication token

### Issue: Medications not saving

**Solution:**

- Check time format (should be HH:MM)
- Verify all required fields filled
- Check browser console for API errors

### Issue: Data not persisting

**Solution:**

- Verify backend API calls succeed
- Check database for records
- Clear browser cache and retry

### Issue: CORS errors

**Solution:**

- Verify backend CORS settings include frontend URL
- Check `VITE_API_URL` in frontend `.env.local`

---

## 📊 Database Verification

After testing, verify data in database:

```sql
-- Check emergency info
SELECT * FROM emergency_info;

-- Check medications
SELECT * FROM medications;

-- Check users
SELECT id, username, created_at FROM users;
```

---

## 🎉 Next Steps

After completing all flows:

1. Verify all data persists correctly
2. Test error scenarios (network failures, invalid data)
3. Test edge cases (empty lists, missing fields)
4. Proceed to Phase 4 implementation

---

**Last Updated:** After Phase 3 Backend Integration
**Status:** ✅ Ready for Testing

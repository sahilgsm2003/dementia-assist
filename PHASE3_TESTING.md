# Phase 3 Testing Checklist

## 🧪 Testing Phase 3: Critical Safety Features

### Prerequisites

- [ ] Start the dev server: `cd frontend && npm run dev`
- [ ] Log in or register a new account
- [ ] Complete onboarding (if new user)

---

## ✅ Emergency Information Card Testing

### 1. Dashboard Widget

- [ ] Navigate to `/home` (dashboard)
- [ ] Verify Emergency Card widget appears in the top row
- [ ] Widget should have red border and background
- [ ] Click the widget - should navigate to `/safety`

### 2. Emergency Info Page (`/safety`)

- [ ] Page loads without errors
- [ ] Emergency card displays with all sections:
  - [ ] My Name section
  - [ ] Emergency Contacts section
  - [ ] Medical Information section
  - [ ] Primary Doctor section (if set)
  - [ ] Home Address section
- [ ] "Edit" button opens edit dialog
- [ ] "Print" button triggers print dialog

### 3. Edit Emergency Information

- [ ] Click "Edit" button
- [ ] Dialog opens with form
- [ ] Fill in all fields:
  - [ ] Name
  - [ ] Emergency contacts (add multiple)
  - [ ] Medical conditions
  - [ ] Allergies
  - [ ] Medications
  - [ ] Doctor name and phone
  - [ ] Home address
- [ ] Click "Save Changes"
- [ ] Success toast appears
- [ ] Dialog closes
- [ ] Information updates on the page
- [ ] Refresh page - data persists (localStorage)

### 4. Navbar Emergency Button

- [ ] When logged in, navbar shows red "Emergency" button
- [ ] Click button - navigates to `/safety`
- [ ] Button is hidden on mobile (check responsive)

### 5. Print Functionality

- [ ] Click "Print" button
- [ ] Print preview shows formatted emergency card
- [ ] All information is visible and readable

---

## 💊 Medication Tracker Testing

### 1. Medications Page (`/medications`)

- [ ] Navigate to `/medications`
- [ ] Page loads without errors
- [ ] Empty state shows when no medications added
- [ ] "Add Medication" button is visible

### 2. Add Medication

- [ ] Click "Add Medication" button
- [ ] Dialog opens with medication form
- [ ] Fill in required fields:
  - [ ] Medication Name (e.g., "Metformin")
  - [ ] Dosage (e.g., "500mg tablet")
  - [ ] Frequency (select from dropdown)
  - [ ] Time (time picker)
- [ ] Fill in optional fields:
  - [ ] What it's for
  - [ ] Prescribed by
  - [ ] Pharmacy
  - [ ] Refill Date
- [ ] Click "Save Medication"
- [ ] Success toast appears
- [ ] Dialog closes
- [ ] Medication card appears in list
- [ ] Refresh page - medication persists

### 3. Medication Card

- [ ] Medication card displays:
  - [ ] Medication name (large, bold)
  - [ ] Dosage
  - [ ] Time with clock icon
  - [ ] Frequency
  - [ ] Purpose (if set)
- [ ] Track button (circle icon) is visible
- [ ] "Edit" button is visible
- [ ] Delete button (trash icon) is visible

### 4. Track Medication

- [ ] Click the circle icon on a medication card
- [ ] Icon changes to checkmark (green)
- [ ] Card background updates to show "taken"
- [ ] Click again - reverts to "not taken"
- [ ] Status persists after page refresh

### 5. Edit Medication

- [ ] Click "Edit" button on a medication card
- [ ] Dialog opens with pre-filled form
- [ ] Modify any field
- [ ] Click "Save Medication"
- [ ] Changes reflect on the card
- [ ] Data persists after refresh

### 6. Delete Medication

- [ ] Click trash icon on a medication card
- [ ] Medication is removed from list
- [ ] Success toast appears
- [ ] Medication stays deleted after refresh

### 7. Multiple Medications

- [ ] Add 3-4 different medications
- [ ] All cards display correctly
- [ ] Grid layout works (2 columns on desktop)
- [ ] Each medication can be tracked independently

### 8. Dashboard Widget

- [ ] Navigate to `/home`
- [ ] Medications widget appears in stats grid
- [ ] Shows medication count (or "-" if none)
- [ ] Click widget - navigates to `/medications`

---

## 🎨 UI/UX Testing

### Visual Consistency

- [ ] All cards use consistent styling
- [ ] Colors match design system (red for emergency, pink for primary)
- [ ] Backdrop blur effects work
- [ ] Hover effects on interactive elements
- [ ] Animations are smooth

### Responsive Design

- [ ] Mobile: Emergency card stacks vertically
- [ ] Mobile: Medication cards stack vertically
- [ ] Tablet: Grid adjusts appropriately
- [ ] Desktop: All widgets display in grid

### Accessibility

- [ ] All buttons have proper labels
- [ ] Form inputs are accessible
- [ ] Keyboard navigation works
- [ ] Focus states are visible

---

## 🐛 Common Issues to Check

### If Emergency Card doesn't show:

- [ ] Check browser console for errors
- [ ] Verify EmergencyCard component is imported correctly
- [ ] Check localStorage for "emergency_info" key

### If Medications don't save:

- [ ] Check browser console for errors
- [ ] Verify form validation (required fields)
- [ ] Check localStorage for "medications" key

### If dialogs don't open:

- [ ] Verify @radix-ui/react-dialog is installed
- [ ] Check browser console for errors
- [ ] Verify Dialog component is imported correctly

### If Select dropdown doesn't work:

- [ ] Verify @radix-ui/react-select is installed
- [ ] Check browser console for errors
- [ ] Verify Select component is imported correctly

---

## ✅ Success Criteria

Phase 3 is working correctly if:

1. ✅ Emergency information can be viewed and edited
2. ✅ Medications can be added, edited, and deleted
3. ✅ Medication tracking (taken/not taken) works
4. ✅ All data persists after page refresh
5. ✅ Navigation works from dashboard and navbar
6. ✅ Print functionality works for emergency card
7. ✅ No console errors
8. ✅ UI is responsive and accessible

---

## 📝 Notes

- Currently using localStorage for data persistence
- API integration will replace localStorage in future phases
- All components follow the design system
- Error handling and loading states are implemented

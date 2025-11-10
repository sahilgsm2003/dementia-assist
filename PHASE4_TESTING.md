# Phase 4 Testing Flows

This document provides comprehensive testing flows for Phase 4 features. Test each flow systematically to ensure everything works correctly.

---

## Prerequisites

1. **Backend is running** on `http://localhost:8000`
2. **Frontend is running** on `http://localhost:5173`
3. **User account created** and logged in
4. **Browser console open** to check for errors

---

## Step 4.1: Home Page Testing

### Flow 1.1: Home Page Initial Load

**Steps:**
1. Navigate to `/home` (or `/dashboard` should redirect)
2. Verify page loads without errors
3. Check console for any errors

**Expected Results:**
- ✅ Page loads successfully
- ✅ "Today's Focus" section displays:
  - Current date
  - Personalized greeting (Good morning/afternoon/evening)
  - Weather widget placeholder
- ✅ "Today's Schedule" section shows:
  - Today's reminders (if any)
  - "View full schedule" button
- ✅ "Quick Actions" section displays 6 action buttons
- ✅ "Quick Access Cards" shows 3 cards (My People, My Places, My Information)
- ✅ Emergency Card displays (compact version)
- ✅ Caregiver Section is collapsible

**Test Data Needed:**
- At least 1-2 reminders for today
- At least 1 medication (for widget count)

---

### Flow 1.2: Home Page Navigation

**Steps:**
1. Click "View full schedule" button
2. Verify redirects to `/my-day`
3. Go back to `/home`
4. Click each Quick Action button:
   - Ask Moments
   - Add Document
   - My People
   - Medications
   - My Places
   - My Day
5. Verify each navigates correctly

**Expected Results:**
- ✅ All navigation buttons work
- ✅ Correct routes are accessed
- ✅ No broken links

---

### Flow 1.3: Home Page Empty States

**Steps:**
1. Log in as a new user (no data)
2. Navigate to `/home`
3. Check each section

**Expected Results:**
- ✅ "Today's Schedule" shows "No reminders scheduled for today"
- ✅ Quick Access Cards still display (placeholders)
- ✅ Emergency Card shows "Set up emergency information"
- ✅ No errors or crashes

---

## Step 4.2: My People Testing

### Flow 2.1: My People Page Initial Load

**Steps:**
1. Navigate to `/my-people` (or `/memory-vault` should redirect)
2. Verify page loads

**Expected Results:**
- ✅ Page loads with three tabs:
  - Gallery
  - Add Person
  - Who is this?
- ✅ Gallery tab is active by default
- ✅ If no people exist, shows empty state

---

### Flow 2.2: Add a Person

**Steps:**
1. Click "Add Person" tab
2. Fill in the form:
   - Upload a photo (required)
   - Enter name: "Sarah Johnson"
   - Enter relationship: "Daughter"
   - Add notes: "Lives in London, loves gardening"
3. Click "Add Person"
4. Verify success message
5. Switch to "Gallery" tab

**Expected Results:**
- ✅ Form validates required fields
- ✅ Photo uploads successfully
- ✅ Success toast appears
- ✅ Person appears in Gallery
- ✅ Person card shows:
  - Photo
  - Name: "Sarah Johnson"
  - Relationship: "Daughter"
  - Date added

---

### Flow 2.3: View Person Detail Page

**Steps:**
1. From Gallery, click on a person card
2. Verify person detail page loads

**Expected Results:**
- ✅ URL is `/my-people/Sarah%20Johnson` (or similar)
- ✅ Large photo displays at top
- ✅ Name displays prominently
- ✅ Relationship shows: "This is your Daughter"
- ✅ Quick facts section shows:
  - Number of memories
  - Relationship
  - Last added date
- ✅ "Ask Moments about [Name]" button visible
- ✅ Memories grid shows all photos of this person
- ✅ "Back to My People" button works

---

### Flow 2.4: "Who is this?" Flow

**Steps:**
1. Click "Who is this?" tab
2. Upload a photo (same person or different)
3. Click "Find This Person"
4. Wait for results

**Expected Results:**
- ✅ Search executes
- ✅ If match found:
  - Shows match cards with confidence percentage
  - Clicking a match navigates to person detail page
- ✅ If no match:
  - Shows "No matches found" message
  - Suggests adding person first

---

### Flow 2.5: Person Parsing from Descriptions

**Steps:**
1. Add multiple memories with different description formats:
   - "John Smith, my brother"
   - "Mary - Sister"
   - "David" (just name)
   - "Emma, friend - loves music"
2. Check Gallery

**Expected Results:**
- ✅ All people are extracted correctly
- ✅ Relationships are parsed when available
- ✅ People are grouped by name (case-insensitive)
- ✅ Multiple photos per person are grouped together

---

### Flow 2.6: Ask About Person from Detail Page

**Steps:**
1. Navigate to a person detail page
2. Click "Ask Moments about [Name]" button
3. Verify redirect

**Expected Results:**
- ✅ Redirects to `/ask-moments`
- ✅ Question is pre-filled: "Tell me about [Name]"
- ✅ Question auto-sends after short delay
- ✅ Chat interface shows response

---

## Step 4.3: My Day Testing

### Flow 3.1: My Day Page Initial Load

**Steps:**
1. Navigate to `/my-day` (or `/reminders` should redirect)
2. Verify page loads

**Expected Results:**
- ✅ Page loads with timeline view
- ✅ Shows today's date
- ✅ Progress indicator shows (if reminders exist)
- ✅ Three sections visible:
  - Morning (6 AM - 12 PM)
  - Afternoon (12 PM - 6 PM)
  - Evening (6 PM - 10 PM)
- ✅ Reminders are sorted into correct sections
- ✅ Empty sections don't display

---

### Flow 3.2: Add a Reminder

**Steps:**
1. Click "Add Reminder" button
2. Fill in the form:
   - Title: "Take morning medication"
   - Time: "09:00"
   - Notes: "With breakfast"
   - Notification sound: "Gentle chime"
3. Click "Add Reminder"
4. Close dialog
5. Verify reminder appears

**Expected Results:**
- ✅ Dialog opens correctly
- ✅ Form validates required fields
- ✅ Success toast appears
- ✅ Dialog closes
- ✅ Reminder appears in correct time section (Morning)
- ✅ Progress indicator updates

---

### Flow 3.3: Complete a Reminder

**Steps:**
1. Find a reminder in the timeline
2. Click the circle checkbox
3. Verify completion

**Expected Results:**
- ✅ Checkbox changes to checkmark
- ✅ Reminder card shows:
  - Green background/border
  - Strikethrough text
  - "Taken" badge
- ✅ Progress indicator updates
- ✅ Success toast appears
- ✅ Can uncheck to mark incomplete

---

### Flow 3.4: Delete a Reminder

**Steps:**
1. Find a reminder
2. Click trash icon
3. Verify deletion

**Expected Results:**
- ✅ Reminder disappears immediately
- ✅ Progress indicator updates
- ✅ Success toast appears
- ✅ No errors

---

### Flow 3.5: Timeline Organization

**Steps:**
1. Add reminders at different times:
   - 08:00 (Morning)
   - 14:00 (Afternoon)
   - 19:00 (Evening)
   - 22:30 (Evening)
   - 05:00 (Early morning → Morning)
2. Check timeline

**Expected Results:**
- ✅ Reminders appear in correct sections
- ✅ Reminders sorted by time within each section
- ✅ Early morning (< 6 AM) goes to Morning
- ✅ Late night (>= 10 PM) goes to Evening

---

### Flow 3.6: Progress Tracking

**Steps:**
1. Add 5 reminders
2. Complete 2 of them
3. Check progress indicator

**Expected Results:**
- ✅ Shows "2/5" completed
- ✅ Progress bar shows 40% filled
- ✅ Progress bar animates smoothly

---

### Flow 3.7: Empty State

**Steps:**
1. Ensure no reminders for today
2. Navigate to `/my-day`

**Expected Results:**
- ✅ Shows empty state message
- ✅ Calendar icon displayed
- ✅ Helpful text: "No reminders scheduled for today"
- ✅ "Add Reminder" button still visible

---

## Step 4.4: Ask Moments Testing

### Flow 4.1: Ask Moments Page Initial Load

**Steps:**
1. Navigate to `/ask-moments` (or `/chatbot` should redirect)
2. Verify page loads

**Expected Results:**
- ✅ Page loads with two tabs:
  - Conversation
  - Documents
- ✅ Conversation tab shows:
  - Personalized welcome message
  - Suggested questions (if knowledge base exists)
  - Chat interface
- ✅ Welcome message includes:
  - Time-based greeting (Good morning/afternoon/evening)
  - User's name
  - Helpful information

---

### Flow 4.2: Personalized Welcome

**Steps:**
1. Log in as different users
2. Navigate to `/ask-moments`
3. Check welcome message

**Expected Results:**
- ✅ Greeting changes based on time of day
- ✅ User's name appears in greeting
- ✅ Message adapts based on knowledge base status

---

### Flow 4.3: Suggested Questions

**Steps:**
1. With knowledge base:
   - Verify suggested questions appear
   - Click each suggested question
2. Without knowledge base:
   - Verify different suggested questions appear

**Expected Results:**
- ✅ With knowledge base:
  - Shows: "Who is Sarah?", "What medicine do I take?", etc.
  - Clicking sends question automatically
- ✅ Without knowledge base:
  - Shows: "How do I add documents?", "What can you help me with?", etc.
- ✅ Suggested questions disappear after first message sent

---

### Flow 4.4: Send a Question

**Steps:**
1. Type a question: "Who is Sarah?"
2. Click Send (or press Enter)
3. Wait for response

**Expected Results:**
- ✅ Question appears in chat
- ✅ Typing indicator shows
- ✅ Response appears
- ✅ Response shows:
  - Confidence score
  - Source count
  - Listen button (TTS)
- ✅ Auto-plays audio response
- ✅ Word highlighting works during speech

---

### Flow 4.5: Voice Input

**Steps:**
1. Click microphone button
2. Speak a question
3. Verify transcription
4. Send message

**Expected Results:**
- ✅ Microphone button turns red when listening
- ✅ Red pulse indicator appears
- ✅ Speech is transcribed to input field
- ✅ Can send transcribed message

---

### Flow 4.6: Text-to-Speech

**Steps:**
1. Receive a bot response
2. Click Listen button
3. Verify audio plays
4. Click again to stop

**Expected Results:**
- ✅ Audio plays with natural voice
- ✅ Words highlight as they're spoken
- ✅ Can stop audio by clicking again
- ✅ Button icon changes (Volume2 ↔ VolumeX)

---

### Flow 4.7: Initial Question from Navigation

**Steps:**
1. Navigate to a person detail page
2. Click "Ask Moments about [Name]"
3. Verify auto-send

**Expected Results:**
- ✅ Redirects to `/ask-moments`
- ✅ Question appears in input (briefly)
- ✅ Question auto-sends after ~500ms
- ✅ Response appears automatically

---

### Flow 4.8: Chat History

**Steps:**
1. Send multiple questions
2. Scroll through chat
3. Check message timestamps

**Expected Results:**
- ✅ All messages persist during session
- ✅ Timestamps show correctly
- ✅ Messages scroll smoothly
- ✅ Auto-scrolls to bottom on new message

---

### Flow 4.9: Error Handling

**Steps:**
1. Disconnect backend (or send invalid request)
2. Send a question
3. Verify error handling

**Expected Results:**
- ✅ Error message appears
- ✅ User-friendly error: "I'm sorry, I encountered an error..."
- ✅ No crashes
- ✅ Can retry

---

### Flow 4.10: Confidence Indicators

**Steps:**
1. Send various questions
2. Check confidence scores

**Expected Results:**
- ✅ High confidence (≥80%): Green checkmark
- ✅ Medium confidence (60-79%): Yellow clock
- ✅ Low confidence (<60%): Red alert
- ✅ Percentage displayed clearly

---

## Integration Testing

### Flow I.1: Cross-Feature Navigation

**Steps:**
1. Start at Home page
2. Navigate through all features:
   - Home → My Day → My People → Ask Moments → Home
3. Verify state persists

**Expected Results:**
- ✅ All navigation works smoothly
- ✅ No data loss
- ✅ URLs update correctly
- ✅ Back button works

---

### Flow I.2: Data Consistency

**Steps:**
1. Add a person in My People
2. Add a reminder in My Day
3. Check Home page widgets

**Expected Results:**
- ✅ Home page shows updated counts
- ✅ Today's Schedule shows new reminder
- ✅ Data syncs across pages

---

### Flow I.3: Legacy Route Redirects

**Steps:**
1. Navigate to old routes:
   - `/dashboard` → should redirect to `/home`
   - `/memory-vault` → should redirect to `/my-people`
   - `/reminders` → should redirect to `/my-day`
   - `/chatbot` → should redirect to `/ask-moments`
   - `/locations` → should redirect to `/my-places`

**Expected Results:**
- ✅ All redirects work
- ✅ No 404 errors
- ✅ Correct pages load

---

## Edge Cases & Error Scenarios

### Edge Case 1: Empty States
- ✅ All pages handle empty data gracefully
- ✅ Helpful messages guide users
- ✅ No crashes or errors

### Edge Case 2: Network Errors
- ✅ Error messages are user-friendly
- ✅ Retry options available
- ✅ No data corruption

### Edge Case 3: Large Data Sets
- ✅ Performance remains good with many reminders/people
- ✅ Scrolling is smooth
- ✅ No memory leaks

### Edge Case 4: Browser Compatibility
- ✅ Works in Chrome/Edge (speech features)
- ✅ Graceful degradation in other browsers
- ✅ No console errors

---

## Performance Testing

### Performance Checks:
1. **Page Load Times**
   - Home page: < 2 seconds
   - My People: < 2 seconds
   - My Day: < 2 seconds
   - Ask Moments: < 2 seconds

2. **Interaction Responsiveness**
   - Button clicks: < 100ms
   - Form submissions: < 500ms
   - Navigation: < 200ms

3. **Memory Usage**
   - No memory leaks during extended use
   - Chat history doesn't grow unbounded

---

## Accessibility Testing

### Accessibility Checks:
1. **Keyboard Navigation**
   - ✅ All interactive elements keyboard accessible
   - ✅ Tab order is logical
   - ✅ Focus indicators visible

2. **Screen Reader**
   - ✅ ARIA labels present
   - ✅ Semantic HTML used
   - ✅ Dialog descriptions provided

3. **Visual**
   - ✅ Sufficient color contrast
   - ✅ Text is readable
   - ✅ Icons have text alternatives

---

## Test Checklist Summary

### Step 4.1: Home Page
- [ ] Page loads correctly
- [ ] All sections display
- [ ] Navigation works
- [ ] Empty states handled
- [ ] Data displays correctly

### Step 4.2: My People
- [ ] Page loads correctly
- [ ] Add person works
- [ ] Person detail page works
- [ ] "Who is this?" flow works
- [ ] Person parsing works
- [ ] Navigation to Ask Moments works

### Step 4.3: My Day
- [ ] Page loads correctly
- [ ] Timeline displays correctly
- [ ] Add reminder works
- [ ] Complete reminder works
- [ ] Delete reminder works
- [ ] Progress tracking works
- [ ] Empty state works

### Step 4.4: Ask Moments
- [ ] Page loads correctly
- [ ] Personalized welcome works
- [ ] Suggested questions work
- [ ] Send question works
- [ ] Voice input works
- [ ] Text-to-speech works
- [ ] Initial question from navigation works
- [ ] Error handling works

### Integration
- [ ] Cross-feature navigation works
- [ ] Data consistency maintained
- [ ] Legacy routes redirect correctly

---

## Notes

- **Test Data**: Create test users with various data states (empty, partial, full)
- **Browser**: Test in Chrome/Edge for full speech feature support
- **Console**: Keep browser console open to catch any errors
- **Network**: Test with slow network to verify loading states
- **Mobile**: Test responsive design on mobile viewport

---

## Reporting Issues

When reporting issues, include:
1. **Flow number** (e.g., Flow 2.3)
2. **Steps to reproduce**
3. **Expected vs Actual results**
4. **Browser/OS information**
5. **Console errors** (if any)
6. **Screenshots** (if applicable)

---

**Happy Testing! 🧪**


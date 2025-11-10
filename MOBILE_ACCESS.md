# Accessing Your App on Mobile Phone

## Quick Setup Guide

### Step 1: Find Your Computer's IP Address

**On Windows:**
1. Open PowerShell or Command Prompt
2. Run: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter (usually Wi-Fi or Ethernet)
4. It will look something like: `192.168.1.100` or `10.0.0.5`

**Alternative method:**
- Run: `ipconfig | findstr IPv4`

### Step 2: Start Your Servers

**Backend:**
```bash
cd backend
# Make sure your backend is running on port 8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will now be accessible on your network!

### Step 3: Access from Your Phone

1. **Make sure your phone is on the same WiFi network** as your computer
2. Open your phone's browser
3. Navigate to: `http://YOUR_IP_ADDRESS:5173`
   - Replace `YOUR_IP_ADDRESS` with the IP you found in Step 1
   - Example: `http://192.168.1.100:5173`

### Step 4: Configure API URL (Important!)

The frontend needs to know where to find the backend API. You have two options:

#### Option A: Set Environment Variable (Recommended)
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://YOUR_IP_ADDRESS:8000
```

Then restart the frontend dev server.

#### Option B: Use Browser Console (Quick Test)
1. Open the app on your phone
2. Open browser developer tools (if available)
3. Run in console:
```javascript
localStorage.setItem('api_url', 'http://YOUR_IP_ADDRESS:8000')
```

### Troubleshooting

**Can't access the site:**
- ✅ Check Windows Firewall - it may be blocking port 5173
- ✅ Ensure both devices are on the same WiFi network
- ✅ Verify the IP address is correct
- ✅ Make sure the frontend server shows "Network: http://0.0.0.0:5173" when starting

**API calls failing:**
- ✅ Check that backend is running on `0.0.0.0:8000` (not just localhost)
- ✅ Verify the `VITE_API_URL` environment variable is set correctly
- ✅ Check browser console for CORS errors

**Windows Firewall Fix:**
If Windows Firewall blocks access:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js/Vite or allow port 5173
4. Or temporarily disable firewall for testing

### Security Note

⚠️ **For Development Only**: The current CORS configuration allows all origins. 
Before deploying to production, update `backend/app/main.py` to restrict allowed origins.


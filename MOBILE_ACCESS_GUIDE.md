# 📱 Accessing Your Local Website on Mobile

This guide will help you access your locally running website from your phone.

## Prerequisites

1. ✅ Your phone and computer must be on the **same Wi-Fi network**
2. ✅ Backend must be running on port 8000
3. ✅ Frontend must be running on port 5173

## Step-by-Step Instructions

### Step 1: Find Your Computer's IP Address

#### On Windows:
1. Open PowerShell or Command Prompt
2. Run: `ipconfig`
3. Look for **IPv4 Address** under your active network adapter (usually Wi-Fi or Ethernet)
4. It will look like: `192.168.1.XXX` or `10.0.0.XXX`

**Quick command:**
```powershell
ipconfig | findstr IPv4
```

#### On Mac/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
or
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### Step 2: Configure Frontend to Use Your IP Address

The frontend needs to know your computer's IP address to connect to the backend API.

#### Option A: Using Environment Variable (Recommended)

1. Create a `.env` file in the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Create `.env` file with your IP address:
   ```
   VITE_API_URL=http://YOUR_IP_ADDRESS:8000
   ```
   
   **Example:** If your IP is `192.168.1.100`, use:
   ```
   VITE_API_URL=http://192.168.1.100:8000
   ```

3. **Restart your frontend dev server** after creating/updating the `.env` file

#### Option B: Quick Test (Temporary)

You can also modify `frontend/src/services/api.ts` temporarily:
- Change line 7 from: `baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"`
- To: `baseURL: "http://YOUR_IP_ADDRESS:8000"`

⚠️ **Remember to revert this change later!**

### Step 3: Ensure Backend Allows Network Access

The backend is already configured to accept connections from any origin (CORS is set to `allow_origins=["*"]`), but make sure it's running and accessible.

To verify backend is accessible:
- On your computer, try: `http://YOUR_IP_ADDRESS:8000/` in a browser
- You should see: `{"status":"ok","message":"Welcome to the Moments Life Assistant API!"}`

### Step 4: Access from Your Phone

1. **Make sure both servers are running:**
   - Backend: Usually `uvicorn app.main:app --reload` or similar
   - Frontend: Usually `npm run dev` or `yarn dev`

2. **On your phone's browser**, navigate to:
   ```
   http://YOUR_IP_ADDRESS:5173
   ```
   
   **Example:** `http://192.168.1.100:5173`

3. The website should load! 🎉

## Troubleshooting

### ❌ "This site can't be reached" or Connection Refused

**Possible causes:**
1. **Firewall blocking:** Windows Firewall might be blocking the ports
   - Solution: Allow ports 5173 and 8000 through Windows Firewall
   - Or temporarily disable firewall for testing

2. **Wrong IP address:** Make sure you're using the correct IP
   - Check `ipconfig` again
   - Make sure you're on the same Wi-Fi network

3. **Servers not running:** Verify both backend and frontend are running

### ❌ API calls fail / "Network Error"

**Possible causes:**
1. **CORS issues:** Backend CORS is already configured, but double-check
2. **Wrong API URL:** Make sure `.env` file has the correct IP address
3. **Backend not accessible:** Test `http://YOUR_IP_ADDRESS:8000/` directly on phone

### ❌ Can't find IP address

- Make sure you're connected to Wi-Fi (not mobile data)
- Try `ipconfig /all` for more details
- On Windows, look for the adapter that shows "Media State: Connected"

## Quick Reference

```bash
# Find your IP (Windows)
ipconfig | findstr IPv4

# Find your IP (Mac/Linux)
ifconfig | grep "inet " | grep -v 127.0.0.1

# Create .env file in frontend folder
cd frontend
echo VITE_API_URL=http://YOUR_IP:8000 > .env

# Restart frontend after creating .env
npm run dev
```

## Security Note

⚠️ **For Development Only:** This setup allows access from any device on your network. For production:
- Use proper authentication
- Restrict CORS origins
- Use HTTPS
- Configure firewall rules properly

## Alternative: Using ngrok (For Testing Outside Network)

If you want to test from outside your local network, you can use ngrok:

1. Install ngrok: https://ngrok.com/
2. Run: `ngrok http 5173` (for frontend)
3. Run: `ngrok http 8000` (for backend in another terminal)
4. Use the ngrok URLs in your `.env` file

This creates a public URL that tunnels to your local server.

